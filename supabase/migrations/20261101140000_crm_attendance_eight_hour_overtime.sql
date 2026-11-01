alter table public.crm_attendance
  add column if not exists overtime_started_at timestamptz,
  add column if not exists overtime_seconds integer not null default 0,
  add column if not exists regular_seconds integer not null default 0,
  add column if not exists break_reason text;

alter table public.crm_attendance
  drop constraint if exists crm_attendance_break_status_check;
alter table public.crm_attendance
  add constraint crm_attendance_break_status_check
  check (break_status in ('none','on_break'));
