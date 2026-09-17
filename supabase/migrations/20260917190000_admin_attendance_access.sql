-- Admin attendance access for the existing CRM attendance table.
-- The UI remains protected by AdminGuard; these policies protect the data layer too.

alter table public.crm_attendance enable row level security;

drop policy if exists "Admins can read all attendance" on public.crm_attendance;
create policy "Admins can read all attendance"
on public.crm_attendance for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email','')) in ('sauravanand499@gmail.com','crazyseoteam@gmail.com'));

drop policy if exists "Admins can update all attendance" on public.crm_attendance;
create policy "Admins can update all attendance"
on public.crm_attendance for update to authenticated
using (lower(coalesce(auth.jwt() ->> 'email','')) in ('sauravanand499@gmail.com','crazyseoteam@gmail.com'))
with check (lower(coalesce(auth.jwt() ->> 'email','')) in ('sauravanand499@gmail.com','crazyseoteam@gmail.com'));

create index if not exists crm_attendance_email_date_idx
on public.crm_attendance(email, work_date desc);
