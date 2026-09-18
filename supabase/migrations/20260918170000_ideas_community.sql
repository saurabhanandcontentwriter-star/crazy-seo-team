create table if not exists public.idea_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  display_name text,
  location text,
  mobile text,
  show_mobile boolean not null default false,
  subject text not null check (subject in ('Tech','AI','SEO')),
  title text not null,
  content text not null,
  image_url text,
  device_type text not null default 'Unknown' check (device_type in ('Mobile','Laptop/Desktop','Unknown')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  rejection_reason text,
  created_at timestamptz not null default now()
);

create index if not exists idea_posts_status_created_idx on public.idea_posts(status, created_at desc);
alter table public.idea_posts enable row level security;

create policy "Anyone can read approved ideas" on public.idea_posts for select to anon, authenticated using (status='approved');
create policy "Users can read own ideas" on public.idea_posts for select to authenticated using (auth.uid()=user_id);
create policy "Users can create ideas" on public.idea_posts for insert to authenticated with check (auth.uid()=user_id and status='pending');
create policy "Admins manage ideas" on public.idea_posts for all to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role)) with check (public.has_role(auth.uid(),'admin'::public.app_role));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('idea-images','idea-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "Authenticated users upload idea images" on storage.objects for insert to authenticated with check (bucket_id='idea-images' and (storage.foldername(name))[1]=(select auth.uid()::text));
create policy "Public can read idea images" on storage.objects for select to public using (bucket_id='idea-images');