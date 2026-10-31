-- Repair ANVYA newsletter schema on projects where the original migration
-- was not applied (or PostgREST has not refreshed its schema cache).
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

create table if not exists public.anvya_newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  newsletter_id uuid not null references public.anvya_newsletters(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  slug text not null,
  content text not null,
  seo_title text,
  meta_description text,
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  published_at timestamptz not null default now(),
  unique (newsletter_id, slug)
);

create index if not exists anvya_newsletters_owner_idx
  on public.anvya_newsletters(owner_user_id);
create index if not exists anvya_newsletter_subscriptions_newsletter_idx
  on public.anvya_newsletter_subscriptions(newsletter_id);
create index if not exists anvya_newsletter_issues_public_idx
  on public.anvya_newsletter_issues(newsletter_id, status, published_at desc);

alter table public.anvya_newsletters enable row level security;
alter table public.anvya_newsletter_subscriptions enable row level security;
alter table public.anvya_newsletter_issues enable row level security;

grant select, insert, update on public.anvya_newsletters to anon, authenticated;
grant select on public.anvya_newsletter_subscriptions to anon, authenticated;
grant select, insert, update on public.anvya_newsletter_issues to anon, authenticated;

drop policy if exists "Public can read newsletters" on public.anvya_newsletters;
create policy "Public can read newsletters"
  on public.anvya_newsletters for select using (true);
drop policy if exists "Owners can create newsletters" on public.anvya_newsletters;
create policy "Owners can create newsletters"
  on public.anvya_newsletters for insert
  with check (owner_user_id = auth.uid()::text);
drop policy if exists "Owners can update newsletters" on public.anvya_newsletters;
create policy "Owners can update newsletters"
  on public.anvya_newsletters for update
  using (owner_user_id = auth.uid()::text)
  with check (owner_user_id = auth.uid()::text);

drop policy if exists "Public can read newsletter subscription counts" on public.anvya_newsletter_subscriptions;
create policy "Public can read newsletter subscription counts"
  on public.anvya_newsletter_subscriptions for select using (true);

drop policy if exists "Public can read published newsletter issues" on public.anvya_newsletter_issues;
create policy "Public can read published newsletter issues"
  on public.anvya_newsletter_issues for select using (status = 'published');
drop policy if exists "Newsletter owners can create issues" on public.anvya_newsletter_issues;
create policy "Newsletter owners can create issues"
  on public.anvya_newsletter_issues for insert with check (
    exists (select 1 from public.anvya_newsletters n
      where n.id = newsletter_id and n.owner_user_id = auth.uid()::text)
  );
drop policy if exists "Newsletter owners can update issues" on public.anvya_newsletter_issues;
create policy "Newsletter owners can update issues"
  on public.anvya_newsletter_issues for update
  using (exists (select 1 from public.anvya_newsletters n
    where n.id = newsletter_id and n.owner_user_id = auth.uid()::text))
  with check (exists (select 1 from public.anvya_newsletters n
    where n.id = newsletter_id and n.owner_user_id = auth.uid()::text));

-- Make the new relations immediately visible to PostgREST.
notify pgrst, 'reload schema';
