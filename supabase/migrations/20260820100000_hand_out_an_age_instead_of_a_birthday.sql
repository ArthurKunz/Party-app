-- Both attendee RPCs returned profiles.birthday — the exact date — and no screen has
-- ever shown it. AttendeeList and PartyGuestsScreen render calculateAge(a.birthday)
-- and nothing else, so the day and month travelled to every invited browser to be
-- thrown away on arrival.
--
-- That is a plain Art. 5(1)(c) miss: the purpose is 'is this person 16 or 24', and an
-- integer answers it. It matters more here than elsewhere because the guest lists are
-- full of minors, and because get_event_attendees_by_invite_code deliberately asks for
-- no membership — holding the link is the whole claim, so whoever holds it got dates
-- of birth for the entire party.
--
-- age is null when the profile has no birthday, exactly as the column was.
--
-- Dropped rather than replaced: changing an OUT column's name and type is not
-- something CREATE OR REPLACE FUNCTION will do.

drop function if exists public.get_event_attendees(uuid);

create function public.get_event_attendees(p_event_id uuid)
returns table(user_id uuid, firstname text, lastname text, age int, avatar_url text, avatar_color text, status text)
language sql
security definer
set search_path to 'public'
as $function$
  with rows as (
    select p.id, p.firstname, p.lastname,
           extract(year from age(p.birthday))::int as age,
           p.avatar_url, p.avatar_color, r.status
    from rsvps r
    join profiles p on p.id = r.user_id
    where r.event_id = p_event_id and r.status in ('going', 'maybe', 'not_going')
    union all
    -- The host is their own role rather than a guest, and only appears here when they
    -- hold no rsvps row of their own.
    select p.id, p.firstname, p.lastname,
           extract(year from age(p.birthday))::int,
           p.avatar_url, p.avatar_color, 'host'
    from events e
    join profiles p on p.id = e.host_id
    where e.id = p_event_id
      and not exists (
        select 1 from rsvps r
        where r.event_id = p_event_id and r.user_id = e.host_id
      )
  )
  select *
  from rows
  where public.is_party_member(p_event_id)
  order by
    case status when 'host' then 0 when 'going' then 1 when 'maybe' then 2 else 3 end,
    firstname;
$function$;

revoke execute on function public.get_event_attendees(uuid) from public, anon;
grant execute on function public.get_event_attendees(uuid) to authenticated;

drop function if exists public.get_event_attendees_by_invite_code(text);

create function public.get_event_attendees_by_invite_code(p_invite_code text)
returns table(user_id uuid, firstname text, lastname text, age int, avatar_url text, avatar_color text, status text)
language sql
security definer
set search_path to 'public'
as $function$
  with party as (
    select e.id from events e where e.invite_code = p_invite_code
  ),
  rows as (
    select p.id, p.firstname, p.lastname,
           extract(year from age(p.birthday))::int as age,
           p.avatar_url, p.avatar_color, r.status
    from rsvps r
    join profiles p on p.id = r.user_id
    where r.event_id = (select id from party) and r.status in ('going', 'maybe', 'not_going')
    union all
    select p.id, p.firstname, p.lastname,
           extract(year from age(p.birthday))::int,
           p.avatar_url, p.avatar_color, 'host'
    from events e
    join profiles p on p.id = e.host_id
    where e.id = (select id from party)
      and not exists (
        select 1 from rsvps r
        where r.event_id = e.id and r.user_id = e.host_id
      )
  )
  select *
  from rows
  order by
    case status when 'host' then 0 when 'going' then 1 when 'maybe' then 2 else 3 end,
    firstname;
$function$;

revoke execute on function public.get_event_attendees_by_invite_code(text) from public, anon;
grant execute on function public.get_event_attendees_by_invite_code(text) to authenticated;
