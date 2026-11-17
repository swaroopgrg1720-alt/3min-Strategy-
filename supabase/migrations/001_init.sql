-- 3MIN SCALP schema. Run in Supabase Dashboard -> SQL Editor (or `supabase db push`).
-- All writes happen server-side with the service-role key. Customers can only READ their own rows (RLS).

create extension if not exists pgcrypto;

-- ───────────── Orders ─────────────
create table if not exists public.orders (
  order_id        text primary key,
  customer_email  text not null,
  product         text not null default '3MIN SCALP',
  plan            text not null check (plan in ('monthly','lifetime')),
  amount_usd      numeric(10,2) not null,
  coin            text not null,
  network         text not null,
  payment_status  text not null default 'awaiting_payment'
                  check (payment_status in ('awaiting_payment','payment_detected','payment_confirmed','order_complete','payment_expired')),
  order_status    text not null default 'pending'
                  check (order_status in ('pending','payment_detected','confirmed','failed','expired','refunded')),
  provider_ref    text,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz,
  confirmed_at    timestamptz,
  license_id      uuid
);
create index if not exists orders_email_idx on public.orders (lower(customer_email));

-- ───────────── Licenses ─────────────
create table if not exists public.licenses (
  id               uuid primary key default gen_random_uuid(),
  license_ref      text not null unique,                 -- human-friendly id, e.g. LIC-7K2M9QXA
  order_id         text references public.orders(order_id),
  customer_email   text not null,
  product          text not null default '3MIN SCALP',
  plan             text not null check (plan in ('monthly','lifetime')),
  start_date       timestamptz not null default now(),
  expiration_date  timestamptz,                          -- required for monthly, NULL for lifetime
  status           text not null default 'active' check (status in ('active','suspended','revoked')),
  key_hash         text not null unique,                 -- HMAC-SHA256 of the key (used for validation)
  key_prefix       text not null,                        -- first chars, for admin lookup only
  key_ciphertext   text not null,                        -- AES-256-GCM, so the owner can re-view their key
  mt5_account      text,
  activation_status text not null default 'not_activated' check (activation_status in ('not_activated','activated')),
  activated_at     timestamptz,
  last_validated_at timestamptz,
  created_at       timestamptz not null default now(),
  constraint plan_expiry check (
    (plan = 'monthly' and expiration_date is not null) or (plan = 'lifetime' and expiration_date is null)
  )
);
create index if not exists licenses_email_idx on public.licenses (lower(customer_email));

-- ───────────── Products (EX5 versions; the file lives in a PRIVATE storage bucket) ─────────────
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null default '3MIN SCALP',
  version       text not null,
  storage_path  text not null,                           -- path inside the private "ea-files" bucket
  release_notes text,
  is_current    boolean not null default false,
  created_at    timestamptz not null default now()
);
create unique index if not exists one_current_product on public.products (name) where is_current;

-- ───────────── Logs / support ─────────────
create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references public.licenses(id),
  user_email text not null,
  product_id uuid references public.products(id),
  ip text,
  created_at timestamptz not null default now()
);

create table if not exists public.license_events (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references public.licenses(id),
  event text not null,
  detail jsonb,
  ip text,
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  name text,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open','answered','closed')),
  created_at timestamptz not null default now()
);

-- ───────────── Row Level Security ─────────────
alter table public.orders          enable row level security;
alter table public.licenses        enable row level security;
alter table public.products        enable row level security;
alter table public.downloads       enable row level security;
alter table public.license_events  enable row level security;
alter table public.support_tickets enable row level security;

-- Signed-in customers may read ONLY their own orders and licenses (matched on verified auth email).
create policy "own orders"   on public.orders   for select to authenticated
  using (lower(customer_email) = lower(auth.jwt() ->> 'email'));
create policy "own licenses" on public.licenses for select to authenticated
  using (lower(customer_email) = lower(auth.jwt() ->> 'email'));
create policy "own tickets"  on public.support_tickets for select to authenticated
  using (lower(customer_email) = lower(auth.jwt() ->> 'email'));

-- Hide secrets from customers at COLUMN level (hash + ciphertext are never selectable by browser roles).
revoke all on public.licenses from anon, authenticated;
grant select (id, license_ref, order_id, customer_email, product, plan, start_date, expiration_date,
              status, key_prefix, mt5_account, activation_status, activated_at, created_at)
  on public.licenses to authenticated;
revoke all on public.orders, public.products, public.downloads, public.license_events, public.support_tickets from anon;
-- (service_role bypasses RLS and is used only in server code.)

-- ───────────── Atomic, idempotent fulfilment ─────────────
-- Called by the server after a VERIFIED payment. Locks the order row so duplicate webhooks cannot create
-- two licenses. If the customer already has a monthly license, it is renewed (+30 days) instead.
create or replace function public.fulfil_order(
  p_order_id text, p_ref text, p_key_hash text, p_key_prefix text, p_key_cipher text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  o public.orders%rowtype;
  existing public.licenses%rowtype;
  lic_id uuid;
begin
  select * into o from public.orders where order_id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if o.order_status in ('refunded','failed') then raise exception 'order_not_fulfillable'; end if;
  if o.license_id is not null then return o.license_id; end if;      -- already fulfilled (idempotent)

  if o.plan = 'monthly' then
    select * into existing from public.licenses
     where lower(customer_email) = lower(o.customer_email) and plan = 'monthly' and status = 'active'
     order by expiration_date desc limit 1;
  end if;

  if found and o.plan = 'monthly' then
    update public.licenses
       set expiration_date = greatest(coalesce(expiration_date, now()), now()) + interval '30 days'
     where id = existing.id;
    lic_id := existing.id;
  else
    insert into public.licenses (license_ref, order_id, customer_email, plan, expiration_date, key_hash, key_prefix, key_ciphertext)
    values (p_ref, o.order_id, lower(o.customer_email), o.plan,
            case when o.plan = 'monthly' then now() + interval '30 days' else null end,
            p_key_hash, p_key_prefix, p_key_cipher)
    returning id into lic_id;
  end if;

  update public.orders
     set order_status = 'confirmed', payment_status = 'order_complete', confirmed_at = now(), license_id = lic_id
   where order_id = o.order_id;
  return lic_id;
end $$;

revoke all on function public.fulfil_order(text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.fulfil_order(text,text,text,text,text) to service_role;

-- ───────────── Storage ─────────────
-- Create a PRIVATE bucket named "ea-files" (Dashboard -> Storage -> New bucket, Public = OFF).
-- Never make it public. Downloads go through /api/download which issues 60-second signed URLs.
insert into storage.buckets (id, name, public) values ('ea-files', 'ea-files', false) on conflict (id) do nothing;
