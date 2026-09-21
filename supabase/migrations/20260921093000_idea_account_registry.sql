-- Track every Ideas ID created or opened in the CRM, including direct-mode accounts.
create table if not exists public.idea_account_registry (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  public_id text not null unique,
  email text not null unique,
  display_name text,
  first_name text,
  middle_name text,
  last_name text,
  state text,
  country text,
  location text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
alter table public.idea_account_registry enable row level security;
drop policy if exists "Anyone can register an Ideas account" on public.idea_account_registry;
create policy "Anyone can register an Ideas account" on public.idea_account_registry
for insert to anon, authenticated
with check (public_id like 'CST-%' and lower(email) ~ '^[^@[:space:]]+@gmail\\.com$');
drop policy if exists "Users can update own Ideas registry row" on public.idea_account_registry;
create policy "Users can update own Ideas registry row" on public.idea_account_registry
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create index if not exists idea_account_registry_last_seen_idx on public.idea_account_registry(last_seen_at desc);
