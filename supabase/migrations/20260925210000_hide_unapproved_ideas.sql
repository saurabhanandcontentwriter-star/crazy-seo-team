-- Only approved ANVYA posts are publicly readable.
-- Pending/rejected posts remain stored for moderation and history but never appear in public feeds/profiles.
drop policy if exists "Community can read live ideas by visibility" on public.idea_posts;
drop policy if exists "Community can read approved ideas by visibility" on public.idea_posts;
drop policy if exists "Anyone can read approved ideas" on public.idea_posts;
drop policy if exists "Community can read approved ideas" on public.idea_posts;

create policy "Community can read approved ideas only"
on public.idea_posts
for select
to anon, authenticated
using (
  status = 'approved'
  and (
    visibility = 'public'
    or (
      visibility = 'friends'
      and (select auth.uid()) is not null
      and exists (
        select 1 from public.idea_friendships f
        where f.status = 'accepted'
          and ((f.requester_id = public.idea_posts.user_id and f.addressee_id = (select auth.uid()))
            or (f.addressee_id = public.idea_posts.user_id and f.requester_id = (select auth.uid())))
      )
    )
  )
);
