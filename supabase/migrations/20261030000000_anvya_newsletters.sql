-- ANVYA newsletters: persistent publication and subscription records.
create table if not exists public.anvya_newsletters (
  id uuid primary key default gen_random_uuid(),
  owner_user_id text not null,
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique,
  tagline text not null check (char_length(tagline) between 1 and 180),
  logo_url text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.anvya_newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  newsletter_id uuid not null references public.anvya_newsletters(id) on delete cascade,
  subscriber_user_id text not null,
  created_at timestamptz not null default now(),
  unique (newsletter_id, subscriber_user_id)
);
create index if not exists anvya_newsletters_owner_idx on public.anvya_newsletters(owner_user_id);
create index if not exists anvya_newsletter_subscriptions_newsletter_idx on public.anvya_newsletter_subscriptions(newsletter_id);
alter table public.anvya_newsletters enable row level security;
alter table public.anvya_newsletter_subscriptions enable row level security;
-- Public can discover publications; write access is intentionally restricted until
-- Firebase identity is verified server-side (Firebase UID is not auth.uid()).
create policy "Public can read newsletters" on public.anvya_newsletters for select using (true);
create policy "Public can read newsletter subscription counts" on public.anvya_newsletter_subscriptions for select using (true);
