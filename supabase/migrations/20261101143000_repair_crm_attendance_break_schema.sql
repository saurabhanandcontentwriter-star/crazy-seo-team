-- Repair attendance schema for Lunch/Break and overtime controls.
-- Idempotent so it is safe whether earlier attendance migrations ran or not.
alter table public.crm_attendance
  add column if not exists break_started_at timestamptz,
  add column if not exists total_break_seconds integer not null default 0,
  add column if not exists break_status text not null default 'none',
  add column if not exists break_reason text,
  add column if not exists overtime_started_at timestamptz,
  add column if not exists overtime_seconds integer not null default 0,
  add column if not exists regular_seconds integer not null default 0;

update public.crm_attendance
set break_status = 'none'
where break_status is null or break_status not in ('none','on_break');

alter table public.crm_attendance
  drop constraint if exists crm_attendance_break_status_check;
alter table public.crm_attendance
  add constraint crm_attendance_break_status_check
  check (break_status in ('none','on_break'));

-- Tell PostgREST to refresh its cached table definition after the DDL.
notify pgrst, 'reload schema';
