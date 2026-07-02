
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  country TEXT,
  country_code TEXT,
  region TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_session ON public.page_views(session_id);
GRANT SELECT, INSERT ON public.page_views TO anon, authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read page views" ON public.page_views FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.tool_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tool_usage_created_at ON public.tool_usage(created_at DESC);
GRANT SELECT, INSERT ON public.tool_usage TO anon, authenticated;
GRANT ALL ON public.tool_usage TO service_role;
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log tool usage" ON public.tool_usage FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read tool usage" ON public.tool_usage FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
