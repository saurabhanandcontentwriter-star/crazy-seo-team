-- Allow broader Ideas Community subjects
alter table public.idea_posts drop constraint if exists idea_posts_subject_check;
alter table public.idea_posts add constraint idea_posts_subject_check
  check (subject in ('Tech','AI','SEO','Travel','Other'));
