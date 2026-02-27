-- Supabase Migration: Initial Schema for PhotosApp (Narratives)
-- This migration creates all tables, RLS policies, and storage buckets
-- to replicate the Django backend functionality using Supabase.

-- ============================================================
-- 1. Profiles (extends Supabase Auth users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text,
  first_name text not null default '',
  last_name text not null default '',
  bio text not null default '',
  profile_image_url text,
  default_map_view text not null default 'globe' check (default_map_view in ('globe', 'map')),
  date_created timestamptz not null default now(),
  date_modified timestamptz not null default now()
);

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', new.email),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. Narratives
-- ============================================================
create table public.narratives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  cover_image_url text,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  start_date date,
  end_date date,
  location_summary text not null default '',
  date_created timestamptz not null default now(),
  date_modified timestamptz not null default now()
);

create index idx_narratives_owner on public.narratives(owner_id);
create index idx_narratives_created on public.narratives(date_created desc);

-- ============================================================
-- 3. Media Items
-- ============================================================
create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  file_url text not null,
  media_type text not null default 'photo' check (media_type in ('photo', 'video')),
  thumbnail_small_url text,
  thumbnail_medium_url text,
  thumbnail_large_url text,
  capture_date timestamptz,
  latitude double precision,
  longitude double precision,
  camera_make text not null default '',
  camera_model text not null default '',
  description text not null default '',
  narrative_id uuid references public.narratives(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  date_uploaded timestamptz not null default now(),
  date_modified timestamptz not null default now()
);

create index idx_media_items_owner on public.media_items(owner_id);
create index idx_media_items_narrative on public.media_items(narrative_id);
create index idx_media_items_capture on public.media_items(capture_date desc nulls last);

-- ============================================================
-- 4. Notes
-- ============================================================
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  media_item_id uuid references public.media_items(id) on delete cascade,
  narrative_id uuid references public.narratives(id) on delete cascade,
  day_date date,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  date_created timestamptz not null default now(),
  date_modified timestamptz not null default now()
);

create index idx_notes_owner on public.notes(owner_id);
create index idx_notes_narrative on public.notes(narrative_id);
create index idx_notes_media_item on public.notes(media_item_id);

-- ============================================================
-- 5. Locations
-- ============================================================
create table public.locations (
  id bigint generated always as identity primary key,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  country text not null default '',
  city text not null default '',
  address text not null default '',
  date_created timestamptz not null default now(),
  date_modified timestamptz not null default now()
);

-- Junction table for locations <-> media_items (M2M)
create table public.location_media (
  location_id bigint references public.locations(id) on delete cascade,
  media_item_id uuid references public.media_items(id) on delete cascade,
  primary key (location_id, media_item_id)
);

-- ============================================================
-- 6. Projects
-- ============================================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  cover_image_url text,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  public_status text not null default 'private' check (public_status in ('private', 'unlisted', 'public')),
  date_created timestamptz not null default now(),
  date_modified timestamptz not null default now()
);

create index idx_projects_owner on public.projects(owner_id);

-- Junction table for projects <-> narratives (M2M)
create table public.project_narratives (
  project_id uuid references public.projects(id) on delete cascade,
  narrative_id uuid references public.narratives(id) on delete cascade,
  primary key (project_id, narrative_id)
);

-- ============================================================
-- 7. Updated-at trigger function
-- ============================================================
create or replace function public.update_modified_column()
returns trigger as $$
begin
  new.date_modified = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_modified before update on public.profiles
  for each row execute function public.update_modified_column();

create trigger update_narratives_modified before update on public.narratives
  for each row execute function public.update_modified_column();

create trigger update_media_items_modified before update on public.media_items
  for each row execute function public.update_modified_column();

create trigger update_notes_modified before update on public.notes
  for each row execute function public.update_modified_column();

create trigger update_locations_modified before update on public.locations
  for each row execute function public.update_modified_column();

create trigger update_projects_modified before update on public.projects
  for each row execute function public.update_modified_column();

