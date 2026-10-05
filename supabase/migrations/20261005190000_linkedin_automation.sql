create table if not exists public.linkedin_connections (
  id text primary key default 'primary',
  user_id uuid not null references auth.users(id) on delete cascade,
  member_sub text not null,
  member_urn text not null,
  name text,
  email text,
  picture text,
  access_token text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.linkedin_connections enable row level security;
revoke all on public.linkedin_connections from anon, authenticated;
grant all on public.linkedin_connections to service_role;

create index if not exists linkedin_connections_user_id_idx on public.linkedin_connections(user_id);

create or replace function public.touch_linkedin_connection_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists linkedin_connections_touch on public.linkedin_connections;
create trigger linkedin_connections_touch
before update on public.linkedin_connections
for each row execute function public.touch_linkedin_connection_updated_at();

create table if not exists public.linkedin_oauth_states (
  state text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.linkedin_oauth_states enable row level security;
revoke all on public.linkedin_oauth_states from anon, authenticated;
grant all on public.linkedin_oauth_states to service_role;
create index if not exists linkedin_oauth_states_expires_idx on public.linkedin_oauth_states(expires_at);
