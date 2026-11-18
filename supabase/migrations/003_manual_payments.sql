-- Manual crypto payments. Run in Supabase SQL Editor AFTER 001 and 002.

create table if not exists public.payment_methods (
  id            uuid primary key default gen_random_uuid(),
  coin          text not null check (char_length(coin) between 2 and 12),
  network       text not null check (char_length(network) between 2 and 40),
  address       text not null check (char_length(address) between 10 and 128),
  is_stablecoin boolean not null default true,      -- true: customer sends the USD price 1:1 (USDT/USDC). false: send the equivalent value.
  instructions  text check (instructions is null or char_length(instructions) <= 500),
  enabled       boolean not null default true,
  created_at    timestamptz not null default now()
);
alter table public.payment_methods enable row level security;
revoke all on public.payment_methods from anon, authenticated;   -- only the server (service role) reads/writes

alter table public.orders
  add column if not exists payment_method_id uuid references public.payment_methods(id) on delete set null,
  add column if not exists wallet_address    text,              -- snapshot of the address shown to the customer
  add column if not exists is_stablecoin     boolean not null default true,
  add column if not exists pay_note          text,
  add column if not exists tx_hash           text,
  add column if not exists proof_note        text,
  add column if not exists submitted_at      timestamptz,
  add column if not exists reviewed_at       timestamptz,
  add column if not exists reviewed_by       text,
  add column if not exists reject_reason     text;

grant select on public.orders to authenticated;   -- RLS still limits rows to the customer's own email
