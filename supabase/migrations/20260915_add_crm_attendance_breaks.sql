alter table public.crm_attendance add column if not exists break_started_at timestamptz;
alter table public.crm_attendance add column if not exists total_break_seconds integer not null default 0;
alter table public.crm_attendance add column if not exists break_status text not null default 'none';

-- Keep break status constrained to known states when the column already exists.
update public.crm_attendance set break_status = 'none' where break_status is null or break_status not in ('none','on_break');

alter table public.crm_attendance drop constraint if exists crm_attendance_break_status_check;
alter table public.crm_attendance add constraint crm_attendance_break_status_check check (break_status in ('none','on_break'));
