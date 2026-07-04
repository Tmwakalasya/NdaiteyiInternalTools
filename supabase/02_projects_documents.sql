-- ============================================================
-- Mining Consortium — migration 02: Projects & Documents
-- Run this in the Supabase SQL Editor AFTER schema.sql.
--
-- Adds:
--   * projects            — one row per transaction/deal
--   * project_stages      — the SEZ Africa phases for each project
--   * project_stage_items — the tick-off checklist inside each phase
--   * documents           — files uploaded to the private "documents" bucket
--
-- Access: any signed-in member can add and update projects and documents
-- (a collaborative consortium). Everyone signed in can view.
-- ============================================================

-- ---- Projects -------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'on_hold', 'completed')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create table public.project_stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  description text,
  position int not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index project_stages_project_idx on public.project_stages (project_id, position);

create table public.project_stage_items (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.project_stages (id) on delete cascade,
  label text not null,
  checked boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index project_stage_items_stage_idx on public.project_stage_items (stage_id, position);

-- ---- Documents ------------------------------------------------
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  storage_path text not null,
  size_bytes bigint,
  mime_type text,
  project_id uuid references public.projects (id) on delete set null,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index documents_project_idx on public.documents (project_id);
create index documents_created_idx on public.documents (created_at desc);

-- ---- Row Level Security --------------------------------------
alter table public.projects enable row level security;
alter table public.project_stages enable row level security;
alter table public.project_stage_items enable row level security;
alter table public.documents enable row level security;

-- Any signed-in member can read and write projects & their stages/items.
create policy "members view projects" on public.projects
  for select to authenticated using (true);
create policy "members write projects" on public.projects
  for all to authenticated using (true) with check (true);

create policy "members view stages" on public.project_stages
  for select to authenticated using (true);
create policy "members write stages" on public.project_stages
  for all to authenticated using (true) with check (true);

create policy "members view stage items" on public.project_stage_items
  for select to authenticated using (true);
create policy "members write stage items" on public.project_stage_items
  for all to authenticated using (true) with check (true);

create policy "members view documents" on public.documents
  for select to authenticated using (true);
create policy "members write documents" on public.documents
  for all to authenticated using (true) with check (true);

-- ---- Private storage bucket for documents --------------------
-- public = false, so files are only reachable through short-lived signed
-- URLs that the app generates for signed-in members.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "members read document files" on storage.objects
  for select to authenticated using (bucket_id = 'documents');
create policy "members upload document files" on storage.objects
  for insert to authenticated with check (bucket_id = 'documents');
create policy "members update document files" on storage.objects
  for update to authenticated using (bucket_id = 'documents');
create policy "members delete document files" on storage.objects
  for delete to authenticated using (bucket_id = 'documents');
