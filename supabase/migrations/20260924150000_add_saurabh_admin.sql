-- Authorize the requested admin Gmail and backfill admin role for an existing Auth user.
INSERT INTO public.admin_emails (email)
VALUES ('saurabhanandshahisarmera@gmail.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users AS u
WHERE lower(u.email) = lower('saurabhanandshahisarmera@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Keep future signups on the allow-list automatically admin.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.admin_emails
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
