-- Existing installations may already have anvya_newsletters from an
-- earlier/partial schema. CREATE TABLE IF NOT EXISTS does not add missing
-- columns to that table, so explicitly repair the slug column.
alter table public.anvya_newsletters
  add column if not exists slug text;

-- Backfill rows created before slug was introduced. Include the row id suffix
-- so names that are identical still receive unique slugs.
update public.anvya_newsletters
set slug =
  coalesce(
    nullif(trim(both '-' from regexp_replace(lower(coalesce(name, 'newsletter')),
      '[^a-z0-9]+', '-', 'g')), ''),
    'newsletter'
  ) || '-' || left(id::text, 8)
where slug is null or btrim(slug) = '';

-- Enforce the same constraints expected by the ANVYA Ideas application.
alter table public.anvya_newsletters
  alter column slug set not null;

create unique index if not exists anvya_newsletters_slug_key
  on public.anvya_newsletters(slug);

grant select, insert, update on public.anvya_newsletters to anon, authenticated;
notify pgrst, 'reload schema';
