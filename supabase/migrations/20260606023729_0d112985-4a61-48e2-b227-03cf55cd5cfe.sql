
ALTER TABLE public.news_articles
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS focus_keyword text,
  ADD COLUMN IF NOT EXISTS nlp_keywords text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS image_alt text,
  ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS author text DEFAULT 'Crazy SEO Team Newsroom',
  ADD COLUMN IF NOT EXISTS reading_minutes integer DEFAULT 3;
