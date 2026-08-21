-- Six foreign keys had no covering index. Postgres creates one for a PRIMARY KEY and
-- for UNIQUE, but never for the referencing side of a FOREIGN KEY — so every one of
-- these joins was a sequential scan waiting to become slow.
--
-- These are exactly the joins the app makes on its busiest screens: the party list
-- reads rsvps by user, every attendee RPC joins profiles onto rsvps, and the poll
-- section walks pools → pool_options → pool_responses for one event at a time.
--
-- Purely additive: an index changes no row and no policy, only how the planner
-- reaches them. Nothing here can reject a write that used to succeed.

-- Every 'Gastgeber' tab is `where host_id = me`.
create index if not exists events_host_id_idx on public.events (host_id);

-- Every 'Gast' tab is `where user_id = me`, and the delete-a-guest path finds a row
-- the same way.
create index if not exists rsvps_user_id_idx on public.rsvps (user_id);

-- The party detail screen loads all polls of one event.
create index if not exists pools_event_id_idx on public.pools (event_id);

-- ...and then the options of each poll.
create index if not exists pool_options_pool_id_idx on public.pool_options (pool_id);

-- get_pool_responses_by_event joins profiles onto the answers; the single-answer
-- trigger looks a person's existing row up by the same column.
create index if not exists pool_responses_user_id_idx on public.pool_responses (user_id);

-- The composite FK points at (pool_id, option_id), so the index has to match that
-- pair rather than option_id alone — it is what makes deleting an option cheap.
create index if not exists pool_responses_pool_option_idx on public.pool_responses (pool_id, option_id);
