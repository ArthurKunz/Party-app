-- Creating a party has been failing with
--   new row violates row-level security policy for table "events"
-- ever since is_party_member() took over the select policy in 20260811141500.
--
-- The insert itself was never the problem. `createParty` asks PostgREST for the new
-- row back (`.select('id, invite_code')`), which becomes INSERT ... RETURNING, and a
-- RETURNING clause is checked against the SELECT policy. That policy called
-- is_party_member(id), which looks the row up in `events` again — and because the
-- function is `stable` it runs on the snapshot the statement started with, where the
-- row being inserted does not exist yet. It answered false and the whole insert was
-- rejected.
--
-- Testing host_id first ends that: the column is part of the new row, so nothing has
-- to be looked up, and the host is a member of their own party by definition. Guests
-- still reach the function, which is what keeps the policy recursion out.
--
-- This does NOT widen who can read a party: the old policy already returned true for
-- the host, just via a query that could not see an uncommitted row.

drop policy if exists "events_select_member" on public.events;

create policy "events_select_member"
  on public.events for select to authenticated
  using (
    host_id = auth.uid()
    or public.is_party_member(id)
  );
