alter table public.idea_profiles add column if not exists account_status text not null default 'active';
alter table public.idea_profiles add column if not exists ban_reason text;
alter table public.idea_profiles add column if not exists banned_until timestamptz;
alter table public.idea_profiles add column if not exists verification_status text not null default 'not_submitted';

create table if not exists public.idea_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  selfie_path text not null,
  status text not null default 'pending',
  rejection_reason text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id)
);
alter table public.idea_verification_requests enable row level security;
drop policy if exists "Users can view own verification request" on public.idea_verification_requests;
create policy "Users can view own verification request" on public.idea_verification_requests for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "Users can submit own verification request" on public.idea_verification_requests;
create policy "Users can submit own verification request" on public.idea_verification_requests for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "Admins can manage verification requests" on public.idea_verification_requests;
create policy "Admins can manage verification requests" on public.idea_verification_requests for all to authenticated using (public.has_role((select auth.uid()), 'admin'::app_role)) with check (public.has_role((select auth.uid()), 'admin'::app_role));
create index if not exists idea_verification_requests_status_idx on public.idea_verification_requests(status);

insert into storage.buckets (id,name,public)
values ('idea-verification','idea-verification',false)
on conflict (id) do update set public=false;

drop policy if exists "Users upload own verification selfie" on storage.objects;
create policy "Users upload own verification selfie" on storage.objects for insert to authenticated
with check (bucket_id='idea-verification' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "Users view own verification selfie" on storage.objects;
create policy "Users view own verification selfie" on storage.objects for select to authenticated
using (bucket_id='idea-verification' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "Admins manage verification selfies" on storage.objects;
create policy "Admins manage verification selfies" on storage.objects for all to authenticated
using (bucket_id='idea-verification' and public.has_role((select auth.uid()), 'admin'::app_role))
with check (bucket_id='idea-verification' and public.has_role((select auth.uid()), 'admin'::app_role));
