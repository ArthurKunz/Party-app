-- Returns the number of 'going' RSVPs for an event.
-- SECURITY DEFINER so guests (who can only read their own RSVP rows under RLS)
-- can still see the total headcount. Exposes only an aggregate count, no PII.
CREATE OR REPLACE FUNCTION get_rsvp_count(p_event_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM rsvps
  WHERE event_id = p_event_id AND status = 'going';
$$;
