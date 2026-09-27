-- Ensure the canonical Google September 2026 ANVYA article is a real published post
-- owned by the Saurabh Anand profile, rather than a frontend-only fallback.

do $$
declare
  target_user uuid;
  target_profile text;
begin
  select p.user_id, p.public_id
    into target_user, target_profile
  from public.idea_profiles p
  where p.public_id = 'CST-76A57C84E0'
  limit 1;

  if target_user is null then
    return;
  end if;

  update public.idea_posts
  set
    user_id = target_user,
    profile_id = coalesce(target_profile, 'CST-76A57C84E0'),
    display_name = 'Saurabh Anand',
    title = 'Google September 2026 Spam Update: What SEO Professionals Need to Know',
    content = '<p>Google''s September 2026 Spam Update is a reminder that sustainable SEO depends on useful content, technical quality, and a site that genuinely serves its audience. For SEO professionals, the right response is not to make random changes after a ranking movement. Start with evidence from Google Search Console, analytics, crawl data, and your recent publishing history.</p><h2>What to Check After a Spam Update</h2><p>Review pages that lost impressions, clicks, or rankings and compare them with pages that remained stable. Look for thin or repetitive content, aggressive keyword targeting, copied sections, doorway-style pages, automatically generated pages without meaningful editorial value, and low-quality links. Check whether important pages are indexed correctly and whether your internal linking clearly connects related topics.</p><h2>Technical SEO Checks</h2><p>Run a crawl and review canonical tags, indexability, redirects, robots.txt, XML sitemaps, duplicate URLs, structured data, and Core Web Vitals. A technical issue may not be the only reason for a traffic change, but it can make it harder for search engines to discover and understand your strongest pages.</p><h2>Content Quality and Search Intent</h2><p>Refresh pages around real search intent instead of adding keywords simply to increase density. Strengthen first-hand insights, examples, original research, clear explanations, useful visuals, and trustworthy references. Remove pages that exist only to capture search traffic without providing a meaningful answer.</p><h2>What SEO Teams Should Do Next</h2><p>Document the pages affected, identify common patterns, make focused improvements, and monitor Search Console and analytics over time. Avoid large sitewide changes before you understand the pattern. The practical goal after a spam update is to build a cleaner, more useful website that deserves visibility for the queries it targets.</p>',
    post_type = 'blog',
    visibility = 'public',
    status = 'approved',
    slug = 'google-september-2026-spam-update',
    tags = array['Google SEO','Spam Update','SEO']
  where
    slug = 'google-september-2026-spam-update'
    or lower(trim(title)) = lower('Google September 2026 Spam Update: What SEO Professionals Need to Know');

  if not found then
    insert into public.idea_posts (
      user_id,
      profile_id,
      display_name,
      title,
      content,
      post_type,
      visibility,
      status,
      slug,
      tags
    ) values (
      target_user,
      coalesce(target_profile, 'CST-76A57C84E0'),
      'Saurabh Anand',
      'Google September 2026 Spam Update: What SEO Professionals Need to Know',
      '<p>Google''s September 2026 Spam Update is a reminder that sustainable SEO depends on useful content, technical quality, and a site that genuinely serves its audience. For SEO professionals, the right response is not to make random changes after a ranking movement. Start with evidence from Google Search Console, analytics, crawl data, and your recent publishing history.</p><h2>What to Check After a Spam Update</h2><p>Review pages that lost impressions, clicks, or rankings and compare them with pages that remained stable. Look for thin or repetitive content, aggressive keyword targeting, copied sections, doorway-style pages, automatically generated pages without meaningful editorial value, and low-quality links. Check whether important pages are indexed correctly and whether your internal linking clearly connects related topics.</p><h2>Technical SEO Checks</h2><p>Run a crawl and review canonical tags, indexability, redirects, robots.txt, XML sitemaps, duplicate URLs, structured data, and Core Web Vitals. A technical issue may not be the only reason for a traffic change, but it can make it harder for search engines to discover and understand your strongest pages.</p><h2>Content Quality and Search Intent</h2><p>Refresh pages around real search intent instead of adding keywords simply to increase density. Strengthen first-hand insights, examples, original research, clear explanations, useful visuals, and trustworthy references. Remove pages that exist only to capture search traffic without providing a meaningful answer.</p><h2>What SEO Teams Should Do Next</h2><p>Document the pages affected, identify common patterns, make focused improvements, and monitor Search Console and analytics over time. Avoid large sitewide changes before you understand the pattern. The practical goal after a spam update is to build a cleaner, more useful website that deserves visibility for the queries it targets.</p>',
      'blog',
      'public',
      'approved',
      'google-september-2026-spam-update',
      array['Google SEO','Spam Update','SEO']
    );
  end if;
end $$;

notify pgrst, 'reload schema';