-- Same rule as get_event_attendees: the host counts as attending their own
-- event. Adds 1 only when the host has no rsvp row of their own — if they do,
-- that row is already counted under whatever status they picked.
CREATE OR REPLACE FUNCTION get_rsvp_counts_by_status(p_event_id uuid)
RETURNS TABLE (going_count integer, maybe_count integer, not_going_count integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*) FILTER (WHERE r.status = 'going')::integer + (
      SELECT COUNT(*)::integer FROM events e
      WHERE e.id = p_event_id
        AND NOT EXISTS (SELECT 1 FROM rsvps h WHERE h.event_id = p_event_id AND h.user_id = e.host_id)
    ),
    COUNT(*) FILTER (WHERE r.status = 'maybe')::integer,
    COUNT(*) FILTER (WHERE r.status = 'not_going')::integer
  FROM rsvps r
  WHERE r.event_id = p_event_id;
$$;

CREATE OR REPLACE FUNCTION get_rsvp_count(p_event_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (SELECT COUNT(*)::integer FROM rsvps
          WHERE event_id = p_event_id AND status IN ('going', 'maybe'))
       + (SELECT COUNT(*)::integer FROM events e
          WHERE e.id = p_event_id
            AND NOT EXISTS (SELECT 1 FROM rsvps h WHERE h.event_id = p_event_id AND h.user_id = e.host_id));
$$;
