-- ============================================================
-- Mining Consortium — migration 04: Notifications
-- Run this in the Supabase SQL Editor AFTER 03_member_documents.sql.
-- ============================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  href text,
  entity_key text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index notifications_entity_key_idx
  on public.notifications (user_id, entity_key);

create index notifications_user_unread_idx
  on public.notifications (user_id, read_at, created_at desc);

alter table public.notifications enable row level security;

create policy "Users read own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users update own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "Users insert own notifications"
  on public.notifications for insert
  with check (user_id = auth.uid());
