-- ============================================================
-- Mining Consortium — database schema
-- Paste this whole file into the Supabase SQL Editor and Run.
-- ============================================================

-- Login accounts get a "profile" row that stores their role.
-- role is either 'admin' (can manage everything) or 'member' (can view).
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

-- The consortium member directory (this is the Excel sheet, upgraded).
create table public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  country text,
  title text,
  email text,
  phone text,
  organisation text,
  role_in_transaction text,
  bio text,
  responsibilities text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Newsletter / news posts shown on the site (and optionally emailed).
create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  author_id uuid references public.profiles (id) on delete set null,
  emailed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Keep members.updated_at accurate automatically.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger members_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();

-- Every new login account automatically gets a profile row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by the security rules below.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- Row Level Security: signed-in people can read, admins can write.
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.news_posts enable row level security;

create policy "signed-in users can view profiles"
  on public.profiles for select to authenticated using (true);
create policy "admins can update profiles"
  on public.profiles for update to authenticated using (public.is_admin());

create policy "signed-in users can view members"
  on public.members for select to authenticated using (true);
create policy "admins can add members"
  on public.members for insert to authenticated with check (public.is_admin());
create policy "admins can edit members"
  on public.members for update to authenticated using (public.is_admin());
create policy "admins can remove members"
  on public.members for delete to authenticated using (public.is_admin());

create policy "signed-in users can view news"
  on public.news_posts for select to authenticated using (true);
create policy "admins can add news"
  on public.news_posts for insert to authenticated with check (public.is_admin());
create policy "admins can edit news"
  on public.news_posts for update to authenticated using (public.is_admin());
create policy "admins can delete news"
  on public.news_posts for delete to authenticated using (public.is_admin());

-- ------------------------------------------------------------
-- Storage bucket for member photos.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "anyone can view photos"
  on storage.objects for select using (bucket_id = 'photos');
create policy "admins can upload photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.is_admin());
create policy "admins can replace photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'photos' and public.is_admin());
create policy "admins can delete photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.is_admin());
