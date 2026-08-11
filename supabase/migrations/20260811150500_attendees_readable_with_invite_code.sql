-- Walks back one consequence of the previous migration, on purpose.
--
-- Scoping get_event_attendees to members also hid the guest list from someone who
-- holds the invite link but has not answered yet — and seeing who is coming is half
-- of what makes you answer at all. On /e/[invite_code] the link IS the claim, the
-- same reasoning the party and pool lookups already follow.
--
-- get_event_attendees itself stays members-only: that is the one an event id reaches,
-- and an id must not be enough to pull names and birthdays.
--
-- Still revoked from anon. A logged-out visitor has seen no guest list since the
-- 09.08. lockdown, and that decision is untouched here.
create or replace function public.get_event_attendees_by_invite_code(p_invite_code text)
returns table(user_id uuid, firstname text, lastname text, birthday text, avatar_url text, avatar_color text, status text)
language sql
security definer
set search_path to 'public'
as $function$
  with party as (
    select e.id from events e where e.invite_code = p_invite_code
  ),
  rows as (
    select p.id, p.firstname, p.lastname, p.birthday, p.avatar_url, p.avatar_color, r.status
    from rsvps r
    join profiles p on p.id = r.user_id
    where r.event_id = (select id from party) and r.status in ('going', 'maybe', 'not_going')
    union all
    -- The host is their own role rather than a guest, and only appears here when they
    -- hold no rsvps row of their own.
    select p.id, p.firstname, p.lastname, p.birthday, p.avatar_url, p.avatar_color, 'host'
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
