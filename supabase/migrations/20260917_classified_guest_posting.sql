-- Allow public guest posting for the Classified Marketplace.
-- Login is intentionally NOT required. Name and phone are validated in the UI.
drop policy if exists "users insert classified listings" on public.classified_listings;
create policy "guests and users insert classified listings"
on public.classified_listings
for insert to anon, authenticated
with check (true);

drop policy if exists "users insert own classified media" on public.classified_media;
create policy "guests and users insert classified media"
on public.classified_media
for insert to anon, authenticated
with check (true);

-- Guest marketplace uploads use the existing public blog-images bucket under classifieds/guest/.
drop policy if exists "guest classified media upload" on storage.objects;
create policy "guest classified media upload"
on storage.objects
for insert to anon, authenticated
with check (bucket_id = 'blog-images' and name like 'classifieds/%');
