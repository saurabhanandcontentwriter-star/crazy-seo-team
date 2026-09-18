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
create policy if not exists "CRM members read own employee profile" on public.crm_employee_profiles for select to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role) or (public.has_role(auth.uid(),'crm_team'::public.app_role) and auth.uid()=user_id));
create policy if not exists "Admins insert employee profiles" on public.crm_employee_profiles for insert to authenticated with check (public.has_role(auth.uid(),'admin'::public.app_role));
create policy if not exists "Admins update employee profiles" on public.crm_employee_profiles for update to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role)) with check (public.has_role(auth.uid(),'admin'::public.app_role));

create table if not exists public.crm_holidays (
  id uuid primary key default gen_random_uuid(),
  holiday_date date not null unique,
  name text not null,
  reason text,
  created_at timestamptz not null default now()
);
alter table public.crm_holidays enable row level security;
create policy if not exists "Authenticated users read holidays" on public.crm_holidays for select to authenticated using (true);
create policy if not exists "Admins manage holidays" on public.crm_holidays for all to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role)) with check (public.has_role(auth.uid(),'admin'::public.app_role));

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
create policy if not exists "CRM members read own leave" on public.crm_leave_requests for select to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role) or (public.has_role(auth.uid(),'crm_team'::public.app_role) and auth.uid()=user_id));
create policy if not exists "CRM members apply own leave" on public.crm_leave_requests for insert to authenticated with check (public.has_role(auth.uid(),'crm_team'::public.app_role) and auth.uid()=user_id and status='pending');
create policy if not exists "Admins manage leave" on public.crm_leave_requests for update to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role)) with check (public.has_role(auth.uid(),'admin'::public.app_role));

create index if not exists crm_leave_requests_user_date_idx on public.crm_leave_requests(user_id,start_date,end_date);
