-- Add Suggestion as a supported ANVYA post format.
alter table public.idea_posts
  drop constraint if exists idea_posts_post_type_check;

alter table public.idea_posts
  add constraint idea_posts_post_type_check
  check (post_type in ('post','question','blog','event','suggestion'));

drop policy if exists "Users can create ideas" on public.idea_posts;

create policy "Users can create ideas"
on public.idea_posts
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and status = 'pending'
  and visibility in ('public','friends')
  and post_type in ('post','question','blog','event','suggestion')
);

notify pgrst, 'reload schema';
