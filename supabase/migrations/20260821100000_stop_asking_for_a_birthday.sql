-- The app stops asking how old anyone is, so it stops storing it.
--
-- The birthday was in here for two unrelated reasons, and only separating them made
-- the decision possible. One was product: the guest list printed '21 Jahre alt' under
-- every name. The other was Art. 8 DSGVO, which asks for parental consent under 16 —
-- but Art. 8 only bites where the legal basis is consent, and running an account is
-- Art. 6(1)(b), performance of a contract. What actually triggered Art. 8 was the
-- audience: a service aimed at 14-year-olds is 'directed at children' whatever the
-- terms say. So the audience moves to 16+ and the column goes.
--
-- No column replaces it. There is no is_16_plus flag and no question at sign-up: the
-- threshold lives in the terms, and the cleanest way to hold a date of birth for
-- 14-to-25-year-olds is not to hold one.
--
-- Both RPCs lose their age column first. A SQL function's body is a string, not a
-- parsed dependency, so dropping profiles.birthday underneath them would not fail —
-- it would leave two functions that raise at call time instead.

drop function if exists public.get_event_attendees(uuid);

create function public.get_event_attendees(p_event_id uuid)
returns table(user_id uuid, firstname text, lastname text, avatar_url text, avatar_color text, status text)
language sql
security definer
set search_path to 'public'
as $function$
  with rows as (
    select p.id, p.firstname, p.lastname, p.avatar_url, p.avatar_color, r.status
    from rsvps r
    join profiles p on p.id = r.user_id
    where r.event_id = p_event_id and r.status in ('going', 'maybe', 'not_going')
    union all
    -- The host is their own role rather than a guest, and only appears here when they
    -- hold no rsvps row of their own.
    select p.id, p.firstname, p.lastname, p.avatar_url, p.avatar_color, 'host'
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
returns table(user_id uuid, firstname text, lastname text, avatar_url text, avatar_color text, status text)
language sql
security definer
set search_path to 'public'
as $function$
  with party as (
    select e.id from events e where e.invite_code = p_invite_code
  ),
  rows as (
    select p.id, p.firstname, p.lastname, p.avatar_url, p.avatar_color, r.status
    from rsvps r
    join profiles p on p.id = r.user_id
    where r.event_id = (select id from party) and r.status in ('going', 'maybe', 'not_going')
    union all
    select p.id, p.firstname, p.lastname, p.avatar_url, p.avatar_color, 'host'
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

alter table public.profiles drop column birthday;
