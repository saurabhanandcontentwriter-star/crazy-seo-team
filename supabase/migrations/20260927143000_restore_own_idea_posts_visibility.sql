-- Let signed-in authors see their own ANVYA posts, including pending posts.
-- Match by both user_id and the profile public_id used by the composer.
drop policy if exists "Users can read own ideas" on public.idea_posts;

create policy "Users can read own ideas"
on public.idea_posts
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or exists (
    select 1
    from public.idea_profiles p
    where p.public_id = idea_posts.profile_id
      and p.user_id = (select auth.uid())
  )
);

notify pgrst, 'reload schema';
