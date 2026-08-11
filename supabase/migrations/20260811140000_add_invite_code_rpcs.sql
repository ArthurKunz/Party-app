-- Step 1 of closing the three world-readable select policies (events, pools,
-- pool_options). Those exist for one reason: /e/[invite_code] has to work without an
-- account. They pay for it by making EVERY party readable by anyone — invite codes
-- included, which is the whole secret the link relies on.
--
-- The way out is to serve that one page through functions keyed on the invite CODE
-- rather than leaving the tables open. Keying on the event id would not help: an
-- anonymous caller could still walk ids. The code is the secret, so the code is what
-- the lookup takes.
--
-- Additive on purpose: nothing is revoked here. The policies stay open until the
-- client actually uses these, which is the next migration.

-- Same columns the client's PARTY_DETAIL_COLUMNS asks for, in the same order, so the
-- row maps straight onto the PartyDetail type.
create or replace function public.get_party_by_invite_code(p_invite_code text)
returns table(
  id uuid,
  host_id uuid,
  title text,
  description text,
  event_date timestamptz,
  ends_at timestamptz,
  location text,
  invite_code text,
  background_url text,
  max_guests integer
)
language sql
security definer
set search_path to 'public'
as $function$
  select e.id, e.host_id, e.title, e.description, e.event_date, e.ends_at,
         e.location, e.invite_code, e.background_url, e.max_guests
  from events e
  where e.invite_code = p_invite_code;
$function$;

-- Questions and options only. Who answered what stays with
-- get_pool_responses_by_event, which is members-only and returns nothing to a
-- logged-out visitor — the invite page has always shown empty polls behind the
-- sign-up sheet, and that does not change.
--
-- json rather than a flat table: a poll carries a list of options, and one row per
-- option would only push the regrouping into the client for no gain.
create or replace function public.get_party_pools_by_invite_code(p_invite_code text)
returns json
language sql
security definer
set search_path to 'public'
as $function$
  select coalesce(json_agg(pool order by pool->>'created_at'), '[]'::json)
  from (
    select json_build_object(
      'id', p.id,
      'event_id', p.event_id,
      'question', p.question,
      'description', p.description,
      'type', p.type,
      'allow_text_response', p.allow_text_response,
      'allow_multiple', p.allow_multiple,
      'created_at', p.created_at,
      'options', (
        select coalesce(
          json_agg(json_build_object('id', o.id, 'pool_id', o.pool_id, 'label', o.label, 'position', o.position)
                   order by o.position),
          '[]'::json
        )
        from pool_options o
        where o.pool_id = p.id
      )
    ) as pool
    from pools p
    join events e on e.id = p.event_id
    where e.invite_code = p_invite_code
  ) pools_json;
$function$;

-- Postgres grants EXECUTE to PUBLIC by default; both are meant to be reachable
-- without an account, so this only makes the intent explicit rather than implicit.
grant execute on function public.get_party_by_invite_code(text) to anon, authenticated;
grant execute on function public.get_party_pools_by_invite_code(text) to anon, authenticated;
