-- Allow pending Ideas posts to appear on the public Ideas feed.
-- Rejected posts remain hidden. Admin moderation can still approve/reject normally.
drop policy if exists "Community can read approved ideas by visibility" on public.idea_posts;
drop policy if exists "Anyone can read approved ideas" on public.idea_posts;
drop policy if exists "Community can read approved ideas" on public.idea_posts;

create policy "Community can read live ideas by visibility"
on public.idea_posts
for select
to anon, authenticated
using (
  status in ('approved','pending')
  and (
    visibility = 'public'
    or user_id = (select auth.uid())
    or (
      visibility = 'friends'
      and (select auth.uid()) is not null
      and exists (
        select 1
        from public.idea_friendships f
        where f.status = 'accepted'
          and (
            (f.requester_id = public.idea_posts.user_id and f.addressee_id = (select auth.uid()))
            or
            (f.addressee_id = public.idea_posts.user_id and f.requester_id = (select auth.uid()))
          )
      )
    )
  )
);
