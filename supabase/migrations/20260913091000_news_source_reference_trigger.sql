CREATE OR REPLACE FUNCTION public.news_articles_source_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.source_url IS NOT NULL AND NEW.source_url <> '' THEN
    NEW.content := regexp_replace(
      COALESCE(NEW.content, ''),
      E'\\s*<p class="cst-source-reference">[\\s\\S]*?</p>\\s*$',
      '',
      'i'
    )
    || E'\n<p class="cst-source-reference"><strong>Original Source:</strong> <a href="'
    || replace(NEW.source_url, '"', '&quot;')
    || E'" target="_blank" rel="noopener noreferrer nofollow">'
    || replace(COALESCE(NEW.source, 'Source'), '<', '&lt;')
    || E'</a></p>';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_news_articles_source_reference ON public.news_articles;

CREATE TRIGGER trg_news_articles_source_reference
BEFORE INSERT OR UPDATE OF content, source, source_url
ON public.news_articles
FOR EACH ROW
EXECUTE FUNCTION public.news_articles_source_reference();
