-- You cannot be a guest at your own party. The host is already counted as
-- attending (see get_event_attendees / get_rsvp_counts_by_status), so an rsvp
-- row of their own would double them up and make the event show on BOTH the
-- 'Gastgeber' and the 'Gast' tab.
DROP POLICY IF EXISTS rsvps_insert_authenticated ON rsvps;
CREATE POLICY rsvps_insert_authenticated ON rsvps
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND e.host_id = auth.uid())
  );

DROP POLICY IF EXISTS rsvps_update_own ON rsvps;
CREATE POLICY rsvps_update_own ON rsvps
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND e.host_id = auth.uid())
  );
