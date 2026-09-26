-- ANVYA pet profiles: optional pet identity section inside member profiles.
create table if not exists public.idea_pet_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  pet_type text not null default 'Other',
  breed text,
  gender text,
  birth_date date,
  bio text,
  location text,
  image_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_idea_pet_profiles_user_id
  on public.idea_pet_profiles(user_id);

create index if not exists idx_idea_pet_profiles_public
  on public.idea_pet_profiles(user_id, is_public);

alter table public.idea_pet_profiles enable row level security;

drop policy if exists "Public can view public pet profiles" on public.idea_pet_profiles;
create policy "Public can view public pet profiles"
on public.idea_pet_profiles
for select
using (is_public = true or auth.uid() = user_id);

drop policy if exists "Users can insert their pet profiles" on public.idea_pet_profiles;
create policy "Users can insert their pet profiles"
on public.idea_pet_profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their pet profiles" on public.idea_pet_profiles;
create policy "Users can update their pet profiles"
on public.idea_pet_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their pet profiles" on public.idea_pet_profiles;
create policy "Users can delete their pet profiles"
on public.idea_pet_profiles
for delete
using (auth.uid() = user_id);

create or replace function public.touch_idea_pet_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_idea_pet_profile_updated_at on public.idea_pet_profiles;
create trigger trg_touch_idea_pet_profile_updated_at
before update on public.idea_pet_profiles
for each row execute function public.touch_idea_pet_profile_updated_at();
