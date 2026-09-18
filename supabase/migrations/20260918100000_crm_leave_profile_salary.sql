-- CRM HR: employee profiles, company holidays, leave requests
create table if not exists public.crm_employee_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  joining_date date,
  designation text default 'Sales Executive',
  department text default 'CRM',
  monthly_salary numeric(12,2) not null default 0,
  paid_leave_balance integer not null default 12,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.crm_employee_profiles enable row level security;
drop policy if exists "CRM members read own employee profile" on public.crm_employee_profiles;\ncreate policy "CRM members read own employee profile" on public.crm_employee_profiles for select to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role) or (public.has_role(auth.uid(),'crm_team'::public.app_role) and auth.uid()=user_id));
drop policy if exists "Admins insert employee profiles" on public.crm_employee_profiles;\ncreate policy "Admins insert employee profiles" on public.crm_employee_profiles for insert to authenticated with check (public.has_role(auth.uid(),'admin'::public.app_role));
drop policy if exists "Admins update employee profiles" on public.crm_employee_profiles;\ncreate policy "Admins update employee profiles" on public.crm_employee_profiles for update to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role)) with check (public.has_role(auth.uid(),'admin'::public.app_role));

create table if not exists public.crm_holidays (
  id uuid primary key default gen_random_uuid(),
  holiday_date date not null unique,
  name text not null,
  reason text,
  created_at timestamptz not null default now()
);
alter table public.crm_holidays enable row level security;
drop policy if exists "Authenticated users read holidays" on public.crm_holidays;\ncreate policy "Authenticated users read holidays" on public.crm_holidays for select to authenticated using (true);
drop policy if exists "Admins manage holidays" on public.crm_holidays;\ncreate policy "Admins manage holidays" on public.crm_holidays for all to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role)) with check (public.has_role(auth.uid(),'admin'::public.app_role));

create table if not exists public.crm_leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  leave_type text not null check (leave_type in ('paid','unpaid')),
  start_date date not null,
  end_date date not null,
  total_days integer not null check (total_days > 0),
  reason text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  constraint crm_leave_dates_valid check (end_date >= start_date)
);
alter table public.crm_leave_requests enable row level security;
drop policy if exists "CRM members read own leave" on public.crm_leave_requests;\ncreate policy "CRM members read own leave" on public.crm_leave_requests for select to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role) or (public.has_role(auth.uid(),'crm_team'::public.app_role) and auth.uid()=user_id));
drop policy if exists "CRM members apply own leave" on public.crm_leave_requests;\ncreate policy "CRM members apply own leave" on public.crm_leave_requests for insert to authenticated with check (public.has_role(auth.uid(),'crm_team'::public.app_role) and auth.uid()=user_id and status='pending');
drop policy if exists "Admins manage leave" on public.crm_leave_requests;\ncreate policy "Admins manage leave" on public.crm_leave_requests for update to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role)) with check (public.has_role(auth.uid(),'admin'::public.app_role));

create index if not exists crm_leave_requests_user_date_idx on public.crm_leave_requests(user_id,start_date,end_date);


insert into public.crm_holidays (holiday_date,name,reason) values
('2026-01-26','Republic Day','National holiday'),
('2026-03-04','Holi','Festival holiday'),
('2026-03-21','Eid-ul-Fitr','Festival holiday'),
('2026-03-26','Ram Navami','Festival holiday'),
('2026-04-03','Good Friday','Religious holiday'),
('2026-05-01','Buddha Purnima / Labour Day','Company holiday'),
('2026-05-28','Bakrid','Festival holiday'),
('2026-06-26','Muharram','Religious holiday'),
('2026-08-15','Independence Day','National holiday'),
('2026-08-26','Milad-un-Nabi','Festival holiday'),
('2026-09-04','Janmashtami','Festival holiday'),
('2026-10-02','Gandhi Jayanti','National holiday'),
('2026-10-20','Dussehra','Festival holiday'),
('2026-11-08','Diwali','Festival holiday'),
('2026-11-15','Chhath Puja','Festival holiday'),
('2026-11-24','Guru Nanak Jayanti','Festival holiday'),
('2026-12-25','Christmas','Company holiday')
on conflict (holiday_date) do update set name=excluded.name, reason=excluded.reason;

insert into public.crm_employee_profiles(user_id,designation,department)
select auth_user_id,coalesce(position,'Sales Executive'),'CRM'
from public.crm_team_members
where auth_user_id is not null
on conflict (user_id) do nothing;
