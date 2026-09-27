-- Return ANVYA posts for the author's profile without relying on client-side RLS.
-- Public visitors get approved/public posts. The profile owner also gets their pending posts.
create or replace function public.get_anvya_profile_posts(
  target_user_id uuid,
  target_profile_id text default null
)
returns setof public.idea_posts
language sql
stable
security definer
set search_path = public
as $$
  select p.*
  from public.idea_posts p
  where (p.user_id = target_user_id or (target_profile_id is not null and p.profile_id = target_profile_id))
    and (
      (
        p.status = 'approved'
        and p.visibility = 'public'
      )
      or (
        p.status = 'approved'
        and p.visibility = 'friends'
        and auth.uid() = target_user_id
      )
      or (
        p.status = 'pending'
        and auth.uid() = target_user_id
      )
    )
  order by p.created_at desc;
$$;

grant execute on function public.get_anvya_profile_posts(uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
