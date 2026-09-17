-- Worldwide classified posting with explicit country restrictions.
-- Allowed: all countries except Pakistan, Bangladesh, Turkey/Türkiye, and Canada.
alter table public.classified_listings
  add column if not exists country text;

create or replace function public.reject_blocked_classified_country()
returns trigger
language plpgsql
as $$
declare
  normalized text;
begin
  normalized := lower(trim(coalesce(new.country, '')));
  if normalized in ('pk','pakistan','bd','bangladesh','tr','turkey','türkiye','turkiye','ca','canada') then
    raise exception 'Classified posting is not available in Pakistan, Bangladesh, Turkey/Türkiye, or Canada.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reject_blocked_classified_country on public.classified_listings;
create trigger trg_reject_blocked_classified_country
before insert or update of country on public.classified_listings
for each row execute function public.reject_blocked_classified_country();

create index if not exists classified_listings_country_idx on public.classified_listings(country);
