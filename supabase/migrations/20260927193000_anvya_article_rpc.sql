-- Secure article lookup for ANVYA.
-- Public visitors can read approved public posts; the owner can also read their pending post.
create or replace function public.get_anvya_post_by_slug(requested_slug text)
returns setof public.idea_posts
language sql
stable
security definer
set search_path = public
as $$
  select p.*
  from public.idea_posts p
  where (
    p.slug = requested_slug
    or p.slug ilike requested_slug || '%'
    or p.title ilike replace(replace(requested_slug, '-', ' '), '_', ' ') || '%'
  )
  and (
    (p.status = 'approved' and p.visibility = 'public')
    or (p.status = 'pending' and auth.uid() = p.user_id)
  )
  order by
    case when p.slug = requested_slug then 0 else 1 end,
    p.created_at desc
  limit 1;
$$;

grant execute on function public.get_anvya_post_by_slug(text) to anon, authenticated;

notify pgrst, 'reload schema';
