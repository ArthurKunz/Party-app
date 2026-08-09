-- The host used to be folded into the guest numbers: get_event_attendees returned
-- them with status 'going', and both count functions added 1 for them. So a party
-- capped at 20 was really 19 guests plus the host, the host appeared in their own
-- guest list as if they had accepted their own invitation, and "zugesagt: 1" showed
-- on a party nobody had answered yet.
--
-- They are not an answer, they are the reason there is something to answer. From here
-- the host is labelled 'host' in the guest list and counted nowhere. The host can
-- never hold an rsvps row anyway — the insert policy explicitly forbids it — so there
-- is no double counting to worry about; the NOT EXISTS guard below stays only so a
-- row written before that policy existed cannot produce two entries for one person.

-- Signature and column order unchanged, so the client keeps working as-is. Only the
-- host's status value and the sort key change: they now sort ABOVE all three answers.
create or replace function public.get_event_attendees(p_event_id uuid)
 returns table(user_id uuid, firstname text, lastname text, birthday text, avatar_url text, avatar_color text, status text)
 language sql
 security definer
 set search_path to 'public'
as $function$
  WITH rows AS (
    SELECT p.id, p.firstname, p.lastname, p.birthday, p.avatar_url, p.avatar_color, r.status
    FROM rsvps r
    JOIN profiles p ON p.id = r.user_id
    WHERE r.event_id = p_event_id AND r.status IN ('going', 'maybe', 'not_going')
    UNION ALL
    SELECT p.id, p.firstname, p.lastname, p.birthday, p.avatar_url, p.avatar_color, 'host'
    FROM events e
    JOIN profiles p ON p.id = e.host_id
    WHERE e.id = p_event_id
      AND NOT EXISTS (
        SELECT 1 FROM rsvps r
        WHERE r.event_id = p_event_id AND r.user_id = e.host_id
      )
  )
  SELECT *
  FROM rows
  ORDER BY
    CASE status WHEN 'host' THEN 0 WHEN 'going' THEN 1 WHEN 'maybe' THEN 2 ELSE 3 END,
    firstname;
$function$;

-- Headcount: the host term is gone. This feeds attendee_count on the party list.
create or replace function public.get_rsvp_count(p_event_id uuid)
 returns integer
 language sql
 security definer
 set search_path to 'public'
as $function$
  SELECT COUNT(*)::integer
  FROM rsvps
  WHERE event_id = p_event_id AND status IN ('going', 'maybe');
$function$;

-- The three stats under the party, and the number the capacity warning measures
-- max_guests against. Dropping the host from going_count is what makes "Max. Gäste"
-- mean guests: a party capped at 20 now holds 20 of them, plus whoever is throwing it.
create or replace function public.get_rsvp_counts_by_status(p_event_id uuid)
 returns table(going_count integer, maybe_count integer, not_going_count integer)
 language sql
 security definer
 set search_path to 'public'
as $function$
  SELECT
    COUNT(*) FILTER (WHERE r.status = 'going')::integer,
    COUNT(*) FILTER (WHERE r.status = 'maybe')::integer,
    COUNT(*) FILTER (WHERE r.status = 'not_going')::integer
  FROM rsvps r
  WHERE r.event_id = p_event_id;
$function$;

-- create or replace keeps the existing ACL, but re-stating it means this migration
-- describes the end state on its own. get_event_attendees hands out names and
-- birthdays, so it stays closed to anonymous callers; the two counts are numbers
-- only and remain readable on a public invite link.
revoke execute on function public.get_event_attendees(uuid) from public, anon;
grant execute on function public.get_event_attendees(uuid) to authenticated;
