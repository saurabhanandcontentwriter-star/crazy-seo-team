alter table public.page_views
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_accuracy_m double precision,
  add column if not exists is_heartbeat boolean not null default false;

create index if not exists page_views_location_idx
  on public.page_views(latitude, longitude);
