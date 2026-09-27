-- Reliable profile feed: approved public posts are visible on the author's profile,
-- and the author may also see their own pending posts.
create or replace function public.get_anvya_profile_posts(
  target_user_id uuid,
  target_profile_id text default null
)
returns setof public.idea_posts
language sql
security definer
stable
set search_path = public
as $$
  select p.*
  from public.idea_posts p
  where (p.user_id = target_user_id or (target_profile_id is not null and p.profile_id = target_profile_id))
    and (
      (p.status = 'approved' and p.visibility = 'public')
      or (p.status = 'pending' and auth.uid() = p.user_id)
    )
  order by p.created_at desc;
$$;

revoke all on function public.get_anvya_profile_posts(uuid,text) from public;
grant execute on function public.get_anvya_profile_posts(uuid,text) to anon, authenticated;
notify pgrst, 'reload schema';
