-- Attendees are now visible to everyone with the event (anon + authenticated),
-- so drop the host-only gate. Still only lists people who are 'going'.
CREATE OR REPLACE FUNCTION get_event_attendees(p_event_id uuid)
RETURNS TABLE (user_id uuid, firstname text, lastname text, birthday text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.firstname, p.lastname, p.birthday
  FROM rsvps r
  JOIN profiles p ON p.id = r.user_id
  WHERE r.event_id = p_event_id
    AND r.status = 'going'
  ORDER BY p.firstname;
$$;
