-- Admin moderation access for Classified Marketplace.
-- Uses the same two admin emails configured for the site's admin allowlist.
create policy "admins manage all classified listings" on public.classified_listings
for all to authenticated
using ((auth.jwt() ->> 'email') in ('sauravanand499@gmail.com','crazyseoteam@gmail.com'))
with check ((auth.jwt() ->> 'email') in ('sauravanand499@gmail.com','crazyseoteam@gmail.com'));

-- New listings submitted by signed-in users must wait for admin approval.
-- Existing rows are left unchanged.
