-- Ensure the attendance table supports the work location selected at Punch In.
alter table public.crm_attendance
  add column if not exists work_mode text not null default 'office';

update public.crm_attendance
set work_mode = 'office'
where work_mode is null or work_mode not in ('office','home','remote');

alter table public.crm_attendance
  drop constraint if exists crm_attendance_work_mode_check;
alter table public.crm_attendance
  add constraint crm_attendance_work_mode_check
  check (work_mode in ('office','home','remote'));

notify pgrst, 'reload schema';
