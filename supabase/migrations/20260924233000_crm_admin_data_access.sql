-- Ensure every configured CRM admin account can pass the database RLS
-- used by leads, activities, follow-ups and CRM workspace records.

INSERT INTO public.admin_emails (email)
VALUES
  ('crazyseoteam@gmail.com'),
  ('saurabhanandshahisarmera@gmail.com'),
  ('saurabhanandcontentwriter@gmail.com'),
  ('sauravanand499@gmail.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users AS u
JOIN public.admin_emails AS a
  ON lower(a.email) = lower(u.email)
ON CONFLICT (user_id, role) DO NOTHING;

-- Keep future Google sign-ins for these configured accounts authorized.
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
