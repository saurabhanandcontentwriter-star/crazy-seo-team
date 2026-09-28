-- Add optional SEO metadata fields for ANVYA posts.
alter table public.idea_posts
  add column if not exists meta_title text,
  add column if not exists meta_description text;

-- Update only the existing Google September 2026 ANVYA post.
-- Preserve its ID, user/profile mapping, body content, slug and shareable URL.
update public.idea_posts
set
  title = 'Google September 2026 Spam Update: SEO Impact & What to Do',
  meta_title = 'Google September 2026 Spam Update: SEO Impact & What to Do',
  meta_description = 'Google September 2026 Spam Update explained: SEO impact, content quality checks, technical fixes, and practical steps to protect search visibility.'
where slug = 'google-september-2026-spam-update'
  and profile_id = 'CST-76A57C84E0';

notify pgrst, 'reload schema';
