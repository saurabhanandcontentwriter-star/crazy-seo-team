-- Restore the canonical ANVYA post as the official September 2026 Google spam-update announcement.
-- Do not use a generated or generic image as the article image.
update public.idea_posts
set
  title = 'September 2026 spam update',
  image_url = null,
  content = '<p>Today we released the September 2026 spam update to Google Search. This is a normal spam update, and it will roll out for all languages and locations. The rollout may take up to two weeks to complete.</p><p><strong>Official source:</strong> <a href="https://status.search.google.com/incidents/XhUDXP7A67iHCD2kmbVu">Google Search Status Dashboard — September 2026 spam update</a></p>',
  post_type = 'blog',
  visibility = 'public',
  status = 'approved',
  rejection_reason = null,
  slug = 'google-september-2026-spam-update'
where slug = 'google-september-2026-spam-update'
   or profile_id = 'CST-76A57C84E0' and lower(trim(title)) in (
     lower('Google September 2026 Spam Update: What SEO Professionals Need to Know'),
     lower('Google September 2026 Spam Update: SEO Impact & What to Do')
   );

notify pgrst, 'reload schema';
