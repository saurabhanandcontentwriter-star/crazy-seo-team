-- Keep the ANVYA composer compatible with all supported post formats.
-- Older schema only allowed post/question, while the current UI also supports blog/event.
alter table public.idea_posts
  drop constraint if exists idea_posts_post_type_check;

alter table public.idea_posts
  add constraint idea_posts_post_type_check
  check (post_type in ('post','question','blog','event'));

notify pgrst, 'reload schema';
