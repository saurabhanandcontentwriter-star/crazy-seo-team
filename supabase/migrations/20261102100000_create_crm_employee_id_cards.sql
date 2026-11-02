create table if not exists public.crm_employee_id_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  employee_name text not null,
  employee_id text,
  designation text,
  department text,
  email text,
  phone text,
  joining_date date,
  photo_data_url text,
  updated_at timestamptz not null default now()
);

alter table public.crm_employee_id_cards enable row level security;

drop policy if exists "Employees can view own ID card" on public.crm_employee_id_cards;
create policy "Employees can view own ID card"
on public.crm_employee_id_cards for select to authenticated
using (user_id = auth.uid() or exists (
  select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'
));

drop policy if exists "Employees and admins can create ID cards" on public.crm_employee_id_cards;
create policy "Employees and admins can create ID cards"
on public.crm_employee_id_cards for insert to authenticated
with check (user_id = auth.uid() or exists (
  select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'
));

drop policy if exists "Employees and admins can update ID cards" on public.crm_employee_id_cards;
create policy "Employees and admins can update ID cards"
on public.crm_employee_id_cards for update to authenticated
using (user_id = auth.uid() or exists (
  select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'
))
with check (user_id = auth.uid() or exists (
  select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'
));
