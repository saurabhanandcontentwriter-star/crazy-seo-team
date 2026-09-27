-- Ensure the ANVYA Ideas tags column exists in deployed databases.
alter table public.idea_posts
  add column if not exists tags text[] not null default '{}'::text[];

create index if not exists idea_posts_tags_gin_idx
  on public.idea_posts using gin(tags);

-- Refresh PostgREST's schema cache after the column change.
notify pgrst, 'reload schema';
