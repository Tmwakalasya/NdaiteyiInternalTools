-- ============================================================
-- Mining Consortium — migration 03: Member documents (Schedule 1)
-- Run this in the Supabase SQL Editor AFTER 02_projects_documents.sql.
--
-- Per-member due-diligence uploads (certified passport/ID, certificate of
-- incorporation, proof of authority, bank confirmation letter, specimen
-- signature, company profile).
--
-- Access rule (chosen by the owner): ADMINS can view every member's files;
-- a member can view only the files THEY uploaded. Files live in a private
-- storage bucket and are served through short-lived signed URLs.
-- ============================================================

create table public.member_documents (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  doc_type text not null,
  label text not null,
  storage_path text not null,
  file_name text not null,
  size_bytes bigint,
  mime_type text,
  uploaded_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index member_documents_member_idx on public.member_documents (member_id);

alter table public.member_documents enable row level security;

-- Admins see everything; a member sees the documents they uploaded.
create policy "view member documents" on public.member_documents
  for select to authenticated
  using (public.is_admin() or uploaded_by = auth.uid());
create policy "upload member documents" on public.member_documents
  for insert to authenticated
  with check (uploaded_by = auth.uid());
create policy "update member documents" on public.member_documents
  for update to authenticated
  using (public.is_admin() or uploaded_by = auth.uid());
create policy "delete member documents" on public.member_documents
  for delete to authenticated
  using (public.is_admin() or uploaded_by = auth.uid());

-- ---- Private storage bucket for the sensitive KYC files ------
insert into storage.buckets (id, name, public)
values ('member-documents', 'member-documents', false)
on conflict (id) do nothing;

-- storage.objects.owner is set to the uploader's id by the storage API.
create policy "read member doc files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'member-documents'
    and (public.is_admin() or owner = auth.uid())
  );
create policy "upload member doc files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'member-documents');
create policy "update member doc files" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'member-documents'
    and (public.is_admin() or owner = auth.uid())
  );
create policy "delete member doc files" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'member-documents'
    and (public.is_admin() or owner = auth.uid())
  );
