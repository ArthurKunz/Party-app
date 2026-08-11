-- The policies in the previous migration were circular and made every read fail with
-- 42P17 (infinite recursion), including plain rsvps queries:
--
--   events_select_member  reads rsvps
--   rsvps_select_host     reads events   (it has always done this)
--
-- so evaluating either policy re-entered the other. RLS does not stop at the second
-- lap; Postgres just refuses the whole query.
--
-- The way out is to answer the membership question OUTSIDE row-level security. A
-- SECURITY DEFINER function is not subject to the policies of the tables it reads, so
-- the chain ends inside it. `stable` lets the planner call it once per row rather than
-- once per referenced column.

create or replace function public.is_party_member(p_event_id uuid)
returns boolean
language sql
security definer
stable
set search_path to 'public'
as $function$
  select exists (
    select 1
    from events e
    where e.id = p_event_id
      and (
        e.host_id = auth.uid()
        or exists (select 1 from rsvps r where r.event_id = e.id and r.user_id = auth.uid())
      )
  );
$function$;

-- Only signed-in callers ever reach it: all three policies below are `to authenticated`,
-- and an anonymous visitor has no membership to test in the first place.
revoke execute on function public.is_party_member(uuid) from public, anon;
grant execute on function public.is_party_member(uuid) to authenticated;

drop policy if exists "events_select_member" on public.events;

create policy "events_select_member"
  on public.events for select to authenticated
  using (public.is_party_member(id));

drop policy if exists "pools_select_member" on public.pools;

create policy "pools_select_member"
  on public.pools for select to authenticated
  using (public.is_party_member(event_id));

drop policy if exists "pool_options_select_member" on public.pool_options;

-- Reading `pools` here goes through the policy above, which ends in the same function,
-- so there is still no cycle.
create policy "pool_options_select_member"
  on public.pool_options for select to authenticated
  using (
    exists (
      select 1 from public.pools p
      where p.id = pool_options.pool_id and public.is_party_member(p.event_id)
    )
  );
