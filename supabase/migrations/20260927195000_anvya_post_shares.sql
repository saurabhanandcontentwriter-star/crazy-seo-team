create table if not exists public.idea_post_shares (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.idea_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null default 'web',
  created_at timestamptz not null default now(),
  unique(post_id,user_id)
);

alter table public.idea_post_shares enable row level security;

do $$ begin
  create policy "read post shares"
    on public.idea_post_shares for select
    to anon, authenticated
    using(true);

  create policy "users share posts"
    on public.idea_post_shares for insert
    to authenticated
    with check((select auth.uid())=user_id);

  create policy "users remove own shares"
    on public.idea_post_shares for delete
    to authenticated
    using((select auth.uid())=user_id);
exception when duplicate_object then null;
end $$;

create index if not exists idea_post_shares_post_id_idx
  on public.idea_post_shares(post_id);

notify pgrst, 'reload schema';
