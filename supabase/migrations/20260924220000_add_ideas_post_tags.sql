-- Add structured tags for ANVYA Ideas posts and blog articles.
alter table public.idea_posts
  add column if not exists tags text[] not null default '{}'::text[];

create index if not exists idea_posts_tags_gin_idx
  on public.idea_posts using gin(tags);

update public.idea_posts
set tags = '{}'
where tags is null;
