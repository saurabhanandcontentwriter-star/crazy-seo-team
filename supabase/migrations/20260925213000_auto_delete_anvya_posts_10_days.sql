-- Automatically delete ANVYA posts 10 days after creation.
-- Related engagement/event rows use ON DELETE CASCADE, so their post-linked records
-- are removed with the post as well.
create extension if not exists pg_cron with schema extensions;

create index if not exists idea_posts_created_at_idx
  on public.idea_posts(created_at);

select cron.unschedule(jobid)
from cron.job
where jobname = 'delete-anvya-posts-older-than-10-days';

select cron.schedule(
  'delete-anvya-posts-older-than-10-days',
  '15 2 * * *',
  $$delete from public.idea_posts
    where created_at < now() - interval '10 days';$$
);
