-- Allow CRM team users to see today's attendance for all team members.
-- Punch In/Out writes remain restricted to the signed-in user's own row.

drop policy if exists "Users can read own attendance" on public.crm_attendance;
drop policy if exists "Admins can read all attendance" on public.crm_attendance;
create policy "CRM members can read all attendance" on public.crm_attendance for select to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role) or public.has_role(auth.uid(), 'crm_team'::public.app_role));

drop policy if exists "Users can insert own attendance" on public.crm_attendance;
create policy "CRM members can insert own attendance" on public.crm_attendance for insert to authenticated
with check ((public.has_role(auth.uid(), 'admin'::public.app_role) or public.has_role(auth.uid(), 'crm_team'::public.app_role)) and auth.uid() = user_id);

drop policy if exists "Users can update own attendance" on public.crm_attendance;
drop policy if exists "Admins can update all attendance" on public.crm_attendance;
create policy "CRM members can update own attendance" on public.crm_attendance for update to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role) or (public.has_role(auth.uid(), 'crm_team'::public.app_role) and auth.uid() = user_id))
with check (public.has_role(auth.uid(), 'admin'::public.app_role) or (public.has_role(auth.uid(), 'crm_team'::public.app_role) and auth.uid() = user_id));