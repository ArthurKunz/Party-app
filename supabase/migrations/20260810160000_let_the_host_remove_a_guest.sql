-- The host can read every RSVP on their party (rsvps_select_host) but could not
-- remove one: the only delete policy was rsvps_delete_own, scoped to the row's own
-- user. So "Gast entfernen" had nothing to call. This adds the mirror of the select
-- policy — a host may delete RSVPs, but only on a party they actually host.
--
-- Note what this does NOT do: the guest keeps the invite link and can answer again.
-- Locking someone out would need a blocklist, which is its own feature.
create policy "rsvps_delete_host"
  on public.rsvps for delete to authenticated
  using (
    (select events.host_id from public.events where events.id = rsvps.event_id) = auth.uid()
  );
