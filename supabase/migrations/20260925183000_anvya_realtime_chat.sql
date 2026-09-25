-- Keep ANVYA direct messages live without polling-only behavior.
-- Supabase Realtime Postgres Changes requires the tables to be in the
-- supabase_realtime publication.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'idea_messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.idea_messages;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'idea_presence'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.idea_presence;
    END IF;
  END IF;
END
$$;

ALTER TABLE public.idea_messages REPLICA IDENTITY FULL;
ALTER TABLE public.idea_presence REPLICA IDENTITY FULL;

NOTIFY pgrst, 'reload schema';
