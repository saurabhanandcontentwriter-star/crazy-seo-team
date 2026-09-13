ALTER TABLE public.news_articles
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_published_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS news_articles_source_url_uidx
  ON public.news_articles (source_url)
  WHERE source_url IS NOT NULL;
