-- Fix admin login access for the existing password-based admin portal.
-- The older migrations seeded the legacy admin_id table instead of admin_emails,
-- so the has_role() guard could reject a successfully authenticated admin.

INSERT INTO public.admin_emails (email)
VALUES
  ('sauravanand499@gmail.com'),
  ('crazyseoteam@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Grant the admin role to already-existing Auth users that are on the allow-list.
-- New users continue to be handled by the existing handle_new_user() trigger.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users AS u
JOIN public.admin_emails AS a
  ON lower(a.email) = lower(u.email)
ON CONFLICT (user_id, role) DO NOTHING;

-- Keep the signup trigger aligned with the real allow-list table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.admin_emails
    WHERE lower(email) = lower(NEW.email)
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
