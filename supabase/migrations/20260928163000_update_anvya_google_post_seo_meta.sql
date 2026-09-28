-- Update only SEO metadata for the existing ANVYA Google September 2026 post.
-- Preserve the existing post ID, author/profile mapping, body content, slug, and shareable URL.

update public.idea_posts
set
  title = 'Google September 2026 Spam Update: SEO Impact & What to Do',
  meta_title = 'Google September 2026 Spam Update: SEO Impact & What to Do',
  meta_description = 'Google September 2026 Spam Update explained: SEO impact, content quality checks, technical fixes, and practical steps to protect search visibility.'
where slug = 'google-september-2026-spam-update'
  and profile_id = 'CST-76A57C84E0';

notify pgrst, 'reload schema';
