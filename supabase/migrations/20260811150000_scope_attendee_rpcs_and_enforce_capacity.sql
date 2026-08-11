-- Two holes that the table policies never covered, because all three functions are
-- SECURITY DEFINER and bypass RLS by design.
--
-- 1. get_event_attendees handed out firstname, lastname, avatar AND BIRTHDAY of every
--    guest to any signed-in caller who knew an event id — no membership required. For
--    an app whose users start at 14 that is the worst of the leftovers. The two
--    array-taking functions behind the party list had the same gap with less data.
--
-- 2. max_guests was decoration: CapacityWarning, isFull and the disabled 'zusagen'
--    button all live in the client, while the rsvps insert policy happily accepted a
--    seat at a full party. Anyone talking to the API directly walked past the cap.

-- Membership guard on the three attendee/host readers. is_party_member is itself
-- SECURITY DEFINER, so it answers without re-entering RLS; auth.uid() still reports
-- the real caller inside these functions, so the test is about them and not about the
-- function owner.
create or replace function public.get_event_attendees(p_event_id uuid)
returns table(user_id uuid, firstname text, lastname text, birthday text, avatar_url text, avatar_color text, status text)
language sql
security definer
set search_path to 'public'
as $function$
  with rows as (
    select p.id, p.firstname, p.lastname, p.birthday, p.avatar_url, p.avatar_color, r.status
    from rsvps r
    join profiles p on p.id = r.user_id
    where r.event_id = p_event_id and r.status in ('going', 'maybe', 'not_going')
    union all
    select p.id, p.firstname, p.lastname, p.birthday, p.avatar_url, p.avatar_color, 'host'
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

create or replace function public.get_attendee_avatars_for_events(p_event_ids uuid[])
returns table(event_id uuid, user_id uuid, firstname text, lastname text, avatar_url text, avatar_color text)
language sql
security definer
set search_path to 'public'
as $function$
  select r.event_id, r.user_id, p.firstname, p.lastname, p.avatar_url, p.avatar_color
  from rsvps r
  join profiles p on p.id = r.user_id
  where r.event_id = any(p_event_ids)
    and r.status = 'going'
    and public.is_party_member(r.event_id)
  order by r.responded_at asc;
$function$;

create or replace function public.get_host_info_for_events(p_event_ids uuid[])
returns table(event_id uuid, firstname text, lastname text, avatar_url text, avatar_color text)
language sql
security definer
set search_path to 'public'
as $function$
  select e.id as event_id, p.firstname, p.lastname, p.avatar_url, p.avatar_color
  from events e
  join profiles p on p.id = e.host_id
  where e.id = any(p_event_ids)
    and public.is_party_member(e.id);
$function$;

-- Capacity, counted the way the client counts it: get_rsvp_counts_by_status ignores
-- the host, so max_guests is a guest number and the host never occupies a place.
--
-- SECURITY DEFINER again, and for the same reason as is_party_member: a policy ON
-- rsvps that reads rsvps would be circular, and Postgres answers that with 42P17
-- rather than with a row.
--
-- Someone who already holds a 'going' row keeps their seat — otherwise re-saving the
-- same answer at a full party would fail.
create or replace function public.party_has_room(p_event_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path to 'public'
as $function$
  select case
    when (select e.max_guests from events e where e.id = p_event_id) is null then true
    when exists (
      select 1 from rsvps r
      where r.event_id = p_event_id and r.user_id = p_user_id and r.status = 'going'
    ) then true
    else (select count(*) from rsvps r where r.event_id = p_event_id and r.status = 'going')
         < (select e.max_guests from events e where e.id = p_event_id)
  end;
$function$;

revoke execute on function public.party_has_room(uuid, uuid) from public, anon;
grant execute on function public.party_has_room(uuid, uuid) to authenticated;

-- Only 'going' costs a place; saying maybe or no stays open at a full party, exactly
-- like the invite screen's own rule.
drop policy if exists "rsvps_insert_authenticated" on public.rsvps;

create policy "rsvps_insert_authenticated"
  on public.rsvps for insert to authenticated
  with check (
    user_id = auth.uid()
    and not exists (
      select 1 from public.events e where e.id = rsvps.event_id and e.host_id = auth.uid()
    )
    and (status <> 'going' or public.party_has_room(event_id, auth.uid()))
  );

drop policy if exists "rsvps_update_own" on public.rsvps;

create policy "rsvps_update_own"
  on public.rsvps for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and not exists (
      select 1 from public.events e where e.id = rsvps.event_id and e.host_id = auth.uid()
    )
    and (status <> 'going' or public.party_has_room(event_id, auth.uid()))
  );
