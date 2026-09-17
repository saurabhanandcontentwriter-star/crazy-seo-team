create table if not exists public.crm_schema_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  schema_type text not null default 'Article',
  name text not null default '',
  description text not null default '',
  url text not null default '',
  image_url text not null default '',
  author text not null default 'Crazy SEO Team',
  schema_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_schema_records enable row level security;

drop policy if exists "Admins can read schema records" on public.crm_schema_records;
create policy "Admins can read schema records" on public.crm_schema_records for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email','')) in ('sauravanand499@gmail.com','crazyseoteam@gmail.com'));

drop policy if exists "Admins can insert schema records" on public.crm_schema_records;
create policy "Admins can insert schema records" on public.crm_schema_records for insert to authenticated
with check (lower(coalesce(auth.jwt() ->> 'email','')) in ('sauravanand499@gmail.com','crazyseoteam@gmail.com'));

drop policy if exists "Admins can update schema records" on public.crm_schema_records;
create policy "Admins can update schema records" on public.crm_schema_records for update to authenticated
using (lower(coalesce(auth.jwt() ->> 'email','')) in ('sauravanand499@gmail.com','crazyseoteam@gmail.com'))
with check (lower(coalesce(auth.jwt() ->> 'email','')) in ('sauravanand499@gmail.com','crazyseoteam@gmail.com'));

drop policy if exists "Admins can delete schema records" on public.crm_schema_records;
create policy "Admins can delete schema records" on public.crm_schema_records for delete to authenticated
using (lower(coalesce(auth.jwt() ->> 'email','')) in ('sauravanand499@gmail.com','crazyseoteam@gmail.com'));

create index if not exists crm_schema_records_created_at_idx on public.crm_schema_records(created_at desc);
create index if not exists crm_schema_records_type_idx on public.crm_schema_records(schema_type);
grant select, insert, update, delete on public.crm_schema_records to authenticated;
