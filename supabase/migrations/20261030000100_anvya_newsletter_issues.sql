-- Enable owners to manage their newsletters and issues.
-- DROP first so this migration is safe on databases where an earlier
-- partial application already created one or more of these policies.
drop policy if exists "Owners can create newsletters" on public.anvya_newsletters;
create policy "Owners can create newsletters"
  on public.anvya_newsletters for insert
  with check (owner_user_id = auth.uid()::text);

drop policy if exists "Owners can update newsletters" on public.anvya_newsletters;
create policy "Owners can update newsletters"
  on public.anvya_newsletters for update
  using (owner_user_id = auth.uid()::text)
  with check (owner_user_id = auth.uid()::text);

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
create index if not exists anvya_newsletter_issues_public_idx
  on public.anvya_newsletter_issues(newsletter_id, status, published_at desc);
alter table public.anvya_newsletter_issues enable row level security;

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
