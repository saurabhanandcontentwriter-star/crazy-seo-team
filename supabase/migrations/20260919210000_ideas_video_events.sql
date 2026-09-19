alter table public.idea_posts
  add column if not exists video_url text,
  add column if not exists scheduled_for timestamptz null,
  add column if not exists event_start timestamptz,
  add column if not exists event_end timestamptz,
  add column if not exists event_location text,
  add column if not exists event_url text,
  add column if not exists event_max_attendees integer;

create index if not exists idea_posts_scheduled_for_idx on public.idea_posts(scheduled_for);
create index if not exists idea_posts_event_start_idx on public.idea_posts(event_start);

create table if not exists public.idea_event_rsvps (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.idea_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'going' check (status in ('going','interested','not_going')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id,user_id)
);

alter table public.idea_event_rsvps enable row level security;
drop policy if exists "Users can view event RSVPs" on public.idea_event_rsvps;\ncreate policy "Users can view event RSVPs" on public.idea_event_rsvps for select to authenticated using (true);
drop policy if exists "Users can manage own event RSVP" on public.idea_event_rsvps;\ncreate policy "Users can manage own event RSVP" on public.idea_event_rsvps for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "Users can update own event RSVP" on public.idea_event_rsvps;\ncreate policy "Users can update own event RSVP" on public.idea_event_rsvps for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists "Users can delete own event RSVP" on public.idea_event_rsvps;\ncreate policy "Users can delete own event RSVP" on public.idea_event_rsvps for delete to authenticated using ((select auth.uid())=user_id);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('idea-videos','idea-videos',true,52428800,array['video/mp4','video/webm','video/quicktime','video/ogg'])
on conflict (id) do update set public=true,file_size_limit=52428800,allowed_mime_types=excluded.allowed_mime_types;