-- ============================================================
-- 8. Row Level Security (RLS)
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Narratives
alter table public.narratives enable row level security;

create policy "Users can view their own narratives"
  on public.narratives for select using (auth.uid() = owner_id);

create policy "Users can create their own narratives"
  on public.narratives for insert with check (auth.uid() = owner_id);

create policy "Users can update their own narratives"
  on public.narratives for update using (auth.uid() = owner_id);

create policy "Users can delete their own narratives"
  on public.narratives for delete using (auth.uid() = owner_id);

-- Media Items
alter table public.media_items enable row level security;

create policy "Users can view their own media"
  on public.media_items for select using (auth.uid() = owner_id);

create policy "Users can upload their own media"
  on public.media_items for insert with check (auth.uid() = owner_id);

create policy "Users can update their own media"
  on public.media_items for update using (auth.uid() = owner_id);

create policy "Users can delete their own media"
  on public.media_items for delete using (auth.uid() = owner_id);

-- Notes
alter table public.notes enable row level security;

create policy "Users can view their own notes"
  on public.notes for select using (auth.uid() = owner_id);

create policy "Users can create their own notes"
  on public.notes for insert with check (auth.uid() = owner_id);

create policy "Users can update their own notes"
  on public.notes for update using (auth.uid() = owner_id);

create policy "Users can delete their own notes"
  on public.notes for delete using (auth.uid() = owner_id);

-- Locations (visible to all authenticated users)
alter table public.locations enable row level security;

create policy "Authenticated users can view locations"
  on public.locations for select using (auth.role() = 'authenticated');

create policy "Authenticated users can create locations"
  on public.locations for insert with check (auth.role() = 'authenticated');

-- Location-Media junction
alter table public.location_media enable row level security;

create policy "Authenticated users can view location_media"
  on public.location_media for select using (auth.role() = 'authenticated');

create policy "Authenticated users can manage location_media"
  on public.location_media for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete location_media"
  on public.location_media for delete using (auth.role() = 'authenticated');

-- Projects
alter table public.projects enable row level security;

create policy "Users can view their own projects"
  on public.projects for select using (auth.uid() = owner_id);

create policy "Users can view public projects"
  on public.projects for select using (public_status = 'public');

create policy "Users can create their own projects"
  on public.projects for insert with check (auth.uid() = owner_id);

create policy "Users can update their own projects"
  on public.projects for update using (auth.uid() = owner_id);

create policy "Users can delete their own projects"
  on public.projects for delete using (auth.uid() = owner_id);

-- Project-Narratives junction
alter table public.project_narratives enable row level security;

create policy "Users can view their project narratives"
  on public.project_narratives for select using (
    exists (
      select 1 from public.projects
      where projects.id = project_narratives.project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Users can manage their project narratives"
  on public.project_narratives for insert with check (
    exists (
      select 1 from public.projects
      where projects.id = project_narratives.project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Users can remove their project narratives"
  on public.project_narratives for delete using (
    exists (
      select 1 from public.projects
      where projects.id = project_narratives.project_id
      and projects.owner_id = auth.uid()
    )
  );

-- ============================================================
-- 9. Storage Buckets
-- ============================================================
-- Note: Run these via the Supabase Dashboard or supabase CLI.
-- They are included here for reference.
--
-- insert into storage.buckets (id, name, public)
--   values ('media', 'media', false);
--
-- insert into storage.buckets (id, name, public)
--   values ('avatars', 'avatars', true);
--
-- Storage RLS policies:
--
-- create policy "Users can upload their own media"
--   on storage.objects for insert
--   with check (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "Users can view their own media"
--   on storage.objects for select
--   using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "Users can delete their own media"
--   on storage.objects for delete
--   using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "Avatar images are publicly accessible"
--   on storage.objects for select
--   using (bucket_id = 'avatars');
--
-- create policy "Users can upload their own avatar"
--   on storage.objects for insert
--   with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
