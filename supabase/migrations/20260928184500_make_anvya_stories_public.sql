-- Make ANVYA stories public to every user.
-- Existing active stories become public, and future writes/updates are restricted to public visibility.
update public.idea_stories
set visibility = 'public'
where expires_at > now()
  and visibility <> 'public';

drop policy if exists "Users create own stories" on public.idea_stories;
create policy "Users create own public stories"
on public.idea_stories
for insert
to authenticated
with check ((select auth.uid()) = user_id and visibility = 'public');

drop policy if exists "Users update own stories" on public.idea_stories;
create policy "Users update own public stories"
on public.idea_stories
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id and visibility = 'public');

drop policy if exists "Public active stories are viewable" on public.idea_stories;
create policy "Public active stories are viewable"
on public.idea_stories
for select
to anon, authenticated
using (expires_at > now() and visibility = 'public');
