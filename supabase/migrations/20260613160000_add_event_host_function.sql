-- Returns the host's name for an event. SECURITY DEFINER because profiles RLS
-- only lets a user read their own row; the host is the public face of the party
-- so exposing their name to anyone with the invite is acceptable.
CREATE OR REPLACE FUNCTION get_event_host(p_event_id uuid)
RETURNS TABLE (firstname text, lastname text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.firstname, p.lastname
  FROM events e
  JOIN profiles p ON p.id = e.host_id
  WHERE e.id = p_event_id;
$$;
