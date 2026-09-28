-- Fix the existing ANVYA Google September 2026 post only.
-- IMPORTANT: this migration intentionally does NOT INSERT a post.
-- It preserves the existing post id, user_id and original body/content.
do $$
declare
  target_user uuid;
  target_profile text := 'CST-76A57C84E0';
begin
  select user_id into target_user
  from public.idea_profiles
  where public_id = target_profile
  limit 1;

  if target_user is null then
    return;
  end if;

  update public.idea_posts
  set
    user_id = target_user,
    profile_id = target_profile,
    title = 'Google September 2026 Spam Update: SEO Impact & What to Do',
    slug = 'google-september-2026-spam-update',
    status = 'approved',
    visibility = 'public'
  where id = (
    select p.id
    from public.idea_posts p
    where p.slug = 'google-september-2026-spam-update'
       or lower(trim(p.title)) in (
         lower('Google September 2026 Spam Update: What SEO Professionals Need to Know'),
         lower('Google September 2026 Spam Update: SEO Impact & What to Do')
       )
    order by
      case when p.slug = 'google-september-2026-spam-update' then 0 else 1 end,
      p.created_at asc
    limit 1
  );
end $$;

notify pgrst, 'reload schema';
