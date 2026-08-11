-- rsvps.status is plain text and nothing has checked its contents since 'maybe'
-- joined the other two: the original CHECK covered only 'going' and 'not_going' and
-- was dropped rather than widened.
--
-- The RLS policies do not cover this. They answer WHO may write a row — your own
-- user_id, not on your own party, only while there is room — and say nothing about
-- WHAT lands in the column. The anon key ships in the browser bundle, so an invited
-- guest can write any string into their own row, and every screen that maps the
-- status to a label, an emoji and a colour then looks up a word that is not there.
--
-- 'host' is deliberately NOT in this list: it is invented by get_event_attendees to
-- mark the host in the guest list and never stored as a row.

alter table public.rsvps
  add constraint rsvps_status_check
  check (status in ('going', 'maybe', 'not_going'));
