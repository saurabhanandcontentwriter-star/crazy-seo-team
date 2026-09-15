alter table public.classified_listings add column if not exists source text not null default 'web' check (source in ('mobile','web'));
alter table public.classified_listings add column if not exists device_type text not null default 'desktop';
alter table public.classified_listings add column if not exists latitude double precision;
alter table public.classified_listings add column if not exists longitude double precision;
create index if not exists classified_listings_created_at_idx on public.classified_listings(created_at desc);
create index if not exists classified_listings_location_idx on public.classified_listings(location);
