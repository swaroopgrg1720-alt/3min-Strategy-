-- Marks automatic replies so the admin can tell them apart from human replies. Run once.
alter table public.chat_messages add column if not exists is_auto boolean not null default false;
