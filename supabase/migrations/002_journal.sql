-- Trading journal. Run in Supabase -> SQL Editor AFTER 001_init.sql.
-- Each customer can only see and change their OWN trades (Row Level Security).

create table if not exists public.journal_trades (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  opened_at    timestamptz not null default now(),
  symbol       text not null check (char_length(symbol) between 1 and 20),
  direction    text not null check (direction in ('buy','sell')),
  lots         numeric(12,2) check (lots is null or lots >= 0),
  entry_price  numeric(18,5),
  exit_price   numeric(18,5),
  stop_loss    numeric(18,5),
  take_profit  numeric(18,5),
  pnl          numeric(14,2) not null,                 -- net result in account currency (after fees)
  risk_amount  numeric(14,2) check (risk_amount is null or risk_amount > 0),  -- money risked, for R-multiples
  setup        text check (setup is null or char_length(setup) <= 60),
  notes        text check (notes is null or char_length(notes) <= 2000),
  created_at   timestamptz not null default now()
);
create index if not exists journal_user_time_idx on public.journal_trades (user_id, opened_at desc);

alter table public.journal_trades enable row level security;

create policy "own trades read"   on public.journal_trades for select to authenticated using (user_id = auth.uid());
create policy "own trades insert" on public.journal_trades for insert to authenticated with check (user_id = auth.uid());
create policy "own trades update" on public.journal_trades for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own trades delete" on public.journal_trades for delete to authenticated using (user_id = auth.uid());

revoke all on public.journal_trades from anon;
grant select, insert, update, delete on public.journal_trades to authenticated;
