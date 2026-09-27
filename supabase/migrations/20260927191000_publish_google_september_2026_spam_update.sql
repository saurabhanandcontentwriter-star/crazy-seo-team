-- Publish the requested ANVYA article.
update public.idea_posts
set status = 'approved',
    visibility = 'public'
where slug = 'google-september-2026-spam-update';

notify pgrst, 'reload schema';
