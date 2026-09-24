alter table public.idea_profiles
  add column if not exists experience jsonb not null default '[]'::jsonb,
  add column if not exists education_details jsonb not null default '[]'::jsonb,
  add column if not exists projects jsonb not null default '[]'::jsonb,
  add column if not exists certificates jsonb not null default '[]'::jsonb,
  add column if not exists medium_url text;

comment on column public.idea_profiles.experience is 'LinkedIn-style work experience entries with role, company, dates and description.';
comment on column public.idea_profiles.education_details is 'LinkedIn-style education history.';
comment on column public.idea_profiles.projects is 'Portfolio project entries.';
comment on column public.idea_profiles.certificates is 'Certificate and credential entries.';
comment on column public.idea_profiles.medium_url is 'Public Medium profile URL.';
