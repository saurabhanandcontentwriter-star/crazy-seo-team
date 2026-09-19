-- Extend Ideas profiles with account identity fields
alter table public.idea_profiles
  add column if not exists first_name text,
  add column if not exists middle_name text,
  add column if not exists last_name text,
  add column if not exists state text,
  add column if not exists country text;
