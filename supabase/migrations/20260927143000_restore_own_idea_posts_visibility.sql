-- Let signed-in authors see their own ANVYA posts while they are pending moderation.
-- Public users continue to see only approved posts through the existing public policy.
drop policy if exists "Users can read own ideas" on public.idea_posts;

create policy "Users can read own ideas"
on public.idea_posts
for select
to authenticated
using ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
