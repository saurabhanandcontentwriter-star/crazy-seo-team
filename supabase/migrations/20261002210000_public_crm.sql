-- Public CRM + anonymous Customer Discovery
create table if not exists public.public_crm_visitors (
  visitor_id text primary key,
  usage_count integer not null default 0 check (usage_count >= 0 and usage_count <= 2),
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.public_crm_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  public_id text not null unique,
  name text not null,
  email text not null,
  avatar_url text,
  plan text not null default 'free',
  discovery_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.public_crm_discovery_runs (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  user_id uuid references auth.users(id) on delete set null,
  website text not null,
  offer text not null,
  target_market text not null,
  location text,
  goal text,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.public_crm_visitors enable row level security;
alter table public.public_crm_accounts enable row level security;
alter table public.public_crm_discovery_runs enable row level security;

grant select on public.public_crm_accounts to authenticated;
drop policy if exists "Public CRM account owner read" on public.public_crm_accounts;
create policy "Public CRM account owner read" on public.public_crm_accounts
for select to authenticated using (user_id = auth.uid());

grant all on public.public_crm_visitors to service_role;
grant all on public.public_crm_accounts to service_role;
grant all on public.public_crm_discovery_runs to service_role;

create or replace function public.ensure_public_crm_account()
returns public.public_crm_accounts
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.public_crm_accounts;
  uid uuid := auth.uid();
  uemail text;
  uname text;
  uavatar text;
begin
  if uid is null then raise exception 'Authentication required'; end if;

  select email,
         coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(coalesce(email,''),'@',1)),
         raw_user_meta_data->>'avatar_url'
  into uemail, uname, uavatar
  from auth.users where id = uid;

  insert into public.public_crm_accounts(user_id, public_id, name, email, avatar_url)
  values (
    uid,
    'CST-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
    coalesce(uname, 'Crazy SEO Team Member'),
    coalesce(uemail, ''),
    uavatar
  )
  on conflict (user_id) do update set
    name = excluded.name,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    updated_at = now()
  returning * into row;

  return row;
end;
$$;

grant execute on function public.ensure_public_crm_account() to authenticated;


create or replace function public.consume_public_crm_visitor_credit(p_visitor_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare next_count integer;
begin
  if p_visitor_id is null or char_length(trim(p_visitor_id)) < 8 then
    raise exception 'Invalid visitor id';
  end if;
  insert into public.public_crm_visitors(visitor_id, usage_count, last_used_at)
  values (p_visitor_id, 1, now())
  on conflict (visitor_id) do update
    set usage_count = public.public_crm_visitors.usage_count + 1,
        last_used_at = now()
    where public.public_crm_visitors.usage_count < 2
  returning usage_count into next_count;
  if next_count is null then
    raise exception 'Two free Customer Discovery uses have already been used';
  end if;
  return next_count;
end;
$$;

create or replace function public.increment_public_crm_discovery(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare next_count integer;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Authentication required';
  end if;
  update public.public_crm_accounts
  set discovery_count = discovery_count + 1, updated_at = now()
  where user_id = p_user_id
  returning discovery_count into next_count;
  if next_count is null then raise exception 'CRM account not found'; end if;
  return next_count;
end;
$$;

grant execute on function public.consume_public_crm_visitor_credit(text) to anon, authenticated;
grant execute on function public.increment_public_crm_discovery(uuid) to authenticated;
