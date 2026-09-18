alter table public.idea_profiles add column if not exists public_id text, add column if not exists reputation_points integer not null default 0, add column if not exists level integer not null default 1;

update public.idea_profiles set public_id = coalesce(public_id, 'CST-' || upper(substr(replace(user_id::text,'-',''),1,10))) where public_id is null;
create unique index if not exists idea_profiles_public_id_key on public.idea_profiles(public_id);

create table if not exists public.idea_badges (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, badge_key text not null, badge_name text not null, badge_description text, created_at timestamptz not null default now(), unique(user_id,badge_key));
alter table public.idea_badges enable row level security;
create policy "Public can read idea badges" on public.idea_badges for select to anon, authenticated using (true);
create policy "Users can earn own idea badges" on public.idea_badges for insert to authenticated with check ((select auth.uid())=user_id);

create table if not exists public.idea_communities (id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade, slug text not null unique, name text not null, description text, cover_url text, visibility text not null default 'public' check (visibility in ('public','private')), created_at timestamptz not null default now());
alter table public.idea_communities enable row level security;
create policy "Public communities are readable" on public.idea_communities for select to anon, authenticated using (visibility='public' or owner_id=(select auth.uid()));
create policy "Users can create communities" on public.idea_communities for insert to authenticated with check (owner_id=(select auth.uid()));
create policy "Owners can update communities" on public.idea_communities for update to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));

create table if not exists public.idea_community_members (community_id uuid not null references public.idea_communities(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, role text not null default 'member' check (role in ('owner','leader','moderator','member')), created_at timestamptz not null default now(), primary key(community_id,user_id));
alter table public.idea_community_members enable row level security;
create policy "Members can read community membership" on public.idea_community_members for select to authenticated using (user_id=(select auth.uid()) or exists(select 1 from public.idea_communities c where c.id=community_id and c.visibility='public'));
create policy "Users can join public communities" on public.idea_community_members for insert to authenticated with check (user_id=(select auth.uid()) and exists(select 1 from public.idea_communities c where c.id=community_id and c.visibility='public'));
create policy "Users can leave communities" on public.idea_community_members for delete to authenticated using (user_id=(select auth.uid()));
create index if not exists idea_community_members_user_idx on public.idea_community_members(user_id);
create index if not exists idea_badges_user_idx on public.idea_badges(user_id);
