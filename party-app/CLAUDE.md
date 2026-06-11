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
- Never use `any` type
- Always use App Router patterns — never Pages Router
- Default to server components, use `use client` only when needed
- Use createServerClient in server components and API routes
- Use createBrowserClient in client components
- Write RLS policies for every table — never skip this
- Never expose the Supabase service role key on the client
- Generate TypeScript types regularly: supabase gen types typescript

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
- Mobile responsive

## Not in V1 — do not suggest these
- Explore page: all public events, because we want to prevent a cold-start
- Profile photo upload (using initials avatar instead)
- Gender field on profiles (legal complexity for under-18 users)
- Age limits or restrictions on events
- Join request or host approval flow
- Collaborative event type or voting
- Party score or reputation system
- Discovery feed with filters
- External sharing buttons (WhatsApp, Instagram)
- Checklist / who brings what
- Push notifications
- PWA
- Native mobile app
- AI features
- Payments or monetization
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
Auth is complete. Supabase is connected. middleware.ts is in place.
Next task: onboarding process with full name, age and initials avatar

---

## Behavioral guidelines
These apply on top of all project-specific rules above.
**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

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