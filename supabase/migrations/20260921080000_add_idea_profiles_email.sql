-- Keep Ideas profile email available for Gmail-code login lookups.
alter table public.idea_profiles
  add column if not exists email text;

update public.idea_profiles p
set email = u.email
from auth.users u
where u.id = p.user_id
  and (p.email is null or p.email = '');

create index if not exists idea_profiles_email_idx
  on public.idea_profiles(lower(email));
