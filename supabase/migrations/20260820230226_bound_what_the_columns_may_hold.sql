-- The rule from CLAUDE.md, applied to the columns that were still missing it: RLS
-- decides WHO may write a row, never WHAT is in it. The anon key ships in the browser
-- bundle, so every limit that lives only in a maxLength attribute is a suggestion —
-- anyone talking to PostgREST directly writes whatever they like.
--
-- Before this, the whole database held exactly two CHECKs: rsvps.status and pools.type.
-- Everything else was unbounded text.
--
-- Two deliberate choices about how tight to draw these:
--
-- 1. Every length cap is roughly ten times the app's own limit (title is capped at 20
--    characters in the form, at 200 here). The point is to stop a megabyte of text
--    from being written into a name that then has to render in every guest list — not
--    to enforce the form a second time. A constraint tighter than the UI would turn
--    some future copy change into a failed save, and that is a worse bug than the one
--    being fixed.
-- 2. The format checks are written against what the app actually produces today, which
--    was measured against the live rows first. invite_code accepts 8 characters as well
--    as 10 because one party from before the code was lengthened still has an 8-char
--    code, and a constraint that rejects existing data cannot be added at all.

-- ---------------------------------------------------------------- profiles

-- generateInviteCode's counterpart for colours: avatar_color is picked from a fixed
-- palette in the UI, but it is a plain text column and lands in a style attribute.
alter table public.profiles drop constraint if exists profiles_avatar_color_check;
alter table public.profiles add constraint profiles_avatar_color_check
  check (avatar_color ~ '^#[0-9A-Fa-f]{6}$');

-- avatar_url is rendered straight into an <img src> that every other guest loads. Left
-- open, anyone could point their own avatar at a server they control and collect the
-- IP address of everybody who sees them in a guest list. Every write in the app comes
-- from getPublicUrl on the avatars bucket, so that is the only shape allowed.
-- If the storage host ever changes (custom domain, new project), this is the line to
-- widen.
alter table public.profiles drop constraint if exists profiles_avatar_url_check;
alter table public.profiles add constraint profiles_avatar_url_check
  check (
    avatar_url is null
    or avatar_url ~ '^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/avatars/'
  );

-- NAME_MAX is 20 in onboarding and in the edit screen.
alter table public.profiles drop constraint if exists profiles_name_length_check;
alter table public.profiles add constraint profiles_name_length_check
  check (length(firstname) <= 200 and length(lastname) <= 200);

-- ---------------------------------------------------------------- events

-- TITLE_MAX 20, DESCRIPTION_MAX 500. location has no maxLength at all — it comes out
-- of the address search rather than being typed — so it gets the same treatment.
alter table public.events drop constraint if exists events_text_length_check;
alter table public.events add constraint events_text_length_check
  check (
    length(title) <= 200
    and length(location) <= 500
    and length(description) <= 5000
  );

-- max_guests was the one number the client could make nonsensical. GUESTS_MAX is 500
-- in the form; zero or a negative cap would create a party nobody can ever accept,
-- because party_has_room compares the going-count against exactly this value.
alter table public.events drop constraint if exists events_max_guests_check;
alter table public.events add constraint events_max_guests_check
  check (max_guests is null or (max_guests > 0 and max_guests <= 100000));

-- Ten lowercase hex characters is what generateInviteCode produces; eight is the
-- legacy length still present on one row. Anything else is not a code this app made.
alter table public.events drop constraint if exists events_invite_code_check;
alter table public.events add constraint events_invite_code_check
  check (invite_code ~ '^[0-9a-f]{8,32}$');

-- ---------------------------------------------------------------- pools

-- QUESTION_MAX 60, DESCRIPTION_MAX 300, OPTION_MAX 30 in PoolDraftForm. text_response
-- is the one free-text field with no limit in the UI at all.
alter table public.pools drop constraint if exists pools_text_length_check;
alter table public.pools add constraint pools_text_length_check
  check (length(question) <= 600 and length(description) <= 3000);

alter table public.pool_options drop constraint if exists pool_options_label_length_check;
alter table public.pool_options add constraint pool_options_label_length_check
  check (length(label) <= 300);

alter table public.pool_responses drop constraint if exists pool_responses_text_length_check;
alter table public.pool_responses add constraint pool_responses_text_length_check
  check (length(text_response) <= 5000);
