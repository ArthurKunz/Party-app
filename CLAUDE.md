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
BottomNav was rebuilt from a reference screenshot (an iOS-style floating glass tab bar). It is no longer a full-width bar pinned to `bottom-0` on the dead `bg-background-main` token: it is now a centred floating pill — `bottom-safe-nav fixed left-1/2 -translate-x-1/2 z-30` (that safe-area utility already existed in globals.css but was unused) wrapping a `rounded-full bg-secondary backdrop-blur-xl p-1.5` container. The three destinations (`/parties`, `/create-party`, `/profile`) are now ONE uniform `ITEMS` array of 72x50 (`w-18 h-12.5`) links, so the `+` is no longer a visually special middle button. Their hand-rolled `<svg>`s are gone: lucide `PartyPopper` / `Plus` / `User` at size 24, `strokeWidth` 2.5 when active and 2 when not, coloured `text-label-large` active / `text-subheading` inactive. The active item sits under a single absolutely-positioned highlight capsule (`bg-tertiary`, same 72x50, `rounded-full`) that SLIDES via `translateX(activeIndex * 100%)` over `duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]` — the same one-pill-that-moves pattern as PartiesScreen's Gast/Gastgeber tabs, and it works because the items are equal width with no gap between them, so 100% of the capsule's own width is exactly one item. It renders only when `activeIndex >= 0`; `/create-party` can never be the active one, since the nav hides itself on that route (all three hide rules are unchanged). Not done here: `/parties` kept `PartyPopper` rather than becoming the reference's house icon, since it is 'Meine Partys' and the semantics were not part of the ask. The bar was then sized and positioned to Arthur's spec: the WHOLE pill is 50px tall (`h-12.5 p-1`), exactly PartiesScreen's Gast/Gastgeber switch — so it borrows that switch's geometry too, the capsule being `bottom-1 left-1 top-1` and the items `h-full` rather than each carrying its own 50px height (the bar used to be 62px: 50px items inside 6px of padding). It also sits FLUSH with the bottom edge now: `.bottom-safe-nav` is `bottom: 0` instead of `calc(1.5rem + env(safe-area-inset-bottom))` (5px was tried in between and Arthur asked for zero). NOTE what that trades away — the utility no longer clears the iPhone home indicator, which is what the safe-area inset was there for; Arthur asked for ~5px explicitly. `.pb-safe-nav` (6rem) was left alone, since it more than clears the shorter bar. TWO ANIMATIONS were then added on top of the sliding capsule (Arthur picked these two out of four offered; an entrance animation for the whole pill and a hide-on-scroll were both declined). (1) PRESS FEEDBACK: the `Link` is a `group` and the icon carries `group-active:scale-90` with the shared 200ms cubic-bezier — the scale sits on the ICON, never on the pill, because the pill is the surface carrying `backdrop-blur-xl` and animating it would flatten its blur. (2) ICON POP: the icon that just became active runs `.animate-nav-icon-pop` (new `@keyframes nav-icon-pop`, scale 1 → 1.22 → 1 over 300ms, matching the capsule's slide), replayed by giving the icon `key={active ? 'active' : 'idle'}` so React REMOUNTS it on every switch — a CSS animation on a persistent element only ever runs once. The icon is wrapped in TWO spans, the outer holding the press scale and the inner the pop, so the two never fight; note Tailwind v4 compiles `scale-90` to the `scale` property while the keyframe uses `transform`, so they would not actually collide, but the split keeps the two concerns readable. `prefers-reduced-motion` kills the pop, next to the other animation utilities.

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