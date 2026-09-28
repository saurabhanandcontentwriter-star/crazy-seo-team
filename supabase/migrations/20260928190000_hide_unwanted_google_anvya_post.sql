-- Hide the unwanted Google September 2026 ANVYA post.
-- Keep the database row for history, but prevent it from appearing in public feeds/profiles.
update public.idea_posts
set status = 'rejected',
    rejection_reason = 'Hidden from ANVYA public feed at user request.'
where slug = 'google-september-2026-spam-update'
   or lower(trim(title)) = lower('Google September 2026 Spam Update: What SEO Professionals Need to Know');

notify pgrst, 'reload schema';
