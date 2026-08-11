-- Step 2: close the three world-readable select policies now that /e/[invite_code]
-- no longer needs them (see the invite-code RPCs in the previous migration).
--
-- What was open: `events`, `pools` and `pool_options` all had SELECT for the role
-- `public` with USING (true). Anyone — signed in or not — could read every party in
-- the database, every poll question, and every option. The worst of it was
-- events.invite_code: the links are the only thing standing between a private party
-- and the world, and they were being handed out with the rows.
--
-- 'Member' is the same definition the pool_responses policies already use: the host,
-- or anyone holding an RSVP for that event, regardless of status — someone who
-- answered 'not_going' still belongs to the party.
--
-- These subqueries run as the calling user. That works because a member can always
-- see their own rsvps row (rsvps_select_own) and, through this very policy, the event
-- it points at.

drop policy if exists "events_select_public" on public.events;

create policy "events_select_member"
  on public.events for select to authenticated
  using (
    host_id = auth.uid()
    or exists (select 1 from public.rsvps r where r.event_id = events.id and r.user_id = auth.uid())
  );

drop policy if exists "pools_select_public" on public.pools;

create policy "pools_select_member"
  on public.pools for select to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = pools.event_id
        and (
          e.host_id = auth.uid()
          or exists (select 1 from public.rsvps r where r.event_id = e.id and r.user_id = auth.uid())
        )
    )
  );

drop policy if exists "pool_options_select_public" on public.pool_options;

create policy "pool_options_select_member"
  on public.pool_options for select to authenticated
  using (
    exists (
      select 1
      from public.pools p
      join public.events e on e.id = p.event_id
      where p.id = pool_options.pool_id
        and (
          e.host_id = auth.uid()
          or exists (select 1 from public.rsvps r where r.event_id = e.id and r.user_id = auth.uid())
        )
    )
  );
