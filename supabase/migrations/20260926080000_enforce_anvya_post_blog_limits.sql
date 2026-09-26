-- Enforce ANVYA post/blog content limits at the database layer.
-- Posts: caption only, maximum 3,000 characters.
-- Blogs: article body, maximum 300 words.
create or replace function public.validate_anvya_post_limits()
returns trigger
language plpgsql
as $$
declare
  plain_text text;
  word_count integer;
begin
  plain_text := btrim(regexp_replace(coalesce(new.content, ''), '<[^>]*>', ' ', 'g'));
  plain_text := regexp_replace(plain_text, '\s+', ' ', 'g');

  if new.post_type = 'post' and char_length(plain_text) > 3000 then
    raise exception 'ANVYA posts are limited to 3000 characters';
  end if;

  if new.post_type = 'blog' then
    if plain_text = '' then
      word_count := 0;
    else
      word_count := array_length(regexp_split_to_array(plain_text, '\s+'), 1);
    end if;
    if word_count > 300 then
      raise exception 'ANVYA blogs are limited to 300 words';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_anvya_post_limits on public.idea_posts;
create trigger trg_validate_anvya_post_limits
before insert or update of content, post_type on public.idea_posts
for each row execute function public.validate_anvya_post_limits();
