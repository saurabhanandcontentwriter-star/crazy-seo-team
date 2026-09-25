-- Explicit Data API grants for the CRM tables.
-- Supabase now recommends keeping grants and RLS together so a missing grant
-- cannot masquerade as a data-fetch failure.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_team_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_followups TO authenticated;

GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.crm_team_members TO service_role;
GRANT ALL ON public.crm_activities TO service_role;
GRANT ALL ON public.crm_followups TO service_role;

NOTIFY pgrst, 'reload schema';
