-- Classified seller profile photo + profile history support.
-- Existing listings keep working; new profile metadata is optional at DB level
-- while the UI requires it before a seller can reach Post Ad.
alter table public.classified_listings
  add column if not exists seller_profile_photo_url text;

create table if not exists public.classified_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text not null,
  profile_photo_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.classified_profiles enable row level security;

drop policy if exists "users read own classified profile" on public.classified_profiles;
create policy "users read own classified profile"
  on public.classified_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users insert own classified profile" on public.classified_profiles;
create policy "users insert own classified profile"
  on public.classified_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "users update own classified profile" on public.classified_profiles;
create policy "users update own classified profile"
  on public.classified_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists classified_profiles_updated_idx
  on public.classified_profiles(updated_at desc);
