alter table public.crm_employee_profiles
  add column if not exists birthday date;
