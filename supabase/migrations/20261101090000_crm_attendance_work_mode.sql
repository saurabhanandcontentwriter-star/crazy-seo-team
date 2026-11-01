-- Store the employee's declared work location with each daily attendance record.
alter table public.crm_attendance
  add column if not exists work_mode text not null default 'office';

alter table public.crm_attendance
  drop constraint if exists crm_attendance_work_mode_check;

alter table public.crm_attendance
  add constraint crm_attendance_work_mode_check
  check (work_mode in ('office', 'home', 'remote'));

notify pgrst, 'reload schema';
