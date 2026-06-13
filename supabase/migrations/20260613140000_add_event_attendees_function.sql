-- Returns the attendee list (name + birthday) for an event.
-- SECURITY DEFINER because profiles RLS only lets a user read their own row.
-- The EXISTS guard restricts the result to the event's host, so attendee PII
-- is only ever returned to the host managing that event.
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
    AND EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = p_event_id AND e.host_id = auth.uid()
    )
  ORDER BY p.firstname;
$$;
