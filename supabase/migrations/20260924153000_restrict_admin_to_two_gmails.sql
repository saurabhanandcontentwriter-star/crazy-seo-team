-- Restrict Admin access to exactly these two Gmail accounts.
DELETE FROM public.user_roles ur
USING auth.users u
WHERE u.id = ur.user_id
  AND ur.role = 'admin'::public.app_role
  AND lower(coalesce(u.email, '')) NOT IN (
    'saurabhanandshahisarmera@gmail.com',
    'crazyseoteam@gmail.com'
  );

DELETE FROM public.admin_emails
WHERE lower(email) NOT IN (
  'saurabhanandshahisarmera@gmail.com',
  'crazyseoteam@gmail.com'
);

INSERT INTO public.admin_emails (email)
VALUES
  ('saurabhanandshahisarmera@gmail.com'),
  ('crazyseoteam@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Ensure both existing Auth accounts have the admin role.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users AS u
WHERE lower(u.email) IN (
  'saurabhanandshahisarmera@gmail.com',
  'crazyseoteam@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;
