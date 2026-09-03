-- Team members
CREATE TABLE public.crm_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL DEFAULT 'Sales Executive',
  email text NOT NULL,
  mobile text,
  working_days text[] NOT NULL DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri'],
  working_hours text NOT NULL DEFAULT '10:00 - 19:00',
  photo_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_team_members TO authenticated;
GRANT ALL ON public.crm_team_members TO service_role;
ALTER TABLE public.crm_team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage team members" ON public.crm_team_members FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER crm_team_members_touch BEFORE UPDATE ON public.crm_team_members
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Lead activities
CREATE TABLE public.crm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'note',
  subject text,
  body text,
  outcome text,
  duration_seconds integer,
  actor_email text,
  team_member_id uuid REFERENCES public.crm_team_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_activities TO authenticated;
GRANT ALL ON public.crm_activities TO service_role;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage activities" ON public.crm_activities FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX crm_activities_lead_idx ON public.crm_activities(lead_id, created_at DESC);

-- Follow-ups
CREATE TABLE public.crm_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Follow-up',
  notes text,
  due_at timestamptz NOT NULL DEFAULT now(),
  reminder_minutes integer NOT NULL DEFAULT 30,
  team_member_id uuid REFERENCES public.crm_team_members(id) ON DELETE SET NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_followups TO authenticated;
GRANT ALL ON public.crm_followups TO service_role;
ALTER TABLE public.crm_followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage followups" ON public.crm_followups FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX crm_followups_due_idx ON public.crm_followups(due_at) WHERE completed = false;
CREATE TRIGGER crm_followups_touch BEFORE UPDATE ON public.crm_followups
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Leads CRM columns
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES public.crm_team_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deal_value numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_contact_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_follow_up_at timestamptz;

CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads(status);
CREATE INDEX IF NOT EXISTS leads_created_idx ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_assigned_idx ON public.leads(assigned_to);