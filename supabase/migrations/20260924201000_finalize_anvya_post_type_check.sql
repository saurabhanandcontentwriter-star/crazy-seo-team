-- Finalize ANVYA post_type compatibility.
-- The live database may still have the older post/question-only check.
alter table public.idea_posts
  drop constraint if exists idea_posts_post_type_check;

alter table public.idea_posts
  add constraint idea_posts_post_type_check
  check (post_type in ('post','question','blog','event'));

notify pgrst, 'reload schema';
