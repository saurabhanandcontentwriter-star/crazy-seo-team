-- Gmail sign-in requests; HR approval is the only employee access gate.
CREATE TABLE IF NOT EXISTS public.crm_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.crm_access_requests ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.crm_access_requests TO authenticated;
GRANT UPDATE ON public.crm_access_requests TO authenticated;
DROP POLICY IF EXISTS "Users read own CRM access request" ON public.crm_access_requests;
CREATE POLICY "Users read own CRM access request" ON public.crm_access_requests
FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "CRM admins read all access requests" ON public.crm_access_requests;
CREATE POLICY "CRM admins read all access requests" ON public.crm_access_requests
FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role));
DROP POLICY IF EXISTS "CRM admins review access requests" ON public.crm_access_requests;
CREATE POLICY "CRM admins review access requests" ON public.crm_access_requests
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));
GRANT ALL ON public.crm_access_requests TO service_role;
