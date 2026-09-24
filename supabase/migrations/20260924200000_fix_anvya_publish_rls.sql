-- Fix ANVYA publishing RLS for the current composer formats.
-- The older policy only allowed post/question, while the UI also supports blog/event.
drop policy if exists "Users can create ideas" on public.idea_posts;

create policy "Users can create ideas"
on public.idea_posts
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and status = 'pending'
  and visibility in ('public','friends')
  and post_type in ('post','question','blog','event')
);

-- Keep the subject values aligned with the current ANVYA create form.
alter table public.idea_posts
  drop constraint if exists idea_posts_subject_check;

alter table public.idea_posts
  add constraint idea_posts_subject_check
  check (
    subject in (
      'Tech','AI','SEO',
      'Technology','Marketing','Business','Finance','Economics',
      'Science','Education','Health','Travel','Design','Development',
      'Startups','SaaS','Productivity','Career','Content','Data','Other',
      'Blog','Discussion'
    )
  );

notify pgrst, 'reload schema';
