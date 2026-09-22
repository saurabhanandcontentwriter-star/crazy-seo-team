alter table public.crm_attendance
  add column if not exists work_status text not null default 'red';

update public.crm_attendance
set work_status = case when coalesce(total_seconds, 0) >= 32400 then 'green' else 'red' end;

create or replace function public.set_crm_attendance_work_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.work_status := case
    when coalesce(new.total_seconds, 0) >= 32400 then 'green'
    else 'red'
  end;
  return new;
end;
$$;

drop trigger if exists crm_attendance_work_status_trigger on public.crm_attendance;
create trigger crm_attendance_work_status_trigger
before insert or update of total_seconds on public.crm_attendance
for each row
execute function public.set_crm_attendance_work_status();
