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
The auth funnel had three ways to strand a user, all of them reachable with the back
button, and they are now closed. THE ROOT CAUSE was that the rule 'a session without a
`profiles` row still owes us onboarding' lived in exactly one place — `app/(auth)/callback/route.ts`
— which only ever runs for Google. An email user who verified their code and then walked
BACKWARDS out of onboarding was signed in, profile-less and stuck on `/login`: signing
up again hit their OWN account (Supabase answers a repeat signup with a decoy user
carrying `identities: []`, so the sheet said 'diese Email hat schon ein Konto'), and
signing in worked but dropped them on `/parties` with no profile.

That gate now lives in `proxy.ts`, where it holds for every route and every way in,
including a typed URL. After `getUser()` it reads `profiles.id` once (RLS already lets a
user read their own row) and applies two mirrored rules: a session WITHOUT a profile is
sent to `/onboarding`, and a session WITH one is sent off `/login` and `/onboarding` to
`?next=` or `/parties`. The intent survives the bounce — on `/login` it comes from the
query (an invite link put it there), anywhere else it is the path itself, so a profile-less
visitor on `/e/abc` onboards and lands back on that party. TWO ROUTES ARE EXEMPT
(`GATE_EXEMPT`) because they legitimately run with a session on a half-finished account:
`/callback`, which routes itself, and `/forgot-password`, where a recovery link lands —
verifying that token CREATES a session, so gating it would make password reset
unreachable. The signed-out branch is unchanged (verified: `/` and `/parties` still 307 to
`/login`, carrying `?next=`). Note this costs one indexed query per authenticated
navigation, next to the `getUser()` roundtrip that was already there. The duplicate checks
in `/callback` and in `app/page.tsx` are now redundant but were left alone.

Three consequences in the UI. (1) Onboarding step one's back button can no longer just
push `/login` — it would bounce straight back off the new gate — so it calls the new
`signOut()` in `features/onboarding/services/onboarding.service.ts` first. Leaving
onboarding now means leaving the SESSION; the account survives and signing in returns to
step one, which is also the escape hatch for having signed up with the wrong address.
(2) The verification sheet got its own 'Code erneut senden' (`resendSignupOtp` →
`supabase.auth.resend({ type: 'signup' })`), because the only route to a fresh code used
to lead backwards through the sign-up form. It stays clickable after a successful send —
a second mail is the whole point for someone whose first never arrived, and the send rate
limit is what says when to stop, surfacing as the existing `over_email_send_rate_limit`
banner. (3) The 'diese Email hat schon ein Konto' warning now carries a 'Stattdessen
anmelden' action (`emailTaken` state, set from both the decoy-user check and the
`user_already_exists`/`email_exists` codes), and going back from verify keeps the typed
address in the field via `initialEmail`. Not touched: the sign-in sheet does not prefill
that address, and abandoned unconfirmed signups still leave a row in `auth.users` — it is
reused by the next signup with the same address, so it is harmless.

NOTE `npm run build` fails on `/profile/account` with `TypeError: Cannot read properties
of null (reading 'useContext')` during prerender. That is PRE-EXISTING — verified by
building a clean tree — and unrelated to any of the above; `tsc --noEmit` and eslint are
clean.

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