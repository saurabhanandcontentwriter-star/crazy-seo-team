alter table public.idea_posts add column if not exists scheduled_for timestamptz null;
create index if not exists idea_posts_scheduled_for_idx on public.idea_posts(scheduled_for);
