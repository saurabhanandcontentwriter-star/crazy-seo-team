ALTER TABLE public.blog_posts 
  ADD COLUMN IF NOT EXISTS author_bio text,
  ADD COLUMN IF NOT EXISTS author_linkedin text;