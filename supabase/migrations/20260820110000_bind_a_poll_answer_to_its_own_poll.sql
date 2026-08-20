-- Three things nothing checked about a row in pool_responses. All three are the same
-- mistake in different clothes: the RLS policies answer WHO may write the row — your
-- own user_id, on a party you belong to — and say nothing about WHAT is in it. The
-- anon key ships in the browser bundle, so every rule that lives only in the UI is a
-- rule a guest can skip by hand.
--
-- 1. option_id could name an option belonging to a completely different poll. The old
--    FK pointed at pool_options(id) alone, so any option in the table satisfied it,
--    and the vote then counted towards a question nobody had been asked.
--
--    The composite FK needs a unique key on the pair it references. ON DELETE SET NULL
--    is narrowed to option_id: without the column list Postgres would null pool_id
--    too, which is NOT NULL, and deleting an option would fail instead of detaching
--    the answers — the behaviour updatePoolOption's comment relies on.
--
--    MATCH SIMPLE (the default) lets the whole constraint pass when option_id is null,
--    so text-only answers still write.
--
-- 2. The same person could vote for the same option repeatedly. addPoolResponse
--    toggles one option per call and a double tap raced itself into two rows, which
--    then counted twice in every tally.
--
-- 3. A single-answer poll had nothing holding it to one answer. The (pool_id, user_id)
--    unique key was dropped when multi-answer polls arrived — correctly, it broke
--    them — and nothing took its place for the polls that still need it. The trigger
--    restores it for allow_multiple = false only.
--
--    upsertPoolResponse deletes the old row before inserting the new one, so changing
--    your mind still works: by the time this fires there is nothing left to collide.

alter table public.pool_options
  add constraint pool_options_id_pool_id_key unique (id, pool_id);

alter table public.pool_responses
  drop constraint pool_responses_option_id_fkey,
  add constraint pool_responses_option_id_fkey
    foreign key (pool_id, option_id) references public.pool_options (pool_id, id)
    on delete set null (option_id);

alter table public.pool_responses
  add constraint pool_responses_pool_id_user_id_option_id_key unique (pool_id, user_id, option_id);

create or replace function public.enforce_single_answer_poll()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if (select p.allow_multiple from pools p where p.id = new.pool_id) then
    return new;
  end if;

  if exists (
    select 1 from pool_responses r
    where r.pool_id = new.pool_id
      and r.user_id = new.user_id
      and r.id <> new.id
  ) then
    raise exception 'poll % takes one answer per person', new.pool_id
      using errcode = 'check_violation';
  end if;

  return new;
end;
$function$;

create trigger pool_responses_single_answer
  before insert or update on public.pool_responses
  for each row execute function public.enforce_single_answer_poll();

-- A trigger function is not callable over the API — Postgres refuses it outside a
-- trigger and PostgREST never lists it — but it still carries the default EXECUTE
-- grant, and the security advisor reads that grant, not the calling rules.
revoke execute on function public.enforce_single_answer_poll() from public, anon, authenticated;
