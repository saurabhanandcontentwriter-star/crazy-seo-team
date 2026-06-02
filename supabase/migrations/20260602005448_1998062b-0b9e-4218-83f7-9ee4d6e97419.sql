CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'footer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can read subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));