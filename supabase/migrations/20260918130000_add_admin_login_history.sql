-- Admin login history and visibility
create table if not exists public.login_history (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  success boolean not null default true,
  created_at timestamptz not null default now(),
  ip_address text,
  failure_reason text
);

alter table public.login_history enable row level security;

drop policy if exists "Admins can read login history" on public.login_history;
create policy "Admins can read login history"
on public.login_history for select to authenticated
using (
  exists (
    select 1 from public.admin_emails ae
    where lower(ae.email) = lower((select auth.jwt()->>'email'))
  )
);

drop policy if exists "Authenticated users can record own login" on public.login_history;
create policy "Authenticated users can record own login"
on public.login_history for insert to authenticated
with check (
  lower(email) = lower((select auth.jwt()->>'email'))
);

grant select, insert on public.login_history to authenticated;
