-- TradingView indicator sold next to the EA. Customers pay, then the owner grants access to their TradingView username.
alter table public.orders add column if not exists tv_username text;
alter table public.orders add column if not exists renew_access_id uuid;

create table if not exists public.indicator_access (
  id uuid primary key default gen_random_uuid(),
  order_id text unique references public.orders(order_id),
  customer_email text not null,
  tv_username text not null,
  plan text not null check (plan in ('monthly','lifetime')),
  months int not null default 1,
  status text not null default 'pending' check (status in ('pending','active','revoked')),
  expires_at timestamptz,
  granted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists indicator_access_email_idx on public.indicator_access (lower(customer_email));
alter table public.indicator_access enable row level security;
create policy "own indicator access" on public.indicator_access for select to authenticated
  using (lower(customer_email) = lower(auth.jwt() ->> 'email'));
revoke all on public.indicator_access from anon, authenticated;
grant select on public.indicator_access to authenticated;

-- Called only by the server after a verified payment. Idempotent.
create or replace function public.fulfil_indicator_order(p_order_id text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  o public.orders%rowtype;
  a public.indicator_access%rowtype;
  acc_id uuid;
  n int;
  span interval;
begin
  select * into o from public.orders where order_id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if o.order_status in ('refunded','failed') then raise exception 'order_not_fulfillable'; end if;
  if o.order_status = 'confirmed' then
    return coalesce(o.renew_access_id, (select id from public.indicator_access where order_id = o.order_id));
  end if;

  n := greatest(o.months, 1);
  span := make_interval(days => 30 * n);

  if o.renew_access_id is not null then
    select * into a from public.indicator_access where id = o.renew_access_id for update;
    if not found then raise exception 'access_not_found'; end if;
    if a.status = 'revoked' then raise exception 'access_revoked'; end if;
    if a.status = 'pending' then
      update public.indicator_access set months = a.months + n where id = a.id;
    elsif a.plan = 'monthly' then
      update public.indicator_access set expires_at = greatest(coalesce(a.expires_at, now()), now()) + span where id = a.id;
    end if;
    acc_id := a.id;
  else
    insert into public.indicator_access (order_id, customer_email, tv_username, plan, months)
    values (o.order_id, lower(o.customer_email), coalesce(o.tv_username, '(missing)'), o.plan, n)
    returning id into acc_id;
  end if;

  update public.orders set order_status = 'confirmed', payment_status = 'order_complete', confirmed_at = now() where order_id = o.order_id;
  return acc_id;
end $$;
revoke all on function public.fulfil_indicator_order(text) from public, anon, authenticated;
grant execute on function public.fulfil_indicator_order(text) to service_role;
