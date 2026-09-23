-- ============================================================
-- Mining Consortium — migration 05: Website enquiries
-- Run this in the Supabase SQL Editor AFTER 04_notifications.sql.
--
-- Enquiries come from the public homepage form. The website saves them
-- with the service-role key after validating them, so there is no public
-- insert policy: nobody can write to this table directly. Only admins
-- can read and manage enquiries.
-- ============================================================

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 200),
  company text check (char_length(company) <= 200),
  email text not null check (char_length(email) <= 320),
  phone text check (char_length(phone) <= 50),
  country text check (char_length(country) <= 100),
  interest text not null check (interest in ('buying', 'selling', 'partnership', 'other')),
  commodity text check (char_length(commodity) <= 200),
  message text not null check (char_length(message) between 1 and 5000),
  status text not null default 'new'
    check (status in ('new', 'in_review', 'converted', 'declined')),
  project_id uuid references public.projects (id) on delete set null,
  -- Salted hash of the sender's IP, used only for rate limiting.
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index enquiries_created_idx on public.enquiries (created_at desc);
create index enquiries_ip_idx on public.enquiries (ip_hash, created_at);

create trigger enquiries_updated_at
  before update on public.enquiries
  for each row execute function public.set_updated_at();

alter table public.enquiries enable row level security;

create policy "admins can view enquiries"
  on public.enquiries for select to authenticated using (public.is_admin());
create policy "admins can update enquiries"
  on public.enquiries for update to authenticated using (public.is_admin());
create policy "admins can delete enquiries"
  on public.enquiries for delete to authenticated using (public.is_admin());
