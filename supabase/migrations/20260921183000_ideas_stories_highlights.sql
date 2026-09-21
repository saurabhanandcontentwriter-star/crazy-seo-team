create table if not exists public.idea_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('image','text')),
  media_url text,
  text_content text,
  visibility text not null default 'public' check (visibility in ('public','followers','private')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  constraint idea_stories_content_check check ((media_type='image' and media_url is not null and length(trim(media_url))>0) or (media_type='text' and text_content is not null and length(trim(text_content))>0)
);
create index if not exists idea_stories_user_created_idx on public.idea_stories(user_id,created_at desc);
create index if not exists idea_stories_expires_idx on public.idea_stories(expires_at);
create table if not exists public.idea_story_highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  cover_url text,
  created_at timestamptz not null default now()
);
create table if not exists public.idea_story_highlight_items (
  id uuid primary key default gen_random_uuid(),
  highlight_id uuid not null references public.idea_story_highlights(id) on delete cascade,
  story_id uuid references public.idea_stories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text,
  media_url text,
  text_content text,
  visibility text,
  created_at timestamptz not null default now(),
  unique(highlight_id,story_id)
);
alter table public.idea_stories enable row level security;
alter table public.idea_story_highlights enable row level security;
alter table public.idea_story_highlight_items enable row level security;
grant select on public.idea_stories to anon,authenticated;
grant insert,update,delete on public.idea_stories to authenticated;
grant select on public.idea_story_highlights to anon,authenticated;
grant insert,update,delete on public.idea_story_highlights to authenticated;
grant select on public.idea_story_highlight_items to anon,authenticated;
grant insert,update,delete on public.idea_story_highlight_items to authenticated;
create policy "Public active stories are viewable" on public.idea_stories for select to anon,authenticated using (expires_at>now() and (visibility='public' or user_id=(select auth.uid()) or (visibility='followers' and exists(select 1 from public.idea_follows f where f.follower_id=(select auth.uid()) and f.following_id=idea_stories.user_id))));
create policy "Users create own stories" on public.idea_stories for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Users update own stories" on public.idea_stories for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "Users delete own stories" on public.idea_stories for delete to authenticated using ((select auth.uid())=user_id);
create policy "Public highlights are viewable" on public.idea_story_highlights for select to anon,authenticated using (true);
create policy "Users create own highlights" on public.idea_story_highlights for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Users update own highlights" on public.idea_story_highlights for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "Users delete own highlights" on public.idea_story_highlights for delete to authenticated using ((select auth.uid())=user_id);
create policy "Public highlight items are viewable" on public.idea_story_highlight_items for select to anon,authenticated using (exists(select 1 from public.idea_story_highlights h where h.id=highlight_id));
create policy "Users create own highlight items" on public.idea_story_highlight_items for insert to authenticated with check ((select auth.uid())=user_id and exists(select 1 from public.idea_story_highlights h where h.id=highlight_id and h.user_id=(select auth.uid())) and exists(select 1 from public.idea_stories s where s.id=story_id and s.user_id=(select auth.uid()) and s.visibility='public'));
create policy "Users delete own highlight items" on public.idea_story_highlight_items for delete to authenticated using ((select auth.uid())=user_id);
