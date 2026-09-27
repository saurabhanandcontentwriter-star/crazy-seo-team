-- Link the existing Google September 2026 ANVYA article to the public Saurabh Anand profile.
-- This repairs legacy rows that were created before profile_id mapping was consistent.
update public.idea_posts p
set
  user_id = prof.user_id,
  profile_id = prof.public_id,
  status = 'approved',
  visibility = 'public'
from public.idea_profiles prof
where prof.public_id = 'CST-76A57C84E0'
  and p.slug = 'google-september-2026-spam-update';

notify pgrst, 'reload schema';
