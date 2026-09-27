-- Add SEO-friendly slugs to ANVYA community posts.
alter table public.idea_posts
  add column if not exists slug text;

-- Backfill existing posts from their topic/title.
update public.idea_posts
set slug = left(
  regexp_replace(
    regexp_replace(lower(coalesce(nullif(title,''), 'anvya-post')), '[^a-z0-9]+', '-', 'g'),
    '(^-+|-+$)', '', 'g'
  ),
  120
)
where slug is null or btrim(slug) = '';

-- Make duplicate historical slugs unique.
with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as rn
  from public.idea_posts
  where slug is not null and slug <> ''
)
update public.idea_posts p
set slug = case when r.rn = 1 then r.slug else r.slug || '-' || r.rn end
from ranked r
where p.id = r.id and r.rn > 1;

create unique index if not exists idea_posts_slug_uidx
  on public.idea_posts(slug)
  where slug is not null and slug <> '';

notify pgrst, 'reload schema';
