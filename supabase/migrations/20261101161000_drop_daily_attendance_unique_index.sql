-- Remove the separately-created unique index that still blocks repeat daily shifts.
drop index if exists public.crm_attendance_user_work_date_uidx;

-- Keep non-unique lookup indexes for efficient daily attendance queries.
create index if not exists crm_attendance_user_work_date_punch_in_idx
  on public.crm_attendance (user_id, work_date, punch_in desc);
