create table if not exists public.classified_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null,
  category text not null,
  subcategory text,
  listing_type text not null default 'sell',
  price numeric,
  price_type text default 'fixed',
  condition text,
  brand text,
  location_text text,
  city text,
  state text,
  pincode text,
  seller_name text,
  seller_phone text,
  seller_email text,
  business_name text,
  is_business boolean not null default false,
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  status text not null default 'pending',
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.classified_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.classified_listings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  media_type text not null check (media_type in ('image','video')),
  storage_path text not null,
  public_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists classified_listings_category_idx on public.classified_listings(category);
create index if not exists classified_listings_status_idx on public.classified_listings(status);
create index if not exists classified_listings_created_idx on public.classified_listings(created_at desc);
create index if not exists classified_media_listing_idx on public.classified_media(listing_id, sort_order);
alter table public.classified_listings enable row level security;
alter table public.classified_media enable row level security;
drop policy if exists "public read active classified listings" on public.classified_listings;
create policy "public read active classified listings" on public.classified_listings for select to anon, authenticated using (status = 'active' or auth.uid() = user_id);
drop policy if exists "users insert classified listings" on public.classified_listings;
create policy "users insert classified listings" on public.classified_listings for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "users update own classified listings" on public.classified_listings;
create policy "users update own classified listings" on public.classified_listings for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "public read classified media" on public.classified_media;
create policy "public read classified media" on public.classified_media for select to anon, authenticated using (true);
drop policy if exists "users insert own classified media" on public.classified_media;
create policy "users insert own classified media" on public.classified_media for insert to authenticated with check (auth.uid() = user_id);

-- Reuse the existing public blog-images bucket for marketplace media to avoid creating another bucket.
-- If your project does not expose this bucket for authenticated uploads, grant INSERT/UPDATE/SELECT
-- on storage.objects for paths beginning with classifieds/ through your Supabase Storage policies.
