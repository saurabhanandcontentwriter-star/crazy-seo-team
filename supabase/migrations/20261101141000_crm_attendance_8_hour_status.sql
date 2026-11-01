-- Regular workday is 8 net working hours; breaks are excluded.
create or replace function public.set_crm_attendance_work_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.work_status := case
    when coalesce(new.regular_seconds, new.total_seconds, 0) >= 28800 then 'green'
    else 'red'
  end;
  return new;
end;
$$;

drop trigger if exists crm_attendance_work_status_trigger on public.crm_attendance;
create trigger crm_attendance_work_status_trigger
before insert or update of total_seconds, regular_seconds on public.crm_attendance
for each row execute function public.set_crm_attendance_work_status();

update public.crm_attendance
set regular_seconds = least(coalesce(total_seconds,0),28800),
    overtime_seconds = greatest(coalesce(total_seconds,0)-28800,0),
    work_status = case when coalesce(total_seconds,0)>=28800 then 'green' else 'red' end;
