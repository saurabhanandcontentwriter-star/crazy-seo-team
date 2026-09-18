alter table public.idea_posts
  add column if not exists profile_image_url text;

comment on column public.idea_posts.profile_image_url is 'Public profile/avatar image for the idea author.';
