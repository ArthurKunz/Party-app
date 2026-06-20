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
We are in V1. Auth is complete. Supabase is connected. middleware.ts is in place. Onboarding is complete. create party page ready. My parties overview page ready (hosting/attending tabs, both clickable). Bottom nav (glass pill) ready. Event detail page /parties/[id] branches host vs guest: host sees copyable link + Bearbeiten (stub) + delete; guest sees host info + RSVP toggle. Public invite page /e/[invite_code] ready: signed-in users redirect to /parties/[id], anon users see the event and are sent to /login when they try to RSVP (after creating an account they must reopen the invite link to RSVP). RSVP working (upsert going/not_going); both statuses show under 'Ich bin Gast'. Attendees + host name are exposed publicly via SECURITY DEFINER functions. Added Profile page. Create party page is now a step-by-step flow (like onboarding): one topic per screen — Name, Beschreibung, Datum+Uhrzeit, Ort, Max. Gäste, then a finish screen with the copyable invite link. Cross (top-right) cancels to /parties; bottom progress dots show remaining questions and let you jump back to earlier ones (locked once the event is created). The event is created in Supabase on the last question; BottomNav is hidden during the flow. The Datum+Uhrzeit step now uses a custom DateTimePicker component (features/events/components/DateTimePicker.tsx): calendar on the left with month navigation (past days grayed/strikethrough, today gets a brand-pink dot, selected day gets white highlight), scrollable 15-min time slots on the right, German summary line once both are selected. Pool (voting) system complete: hosts create polls via a dedicated 'Umfragen' step in the create flow (after description, before done) or via the '+ Hinzufügen' button on the event detail page. Two pool types — 'options' (host sets fixed choices; optional text explanation per vote) and 'text_only' (guests respond with free text only). Guests vote/respond and can update or withdraw answers; all responses (names + content) visible to everyone. DB: pools, pool_options, pool_responses tables with RLS; get_pool_responses_by_event SECURITY DEFINER function exposes respondent names. Components: CreatePoolForm, PoolCard, PoolsSection (features/events/components/).

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