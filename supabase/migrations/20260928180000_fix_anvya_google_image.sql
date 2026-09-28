-- Replace the temporary ANVYA cover with an official Google Search Central image.
-- The September 2026 spam update is real and was released globally on Sep 24, 2026.
update public.idea_posts
set image_url = 'https://developers.google.com/static/search/images/home-social-share-lockup.jpg'
where slug = 'google-september-2026-spam-update'
   or lower(trim(title)) = lower('Google September 2026 Spam Update: What SEO Professionals Need to Know');