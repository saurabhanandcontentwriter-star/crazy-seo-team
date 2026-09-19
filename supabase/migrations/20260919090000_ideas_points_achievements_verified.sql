alter table public.idea_profiles add column if not exists verified boolean not null default false;

create table if not exists public.idea_post_achievements (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.idea_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_key text not null,
  achievement_name text not null,
  achievement_description text,
  points_awarded integer not null default 0,
  created_at timestamptz not null default now(),
  unique(post_id, achievement_key)
);
alter table public.idea_post_achievements enable row level security;
drop policy if exists "Public can read post achievements" on public.idea_post_achievements;
create policy "Public can read post achievements" on public.idea_post_achievements for select to anon, authenticated using (true);

create or replace function public.award_idea_post_points()
returns trigger
language plpgsql
security invoker
as $$
declare
  awarded integer;
begin
  if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
    awarded := case when new.post_type = 'question' then 5 else 10 end;

    insert into public.idea_post_achievements
      (post_id,user_id,achievement_key,achievement_name,achievement_description,points_awarded)
    values
      (new.id,new.user_id,'published_post','Post Published','Published an approved idea on ANVYA Discover.',awarded)
    on conflict (post_id,achievement_key) do nothing;

    if found then
      update public.idea_profiles
      set reputation_points = coalesce(reputation_points,0) + awarded,
          level = greatest(1, floor((coalesce(reputation_points,0) + awarded) / 100.0)::int + 1),
          updated_at = now()
      where user_id = new.user_id;

      insert into public.idea_badges(user_id,badge_key,badge_name,badge_description)
      values (new.user_id,'first_post','First Post','Published the first approved idea on ANVYA Discover.')
      on conflict (user_id,badge_key) do nothing;

      if (select count(*) from public.idea_posts where user_id=new.user_id and status='approved') >= 5 then
        insert into public.idea_badges(user_id,badge_key,badge_name,badge_description)
        values (new.user_id,'five_posts','5 Posts','Published five approved ideas.')
        on conflict (user_id,badge_key) do nothing;
      end if;

      if (select count(*) from public.idea_posts where user_id=new.user_id and status='approved') >= 10 then
        insert into public.idea_badges(user_id,badge_key,badge_name,badge_description)
        values (new.user_id,'ten_posts','10 Posts','Published ten approved ideas.')
        on conflict (user_id,badge_key) do nothing;
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists ideas_post_points_trigger on public.idea_posts;
create trigger ideas_post_points_trigger
after insert or update of status on public.idea_posts
for each row execute function public.award_idea_post_points();

create index if not exists idea_post_achievements_user_idx on public.idea_post_achievements(user_id);
create index if not exists idea_post_achievements_post_idx on public.idea_post_achievements(post_id);
