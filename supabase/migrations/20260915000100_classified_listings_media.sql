create extension if not exists pgcrypto;

create table if not exists public.classified_listings (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  description text not null default '',
  price text not null default '',
  location text not null default '',
  seller_type text not null default 'Individual',
  phone text not null default '',
  photos jsonb not null default '[]'::jsonb,
  video_url text,
  slug text not null unique,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.classified_listings enable row level security;
drop policy if exists "classified listings public read" on public.classified_listings;
create policy "classified listings public read" on public.classified_listings for select using (true);
drop policy if exists "classified listings public insert" on public.classified_listings;
create policy "classified listings public insert" on public.classified_listings for insert with check (true);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('classified-media','classified-media',true,52428800,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']::text[])
on conflict (id) do update set public=true,file_size_limit=52428800,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "classified media public upload" on storage.objects;
create policy "classified media public upload" on storage.objects for insert with check (bucket_id='classified-media');
drop policy if exists "classified media public read" on storage.objects;
create policy "classified media public read" on storage.objects for select using (bucket_id='classified-media');