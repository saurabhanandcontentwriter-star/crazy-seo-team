-- Update only the existing ANVYA post title.
-- No new columns and no changes to post ID, author/profile mapping, body, or slug.

update public.idea_posts
set title = 'Google September 2026 Spam Update: SEO Impact & What to Do'
where slug = 'google-september-2026-spam-update'
  and profile_id = 'CST-76A57C84E0';

notify pgrst, 'reload schema';
