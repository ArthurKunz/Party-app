-- Polls could be created and deleted by their host, but never changed: neither
-- pools nor pool_options had an UPDATE policy at all. Editing a saved poll would
-- have failed against RLS without saying so — PostgREST reports an update that
-- matches no row as a success with zero rows touched.
--
-- Both mirror the insert policies that are already there, so the reach is the same:
-- a host may change polls on parties they host, and nothing else.
create policy "pools_update_host"
  on public.pools for update to authenticated
  using ((select events.host_id from public.events where events.id = pools.event_id) = auth.uid())
  with check ((select events.host_id from public.events where events.id = pools.event_id) = auth.uid());

-- Updating a label rather than replacing the row is what keeps existing votes
-- attached: option_id is ON DELETE SET NULL, so deleting an option to rename it
-- would quietly orphan every answer that picked it.
create policy "pool_options_update_host"
  on public.pool_options for update to authenticated
  using ((
    select e.host_id from public.events e
    join public.pools p on p.event_id = e.id
    where p.id = pool_options.pool_id
  ) = auth.uid())
  with check ((
    select e.host_id from public.events e
    join public.pools p on p.event_id = e.id
    where p.id = pool_options.pool_id
  ) = auth.uid());
