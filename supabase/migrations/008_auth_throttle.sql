-- Failed-login / code-attempt log used to lock brute-force attacks. Server only. Run once.
create table if not exists public.auth_attempts (
  id bigserial primary key,
  k text not null,                       -- sha256 of "action:identifier" (never the raw email or IP)
  at timestamptz not null default now()
);
create index if not exists auth_attempts_k_idx on public.auth_attempts (k, at desc);
alter table public.auth_attempts enable row level security;   -- no policies: only the service role can touch it
revoke all on public.auth_attempts from anon, authenticated;
