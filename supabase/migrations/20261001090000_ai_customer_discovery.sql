-- AI Customer Discovery: admin-only tool with three free runs per admin account.
CREATE TABLE IF NOT EXISTS public.ai_customer_discovery_usage (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count integer NOT NULL DEFAULT 0 CHECK (usage_count >= 0 AND usage_count <= 3),
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_customer_discovery_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website text NOT NULL,
  offer text NOT NULL,
  target_market text NOT NULL,
  location text,
  goal text,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_customer_discovery_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_customer_discovery_runs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.ai_customer_discovery_usage TO authenticated;
GRANT SELECT ON public.ai_customer_discovery_runs TO authenticated;
GRANT ALL ON public.ai_customer_discovery_usage TO service_role;
GRANT ALL ON public.ai_customer_discovery_runs TO service_role;

DROP POLICY IF EXISTS "Admins read discovery usage" ON public.ai_customer_discovery_usage;
CREATE POLICY "Admins read discovery usage" ON public.ai_customer_discovery_usage FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins read discovery runs" ON public.ai_customer_discovery_runs;
CREATE POLICY "Admins read discovery runs" ON public.ai_customer_discovery_runs FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.consume_ai_customer_discovery_credit(p_user_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE next_count integer;
BEGIN
  IF NOT has_role(p_user_id, 'admin'::app_role) THEN RAISE EXCEPTION 'Admin access required'; END IF;
  INSERT INTO public.ai_customer_discovery_usage (user_id, usage_count, last_used_at)
  VALUES (p_user_id, 1, now())
  ON CONFLICT (user_id) DO UPDATE
    SET usage_count = public.ai_customer_discovery_usage.usage_count + 1,
        last_used_at = now(), updated_at = now()
    WHERE public.ai_customer_discovery_usage.usage_count < 3
  RETURNING usage_count INTO next_count;
  IF next_count IS NULL THEN RAISE EXCEPTION 'Three free AI Customer Discovery runs have already been used'; END IF;
  RETURN next_count;
END;
$$;
GRANT EXECUTE ON FUNCTION public.consume_ai_customer_discovery_credit(uuid) TO authenticated;