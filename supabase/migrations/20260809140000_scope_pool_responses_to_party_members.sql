-- Poll answers were readable by EVERY signed-in user and writable by every signed-in
-- user: the select policy was USING (true), and the insert policy only checked that
-- the row carried your own user_id — not that you were on the party at all. Since
-- pool ids are readable through pools_select_public, any account could both read who
-- answered what at a stranger's party and vote in it.
--
-- 'Member' means the host, or anyone holding an RSVP for that event — the same two
-- groups the rsvps policies already recognise, and no RSVP status is required beyond
-- having answered, since a guest who said 'not_going' still belongs to the party.
--
-- These subqueries run as the calling user, which works because events is readable
-- and the rsvps select policy already lets a user see their own row.

drop policy if exists "pool_responses_select_authenticated" on public.pool_responses;
drop policy if exists "pool_responses_insert_authenticated" on public.pool_responses;
drop policy if exists "pool_responses_update_own" on public.pool_responses;

create policy "pool_responses_select_member"
  on public.pool_responses for select to authenticated
  using (
    exists (
      select 1
      from public.pools p
      join public.events e on e.id = p.event_id
      where p.id = pool_responses.pool_id
        and (
          e.host_id = auth.uid()
          or exists (select 1 from public.rsvps r where r.event_id = e.id and r.user_id = auth.uid())
        )
    )
  );

create policy "pool_responses_insert_member"
  on public.pool_responses for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.pools p
      join public.events e on e.id = p.event_id
      where p.id = pool_responses.pool_id
        and (
          e.host_id = auth.uid()
          or exists (select 1 from public.rsvps r where r.event_id = e.id and r.user_id = auth.uid())
        )
    )
  );

create policy "pool_responses_update_member"
  on public.pool_responses for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.pools p
      join public.events e on e.id = p.event_id
      where p.id = pool_responses.pool_id
        and (
          e.host_id = auth.uid()
          or exists (select 1 from public.rsvps r where r.event_id = e.id and r.user_id = auth.uid())
        )
    )
  );

-- The policies above do NOT cover the read path the app actually uses: this function
-- is SECURITY DEFINER, so it bypasses RLS by design (that is how it reaches profiles).
-- The same membership test therefore has to be written into the function itself, or
-- locking the table would have changed nothing for the only caller that matters.
-- Signature and column order are unchanged, so the client keeps working as-is.
create or replace function public.get_pool_responses_by_event(p_event_id uuid)
 returns table(id uuid, pool_id uuid, user_id uuid, option_id uuid, text_response text, created_at timestamp with time zone, firstname text, lastname text, avatar_url text, avatar_color text)
 language sql
 security definer
 set search_path to 'public'
as $function$
  select
    pr.id,
    pr.pool_id,
    pr.user_id,
    pr.option_id,
    pr.text_response,
    pr.created_at,
    prof.firstname,
    prof.lastname,
    prof.avatar_url,
    prof.avatar_color
  from public.pool_responses pr
  join public.pools p on p.id = pr.pool_id
  join public.profiles prof on prof.id = pr.user_id
  where p.event_id = p_event_id
    and exists (
      select 1
      from public.events e
      where e.id = p_event_id
        and (
          e.host_id = auth.uid()
          or exists (select 1 from public.rsvps r where r.event_id = e.id and r.user_id = auth.uid())
        )
    )
  order by pr.created_at;
$function$;

-- create or replace keeps the existing ACL, but re-stating it means this migration
-- describes the end state on its own rather than depending on the previous one.
revoke execute on function public.get_pool_responses_by_event(uuid) from public, anon;
grant execute on function public.get_pool_responses_by_event(uuid) to authenticated;
