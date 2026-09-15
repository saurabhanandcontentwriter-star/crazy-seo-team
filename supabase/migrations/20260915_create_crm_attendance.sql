create extension if not exists pgcrypto;

create table if not exists public.crm_attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null default '',
  work_date date not null,
  punch_in timestamptz not null,
  punch_out timestamptz,
  total_seconds integer not null default 0,
  status text not null default 'punched_in' check (status in ('punched_in','punched_out')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, work_date)
);

create index if not exists crm_attendance_user_date_idx
  on public.crm_attendance(user_id, work_date desc);

alter table public.crm_attendance enable row level security;

drop policy if exists "users can read own attendance" on public.crm_attendance;
create policy "users can read own attendance"
  on public.crm_attendance for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own attendance" on public.crm_attendance;
create policy "users can insert own attendance"
  on public.crm_attendance for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own attendance" on public.crm_attendance;
create policy "users can update own attendance"
  on public.crm_attendance for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_crm_attendance_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crm_attendance_updated_at on public.crm_attendance;
create trigger crm_attendance_updated_at
before update on public.crm_attendance
for each row execute function public.set_crm_attendance_updated_at();
