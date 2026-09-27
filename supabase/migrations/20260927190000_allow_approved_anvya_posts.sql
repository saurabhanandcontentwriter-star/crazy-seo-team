-- Allow the ANVYA publisher to create posts that are immediately public/approved.
-- Pending remains supported for legacy moderation flows.
drop policy if exists "Users can create ideas" on public.idea_posts;

create policy "Users can create ideas"
on public.idea_posts
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and status in ('pending','approved')
);

notify pgrst, 'reload schema';
