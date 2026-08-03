-- The host is part of their own event, so they must always appear in the guest
-- list — even when nobody has RSVPd yet. If the host has an rsvp row of their
-- own, that row wins (no duplicate); otherwise they are added as 'going'.
CREATE OR REPLACE FUNCTION get_event_attendees(p_event_id uuid)
RETURNS TABLE (user_id uuid, firstname text, lastname text, birthday text, avatar_url text, avatar_color text, status text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH rows AS (
    SELECT p.id, p.firstname, p.lastname, p.birthday, p.avatar_url, p.avatar_color, r.status
    FROM rsvps r
    JOIN profiles p ON p.id = r.user_id
    WHERE r.event_id = p_event_id AND r.status IN ('going', 'maybe', 'not_going')
    UNION ALL
    SELECT p.id, p.firstname, p.lastname, p.birthday, p.avatar_url, p.avatar_color, 'going'
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
    CASE status WHEN 'going' THEN 1 WHEN 'maybe' THEN 2 ELSE 3 END,
    firstname;
$$;
