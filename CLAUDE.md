@AGENTS.md

# CLAUDE.md

This is a party and event discovery app for people aged 14–25.
Read this entire file before writing any code.

---

## Project summary
A web app where hosts create public or private events and guests
discover and RSVP to them. Two user roles: host and guest.
Current phase: V1 MVP. Deadline: July 2026.

## Problem statement
For students and young people aged 14–25, finding out what's
happening socially still depends on being in the right WhatsApp
group or following the right person on Instagram. If you're new
to a city or university, events are invisible to you and you're
invisible to them. Facebook Events has discovery but is abandoned
by this generation. Hosts have no dedicated tool to manage
attendance or build credibility — it all gets lost across group
chats and stories.

## Tech stack
- Framework: Next.js 14, App Router only
- Language: TypeScript strict mode
- Database: Supabase (Postgres)
- Auth: Supabase Auth via @supabase/ssr
- Styling: Tailwind CSS

## Coding rules
- Always use my global.css variables. Never use things like bg-green-500 or bg-[#fff], but always use the variables. If there are no matching variables, ask me for permisson to create those.
- Icons: ONLY `lucide-react`. Never hand-roll an `<svg>` for an icon — no inline paths for chevrons, arrows, plus, close, etc. If lucide has no matching icon, ask me before drawing one. (The two deliberate exceptions are a brand mark lucide dropped — the Google logo on the auth sheet — and genuine illustration, not iconography.)
- The only other symbols allowed are Apple emojis (the native system emoji, e.g. 👤 🎂 📸 🤫 ⚖️). Emoji for flavour and list bullets, lucide for interface icons — never a drawn substitute for either.
- update the CLAUDE.md file after each change yourself
- Never use `any` type
- Always ask for my permission to commit or add something
- call me 'Arthur' every time you respond
- Always give me a summary of all changes at the end of all responses
- Always use App Router patterns — never Pages Router
- Default to server components, use `use client` only when needed
- Use createServerClient in server components and API routes
- Use createBrowserClient in client components
- Write RLS policies for every table — never skip this
- Never expose the Supabase service role key on the client
- Generate TypeScript types regularly: supabase gen types typescript

## commit rules
Always use this keywords:
- feat -> new feature
- fix -> bug fix
- refactor -> improve code without changing behavior
- style -> formatting/UI-only small changes
- docs -> documentation
- test -> tests
- chore -> maintenance stuff
- perf -> performance improvements
- built -> built config changes
- ci -> GitHub Actions / CI stuff
Always use this structure:
- git commit -m 'KEYWORD(FILE, CHANGES OR FEATURE): EXPLANATION OF THE COMMIT'
Always git push after commiting something

## Do not suggest these — locked out of this project
- Prisma, Firebase, PlanetScale (using Supabase)
- Clerk, NextAuth (using Supabase Auth)
- React Router, react-router-dom (using Next.js App Router)
- Redux, Zustand (use React state or Supabase realtime)
- Pages Router patterns
- Any use of `any` in TypeScript

## V1 features (in scope)
- Sign up / log in with email
- Profile: display name, initials avatar and age
- Create event: name, description, type, date, time, location
- Simple RSVP: coming / not coming 
- Host guest list: attendee names, ages, total headcount
- Shareable link format: /e/[invite_code] — no auth required to view basic info
- Non-users who open a link see basic info and are prompted to sign up
- Guest can click 'coming late' and provide the expected arriving time
- Location is displayed in a Map
- voting: the host asks a question, the guest answer or vote for something
- Checklist / who brings what
- click, navigation and loading animations
- Mobile responsive

## Not in V1 — do not suggest these
- Explore page: all public events, because we want to prevent a cold-start
- Profile photo upload (using initials avatar instead)
- Gender field on profiles (legal complexity for under-18 users)
- Age limits or restrictions on events
- Join request or host approval flow
- Collaborative event type
- Party score or reputation system
- Discovery feed with filters
- External sharing buttons (WhatsApp, Instagram)
- Push notifications
- PWA
- Native mobile app
- AI features
- Public profile pages
- Party type tags

## Data model (see SCHEMA.md for full detail)
Core tables: profiles, events, rsvps, tasks (stubbed), votes (stubbed)
Key fields:
- events.invite_code: short random string for shareable links
- rsvps.status: 'going' | 'not_going'
- profiles.party_score: integer, starts at 0, used in V2

## Folder structure
- app/ - all routes
- app/e/[invite_code]/ — event page via shareable link
- components/ — shared UI components
- lib/ — Supabase client setup and utility functions
- types/ — generated Supabase types and custom types
- features/ - all big parts of the web app like login or explore

## Environment variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only — never import on client)
- API keys
Never hardcode these. Always read from process.env.

## Current state
An audit turned up a set of holes; this pass fixed the ones that carry no behavioural
risk for signed-in users, and deliberately left the two that need a design decision
first. Everything below was verified against the live project, not just read.

TWO MIGRATIONS, both applied. (1) `20260809120000_lock_down_storage_and_anon_rpcs`:
the `event-backgrounds` storage policies checked only the bucket, so ANY signed-in
account could delete or replace EVERY party's background — they are now scoped to
`(storage.foldername(name))[1] = auth.uid()`, the same shape the avatars bucket
already used, which is safe because all 41 objects are written as
`{user_id}/{party_id}/background.ext` and none of them mismatched. An UPDATE policy
was added because the uploader passes `upsert: true` and there was none. Both buckets
got a `file_size_limit` and an `allowed_mime_types` list matching what the upload
screens already enforce in the client (5 MB avatars, 10 MB backgrounds, jpeg/png/webp/gif;
the largest existing file is 4.6 MB, so nothing was invalidated). `delete_self` got
`SET search_path = ''` — it was the only SECURITY DEFINER function without one, and
both names in its body were already schema-qualified. And the SECURITY DEFINER
functions that hand out profile data — `get_event_attendees` (firstname, lastname and
BIRTHDAY of every guest), `get_attendee_avatars_for_events`, `get_pool_responses_by_event`
— were callable WITHOUT AN ACCOUNT and are now `authenticated` only. NOTE the revoke
has to strip PUBLIC, not just `anon`: Postgres grants EXECUTE to PUBLIC by default,
which is how anon got in. (2) `20260809121000` did the same for `get_host_info_for_events`,
which nothing in the app calls. Verified by curling the REST API with the anon key:
those four now answer 401, while `get_event_host`, `get_rsvp_count` and
`get_rsvp_counts_by_status` still answer 200 — who is inviting you and how many are
coming is what an invitation is for, and they carry no personal data beyond the host's
name. THE ONE VISIBLE CONSEQUENCE: a logged-out visitor on `/e/[invite_code]` no longer
sees the guest list or the poll answers behind the sign-up sheet. Both callers already
map an error to an empty list, so nothing breaks, and it matches the V1 line that
non-users see basic info. Reversible with a single GRANT if that reads wrong.

TWO CODE FIXES. `CreatePartyScreen` uploaded to a bucket named `party-backgrounds` —
the event->party rename swept through the string but the BUCKET kept its name, so
every custom background since that commit failed against a bucket that does not
exist, and `if (!uploadError)` had no else, so it failed silently. It now uses a
`BG_BUCKET` constant with the real name and alerts if the upload fails, worded so it
is clear the party itself was still created. And `app/(auth)/callback/route.ts` called
`alert()` in the recovery branch — `alert` does not exist in Node, so an expired
password-reset link answered with a 500 instead of a redirect; it now logs and
redirects to `/login`, which is where the `code` branch below it already sent failures.

THEN A LAUNCH-BLOCKER surfaced from a live test: EMAIL CONFIRMATION IS CURRENTLY OFF
on the hosted project. A test signup with a foreign address came back with an
access_token straight away, `email_confirmed_at` set and `confirmation_sent_at` NULL —
no mail was ever sent (the test user was deleted again). Two consequences: anyone can
register an address they do not own, and — this is the code half — `signUp` returns a
SESSION, while AuthScreen still switched to `step: 'verify'` and asked for a code that
does not exist. `resend` answers 200 and delivers nothing, so the sheet I added
yesterday cheerfully claimed a new code was on its way. FIXED so the app is correct
under BOTH settings rather than pinned to one: `SignUpForm` passes
`data.session !== null` up as `alreadySignedIn`, and AuthScreen pushes straight to
onboarding when a session came back, keeping the verification sheet for the case where
signUp returns a user and no session. The session is the honest signal — whether a code
is on its way is a project setting, not something the client may assume. NOT fixable
from the code: the setting itself, and the custom SMTP it needs first — Supabase's
built-in mailer refuses delivery to any address outside the project team, so turning
confirmation back on without SMTP would lock out every real signup.

POLL ANSWERS were the last 'any account reads everything' hole and are now scoped to
party MEMBERS — the host, or anyone holding an RSVP of any status, since a guest who
said 'not_going' still belongs to the party. The catch worth remembering: the read path
is `get_pool_responses_by_event`, which is SECURITY DEFINER and therefore BYPASSES RLS,
so tightening the table policies alone would have changed nothing for the only caller
that matters — the membership test had to go INSIDE the function as well. The
`pool_responses` policies were tightened too (select/insert/update all require
membership now, not just `user_id = auth.uid()`), which is what actually stops a
stranger voting in someone else's poll, since that path writes to the table directly.
VERIFIED with real rows inside a transaction that was rolled back via a deliberate
RAISE: reading gave host=1, RSVP'd guest=1, outsider=0, and voting was ERLAUBT for the
guest and BLOCKIERT for the outsider. That change had ONE regression, fixed in the same
pass: `InviteScreen` loads the polls before the visitor has answered, when the answers
are correctly still none of their business, so the copy in state came back empty and
stayed empty after they said yes — `handleRsvp` now calls `refreshPools()` when the
previous status was null. Left alone: `pools` and `pool_options` are still
`select_public`, so the QUESTIONS are readable by anyone; only who answered what is
protected.

STILL OPEN, deliberately: `events` is `FOR SELECT TO public USING (true)`, so anyone
with the anon key can read every party including its exact address and invite_code,
and any signed-in account can open any party by id. Both need the public invite page
reworked (a SECURITY DEFINER lookup by invite_code, with the table scoped to host and
guests) plus an `is_public` column, which the schema does not have at all. Also open:
`pool_responses` readable by every signed-in user, votes accepted from non-attendees,
the pre-existing `/profile/account` prerender crash that blocks `npm run build`, and
the leaked-password-protection switch in the Supabase dashboard.


---

## Behavioral guidelines
These apply on top of all project-specific rules above.
**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### If you can choose from using "" or '' just the latter
Don't ask. Don't overthink, but doublecheck if you can really use '' instead of ""

### Think before coding
Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### Simplicity first
Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### Surgical changes
Touch only what you must. Clean up only your own mess.

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

### Goal-driven execution
Define success criteria. Loop until verified.

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.