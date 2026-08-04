ALTER TABLE public.page_views REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='page_views') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.page_views;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='tool_usage') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tool_usage;
  END IF;
END $$;