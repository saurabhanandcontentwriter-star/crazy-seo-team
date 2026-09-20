alter table public.idea_posts
  add column if not exists image_alt text;

comment on column public.idea_posts.image_alt is 'Accessible descriptive alt text for the published cover image.';