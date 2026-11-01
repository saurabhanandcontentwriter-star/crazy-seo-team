-- Employee ID based CRM authentication. Passwords are managed only by Supabase Auth.
alter table public.crm_team_members
  add column if not exists login_id text,
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists crm_team_members_login_id_lower_uidx
  on public.crm_team_members (lower(login_id))
  where login_id is not null and length(trim(login_id)) > 0;

create index if not exists crm_team_members_auth_user_id_idx
  on public.crm_team_members(auth_user_id);

-- Employees may read only their own attendance; admins retain their existing access.
drop policy if exists "CRM members can read all attendance" on public.crm_attendance;
create policy "Employees read own attendance and admins read all"
on public.crm_attendance for select to authenticated
using (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Employee profiles remain private to the employee and admins.
drop policy if exists "CRM members read own employee profile" on public.crm_employee_profiles;
create policy "Employees and admins read own profile"
on public.crm_employee_profiles for select to authenticated
using (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin'::public.app_role)
);

drop policy if exists "Admins insert employee profiles" on public.crm_employee_profiles;
create policy "Admins insert employee profiles"
on public.crm_employee_profiles for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "Admins update employee profiles" on public.crm_employee_profiles;
create policy "Admins update employee profiles" on public.crm_employee_profiles for update to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

grant select, insert, update, delete on public.crm_team_members to authenticated;
