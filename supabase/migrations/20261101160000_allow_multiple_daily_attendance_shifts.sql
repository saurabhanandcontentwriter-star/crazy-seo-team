-- Allow multiple attendance shifts per employee per day while retaining every shift row.
alter table public.crm_attendance drop constraint if exists crm_attendance_user_id_work_date_key;
create index if not exists crm_attendance_user_work_date_punch_in_idx on public.crm_attendance (user_id, work_date, punch_in desc);
create index if not exists crm_attendance_work_date_punch_in_idx on public.crm_attendance (work_date, punch_in desc);
