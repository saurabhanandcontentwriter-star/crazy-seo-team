-- Allow authenticated CRM employees as well as admins to use the
-- Customer Discovery allowance. The Edge Function still validates the
-- signed-in user and applies the per-user usage limit.
CREATE OR REPLACE FUNCTION public.consume_ai_customer_discovery_credit(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_count integer;
BEGIN
  IF NOT (
    has_role(p_user_id, 'admin'::app_role)
    OR has_role(p_user_id, 'crm_team'::app_role)
  ) THEN
    RAISE EXCEPTION 'CRM access required';
  END IF;

  INSERT INTO public.ai_customer_discovery_usage (user_id, usage_count, last_used_at)
  VALUES (p_user_id, 1, now())
  ON CONFLICT (user_id) DO UPDATE
    SET usage_count = public.ai_customer_discovery_usage.usage_count + 1,
        last_used_at = now(),
        updated_at = now()
    WHERE public.ai_customer_discovery_usage.usage_count < 3
  RETURNING usage_count INTO next_count;

  IF next_count IS NULL THEN
    RAISE EXCEPTION 'Three free Customer Discovery runs have already been used';
  END IF;

  RETURN next_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_ai_customer_discovery_credit(uuid) TO authenticated;
