alter table public.idea_profiles
  add column if not exists working text,
  add column if not exists company text,
  add column if not exists education text;

comment on column public.idea_profiles.working is 'Current work role or profession shown on the public Ideas profile.';
comment on column public.idea_profiles.company is 'Current or recent company shown on the public Ideas profile.';
comment on column public.idea_profiles.education is 'Education or institution shown on the public Ideas profile.';
