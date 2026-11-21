-- Live chat between website visitors and the admin. Run once in the Supabase SQL editor.
create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  token_hash text unique,                           -- sha256 of the visitor's private token (never the token itself)
  user_id uuid,                                     -- set when the visitor is signed in
  name text,
  email text,
  status text not null default 'open' check (status in ('open','closed')),
  last_message_at timestamptz not null default now(),
  last_message_preview text,
  unread_admin int not null default 0,              -- visitor messages the admin has not opened yet
  unread_visitor int not null default 0,            -- agent messages the visitor has not opened yet
  last_visitor_seen_at timestamptz,
  last_admin_notified_at timestamptz,
  last_visitor_notified_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists chat_threads_user_idx on public.chat_threads (user_id) where user_id is not null;
create index if not exists chat_threads_recent_idx on public.chat_threads (last_message_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender text not null check (sender in ('visitor','agent')),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_thread_idx on public.chat_messages (thread_id, created_at);

-- No policies on purpose: the browser can never read these tables directly. Only the server (service role) can.
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
