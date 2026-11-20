-- Renewals extend ONE specific license. Run this once in the Supabase SQL editor.
-- (Also safe if 004_months.sql was already run: every change is "if not exists" / "or replace".)
alter table public.orders add column if not exists months int not null default 1 check (months between 1 and 12);
alter table public.orders add column if not exists renew_license_id uuid references public.licenses(id) on delete set null;

create or replace function public.fulfil_order(
  p_order_id text, p_ref text, p_key_hash text, p_key_prefix text, p_key_cipher text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  o public.orders%rowtype;
  existing public.licenses%rowtype;
  lic_id uuid;
  span interval;
begin
  select * into o from public.orders where order_id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if o.order_status in ('refunded','failed') then raise exception 'order_not_fulfillable'; end if;
  if o.license_id is not null then return o.license_id; end if;      -- already fulfilled (idempotent)

  span := make_interval(days => 30 * greatest(o.months, 1));

  if o.renew_license_id is not null then
    -- Renewal: add the paid time to that exact license. No new license is created.
    select * into existing from public.licenses where id = o.renew_license_id for update;
    if not found then raise exception 'license_not_found'; end if;
    if existing.status = 'revoked' then raise exception 'license_revoked'; end if;
    update public.licenses
       set expiration_date = greatest(coalesce(expiration_date, now()), now()) + span
     where id = existing.id;
    lic_id := existing.id;
  else
    -- A normal purchase always creates a new license (one license per MT5 account).
    insert into public.licenses (license_ref, order_id, customer_email, plan, expiration_date, key_hash, key_prefix, key_ciphertext)
    values (p_ref, o.order_id, lower(o.customer_email), o.plan,
            case when o.plan = 'monthly' then now() + span else null end,
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
