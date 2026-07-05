
-- Ensure both admin emails are in the allow-list (trigger grants admin role on signup)
INSERT INTO public.admin_emails (email)
VALUES ('crazyseoteam@gmail.com'), ('sauravanand499@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Login history / audit trail
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  mfa_verified BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.login_history TO authenticated;
GRANT SELECT, INSERT ON public.login_history TO anon;
GRANT ALL ON public.login_history TO service_role;

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- Anyone (even anon, since login attempt happens pre-auth) can insert an attempt row
CREATE POLICY "Anyone can log login attempts"
  ON public.login_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read login history
CREATE POLICY "Admins can view login history"
  ON public.login_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_login_history_email_created ON public.login_history(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_user_created ON public.login_history(user_id, created_at DESC);
