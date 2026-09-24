-- ANVYA profile section columns must exist before the profile editor queries them.
-- Idempotent so it is safe if some/all columns were already created.
alter table public.idea_profiles
  add column if not exists experience jsonb not null default '[]'::jsonb,
  add column if not exists education_details jsonb not null default '[]'::jsonb,
  add column if not exists projects jsonb not null default '[]'::jsonb,
  add column if not exists certificates jsonb not null default '[]'::jsonb,
  add column if not exists medium_url text;

-- Make PostgREST immediately refresh its schema cache after the DDL change.
notify pgrst, 'reload schema';
