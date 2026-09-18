-- Fix admin Users & Roles visibility when user_roles has RLS enabled.
drop policy if exists "Admins can read all user roles" on public.user_roles;

create policy "Admins can read all user roles"
on public.user_roles
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_emails ae
    where lower(ae.email) = lower((select auth.jwt()->>'email'))
  )
);
