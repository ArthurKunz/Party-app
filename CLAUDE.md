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
Onboarding now has a 3rd step: profile picture. User sees 'Wie siehst du aus?' screen with a clickable circle (opens file picker), preview shown in-circle after selection, 'Weiter' button appears once a photo is picked, 'Überspringen →' button always visible to skip. On skip, a random avatar_color is assigned from a fixed pool of 10 colors (constants/onboarding.constants.ts). DB: profiles.avatar_url (nullable text) + profiles.avatar_color (text not null) added; avatars storage bucket created with RLS. Progress dots in onboarding are now dynamic (reflect current step index). EventCard redesigned: full-card background image (blurred+darkened via CSS filter) with branded gradient fallback; guest cards show RSVP status chip ('zugesagt'/'abgesagt'), event title, host avatar+name (left) and days/hours countdown (right); host cards omit RSVP chip and host row; both show muted location+time line and overlapping attendee circles (max 9 + '+N' overflow). getAttendedEvents now fetches background_url, rsvp_status, and host profile (firstname, lastname, avatar_url, avatar_color) in two batch queries; getHostedEvents fetches background_url. PartiesScreen passes isHost={tab==='hosting'} to EventCard.
Mobile layout pass complete: all screens use w-full/h-dvh/min-h-dvh instead of w-screen/h-screen; BottomNav uses safe-area-inset-bottom via .bottom-safe-nav utility; content pages use .pb-safe-nav to clear the nav + home indicator; viewport meta exports viewportFit='cover'; html/body have overflow-x:hidden; EventDetail hero uses h-[45dvh].
PartiesScreen event lists (both 'Ich hoste' and 'Ich bin Gast') are now sorted ascending by event_date (soonest first) client-side; getAttendedEvents in events.service.ts also sorts server-fetched rows the same way, and both services now select events.max_guests. EventCard has a new `featured` prop — PartiesScreen passes featured={index === 0} so the next upcoming event gets a bigger layout: large host avatar (guest view only) + zugesagt/abgesagt/vielleicht pill badge (RsvpBadge) top row, title + host name, then a 3-stat row (📅 Datum, ⏳ Tage/Stunden countdown, 👥 attendee/max. Gäste). Non-featured cards keep the compact layout: title + small host-avatar row on the left, badge + single Tage stat stacked top-right, attendee circles inline in the row (featured card still hangs its circles below the card edge, outside overflow-hidden). Host view (isHost=true) hides the avatar/badge/host-name row on both variants. RsvpBadge now covers all three RsvpStatus values via RSVP_BADGE_CONFIG (going ✅ zugesagt/success, not_going ❌ abgesagt/warning, maybe 🤔 vielleicht/maybe color token); EventWithCount.rsvp_status is typed as RsvpStatus | null and getAttendedEvents no longer force-casts RSVP rows to only 'going' | 'not_going', so maybe-status RSVPs now render correctly in "Ich bin Gast".
The host is now always included in the attendee circles shown by EventCard, on both tabs: getHostedEvents fetches the host's own profile and prepends it to attendees (+1 to attendee_count) so a host sees themselves even with zero RSVPs; getAttendedEvents prepends the host (using the real avatar from get_event_host, deduped if the host already has an rsvp row) so guests always see the host in the guest list too. host_avatar_color/host_avatar_url in getAttendedEvents now use get_event_host's real avatar_color/avatar_url instead of the old hash-based placeholder color and hardcoded null.
BottomNav now has explicit z-30 (was unset/auto) so it stacks above every screen's z-10/z-20 content layers regardless of DOM order; dropdown overlays (Combobox/Selectbox, z-50, onboarding-only) remain unaffected.
ProfileScreen's 5 setting-row circles (right side) are now transparent with a centered grey chevron-right icon (text-hint) instead of solid black circles.
All 5 ProfileScreen rows are now clickable Links to dedicated sub-pages (design untouched): /profile/name (EditNameScreen — edit firstname/lastname), /profile/age (EditAgeScreen — day/month/year Selectbox prefilled from birthday, day options clamp to the days-in-month), /profile/picture (EditPictureScreen — pick+upload a new avatar to the existing avatars bucket, same validation as onboarding's ProfilePictureForm), /profile/password (EditPasswordScreen — thin wrapper adding a back button around the existing features/settings/change-password.tsx form, which already does 2x password entry + usePasswordValidation strength check), /profile/legal (LegalScreen — static placeholder, "Impressum und Datenschutzerklärung folgen in Kürze"). Each screen re-guards the session client-side (redirect to /login if none) like ProfileScreen already did. profile.service.ts gained updateProfileName/updateProfileBirthday/updateProfileAvatar (plain `.update().eq('id', userId)`, protected by the existing "Users can update their own profile" RLS policy). BottomNav now also hides on /profile/[a-z]+ sub-pages, matching the /parties/[id] pattern. Note: features/settings/screens/ChangePasswordScreen.tsx is pre-existing dead code (unstyled, unused) — left untouched.
Featured EventCard's 3-stat row now hides the 👥 max. Gäste pill entirely when event.max_guests is null (no fallback to attendee-count-only display). That row is now a grid-cols-3 (not flex justify-between) with per-item justify-self-start/center/end, so the 📅 Datum pill stays pinned left (aligned with the title) and the ⏳ countdown pill stays dead-center regardless of whether the max. Gäste pill renders.
CreateEventScreen's 'Hintergrundbild' step (empty state, before a file is picked) now matches a dashed-border upload-box design: rounded dashed box (border-border-input) with a circular icon badge (bg-background-tertiary) containing a cloud-upload SVG, bold 'Datei auswählen oder hierher ziehen' headline, 'JPG, PNG bis 10 MB' subtext, and a pill-shaped 'Datei durchsuchen' button — all inside one clickable label wrapping the hidden file input. Once a file is picked it still shows the aspect-video image preview as before (unchanged); the caption text below the box was removed since the new box carries its own copy.
Create-party flow buttons are now consistent across steps: every white primary button says 'weiter' (the separate 'Überspringen →' link on the background step and the 'erstellen' label on the pools step are gone). The button is disabled only on required steps until valid (name, when, location — via canContinue); optional steps (description, guests, background, pools) leave it always enabled. The final 'done' screen keeps its own 'Fertig' label/action since it exits the flow rather than advancing to another question.
The event row is no longer created after the 'Max. Gäste' step — the whole create-party flow (name → when → location → description → guests → background → pools) is now collected purely in local state and nothing touches Supabase until the 'weiter' button on the last 'Umfragen' step is pressed. That single handleFinish() call inserts the event, then (if present) uploads the picked background file and attaches it, then inserts each locally-drafted pool + its options against the new event id, then reveals the 'done' screen with the invite link. Background picking (handlePickBg) is now purely local (preview only, no upload) and CreatePoolForm no longer talks to Supabase either — it just returns a local PoolDraft (id via crypto.randomUUID(), question, description, options) via onCreated; both are only persisted inside handleFinish. Side effect: since nothing is written until the final step, users can freely jump back through StepProgress dots and edit any earlier answer (including background/pools) right up until submission, and cancelling (✕) mid-flow no longer leaves an orphaned event row in the database.
DateTimePicker's time-slot list order is reversed (only the list order — the 15-min slot values themselves are unchanged): 00:00 stays pinned at the top, then it drops straight to 23:45 and counts down (23:30, 23:15, … 00:15) to the bottom.
--color-background-main (and the matching html background-color in globals.css) changed from #09090B to pure #000 — true black instead of near-black everywhere the token is used.
The decorative concentric-circles-in-the-corners + full-page `backdrop-blur-[80px]` overlay (the `CIRCLES` array pattern) is removed from every screen that had it: AuthScreen, app/(auth)/forgot-password, OnboardingScreen, PartiesScreen (was already commented out there, now fully deleted), ProfileScreen (dead const only), CreateEventScreen (dead const only), and the unused EventBackground component. Those screens now render on plain `bg-background-main` with no decorative background layer. The per-event blurred background image (EventDetailScreen/InviteScreen, driven by `event.background_url`) and the `backdrop-blur-xl` glass cards (EventInfoCard, back-button pill) are untouched — different feature, out of scope.
EventCard was rewritten from scratch to a much simpler design: no more RSVP badge, host avatar, countdown stat row, or overlapping attendee circles. It's now just an image card (event.background_url as a plain, undarkened object-cover img, or a flat bg-secondary grey box if there's none) with the title and (guest view only) "von {Host}" printed below the card as plain text — nothing is overlaid on the image anymore. The `featured` prop only controls aspect ratio now: featured (first upcoming event) is aspect-[2/1] full width; all other cards are aspect-square. PartiesScreen renders the first event in currentList as the lone featured card, then the rest in a 2-column grid (grid-cols-2 gap-3) — no more mapping every event through the same flex-col list with an index === 0 check.
globals.css's whole color/text-size token system was replaced with a Figma-derived scale (this superseded an earlier, larger palette that had `headline`/`subheadline`/`hint`/`placeholder`/`label`/`input`/`button`/`background-input`/`background-spacer`/`background-button`/`background-profilpicture`/`background-icon`/`glass`/`glass-strong`/`warning`/`success`/`maybe`/`border`/`border-input`/`border-button` — none of those exist anymore, so any leftover classNames using them are unstyled; `bg-background-main` in PartiesScreen.tsx is one such stale reference, left as-is since it wasn't part of the requested change). Current tokens: colors `--color-main/secondary/tertiary/quaternary` (base surfaces, secondary/tertiary are translucent rgba now, not solid), `--color-arrow` (used for the empty-state doodle arrow's stroke), `--color-heading/subheading/label-large/label-small/body` (text roles); sizes `--text-heading-1..4/subheading-1/label-1/label-2/body-1/button` (all under `--text-*`, distinct from the same-named `--color-*` roles to avoid Tailwind v4 silently dropping the font-size half when a `--color-foo` and `--text-foo` share a key — verified empirically via a throwaway Tailwind compile).
PartiesScreen's "Gastgeber" tab now shows a dedicated empty state when the host has zero events (the "Gast" tab keeps the old plain-text empty message): a two-box skeleton card mockup (bg-tertiary/bg-secondary translucent boxes + skeleton text bars) hinting at what an event card looks like, a headline "Starte jetzt mit "{profile.firstname}"" + subtext, and a hand-drawn SVG doodle arrow (open hook top-left, one smooth bulge, then a straight vertical run into the arrowhead so the curve never crosses the arrowhead strokes) whose tip sits exactly on the horizontal center of its 130px-wide box — pointing down at the (horizontally centered) "+" in the bottom nav. The outer PartiesScreen wrapper had `overflow-hidden` removed so the page can actually scroll if this empty state is taller than the viewport.
EventDetailScreen's back button is now a solid `bg-secondary` circle (h-11.25 w-11.25, matching the create-event "+" button style) instead of the old glass/blur pill; its icon is a bold chevron (`polyline points='9 6 15 12 9 18'`, strokeWidth 4, rotated 180° via `transform='rotate(180 12 12)'` so it points left/back). The same chevron un-rotated (`ChevronRightIcon`) is now used as a trailing affordance next to the "Location"/"Umfragen"/"Gäste" section headings. EventDetailScreen gained a horizontally scrollable stats row (`overflow-x-auto scrollbar-none`, iOS momentum scroll via `[-webkit-overflow-scrolling:touch]`) right under the title/description divider, showing Datum/Uhrzeit/Max. Gäste (hidden if null)/zugesagt/abgesagt/vielleicht as label+value pairs (`text-label-2 text-label-small` label, `text-label-1 font-semibold text-label-large` value); `EventDetail`/`getEventById` now also select `max_guests`. The Location block splits `event.location` (stored as `"<address>, <city>"`, see `CreateEventScreen.tsx` handleFinish) back into an address line and a "in {city}" line by cutting at the last comma. The "Umfragen" and "Gäste" sections are now conditionally rendered — EventDetailScreen fetches `getEventPools` itself (in addition to `PoolsSection` doing its own internal fetch) purely to know whether `pools.length > 0` before showing the Umfragen block at all; the Gäste block only renders when `attendees.length > 0`. `AttendeeList` was redesigned: plain rows separated by hairline dividers (no more per-row bordered cards), bigger (56px) avatar, bold name + "{age} Jahre alt", and a status pill (✅ zugesagt / 🤔 vielleicht / ❌ abgesagt) using three new semi-transparent globals.css tokens — `--color-success` (#2F9E44), `--color-maybe` (#A6901F), `--color-warning` (#8B2E2E) — added specifically for these pills since the old success/warning/maybe tokens were removed in the token-system rewrite.
Login/signup (AuthScreen + SignInForm/SignUpForm/VerifyOtpForm/change-password) and onboarding (OnboardingScreen + PersonalDataForm/BirthdateForm/ProfilePictureForm), plus the shared Selectbox dropdown, were functionally broken — every text/input/button class still referenced color tokens from the pre-rewrite design system (`text-headline`, `bg-background-input`, `text-input`, `bg-background-button`, `text-hint`, `text-label`, `bg-glass`, `text-placeholder`, `bg-background-tertiary`, `bg-background-main`) that no longer exist, so typed text and button labels rendered invisible (no color = black-on-black). Fixed by swapping every occurrence for its current equivalent (`text-heading`, `bg-secondary`, `bg-tertiary`, `text-label-small`, `text-subheading`, `bg-main`) — purely functional, no new visual design.
The same dead-token problem existed in the create-party flow — CreateEventScreen.tsx (incl. the ✕ cancel button, which used the also-dead `border-glass`/`bg-glass`/`backdrop-blur-xl` combo and is now a plain `bg-secondary` circle like the rest of the app's icon buttons), DateTimePicker.tsx (calendar/time-slot picker), and CreatePoolForm.tsx (the in-flow poll creator) — fixed the same way, same token mapping.
EventDetailScreen's hero (was a `bg-green-500` placeholder) now shows `event.background_url` as a full-bleed `object-cover` image (flat `bg-secondary` box fallback if none), with a `bg-gradient-to-t from-main to-transparent` overlay pinned to its bottom 128px so it blends seamlessly into the black content section below (no visible seam, since the gradient's end color matches the content div's `bg-main`); back/copy-link buttons sit in a `relative z-10` wrapper on top. Host-only copy-link button added top-right of that header (mirrors the back button's `bg-secondary` circle style), reusing the pre-existing `handleCopy`/`shareLink`/`copied` state — swaps to a ✓ for 2s after copying.
AttendeeList's row divider is now alignment-proof: instead of a hardcoded `pl-17` guess, it's an invisible `h-12.5 w-12.5` spacer (matching the real avatar's exact size/gap) followed by a `flex-1` line, so the divider always starts exactly under the name/age column and runs to the row's full right edge regardless of avatar size changes.
PoolCard was redesigned to match a Figma reference: no outer card border, bold question + conditional description, each option is now a full-width rounded pill (`bg-tertiary` selected / `bg-secondary` unselected) with a radio circle on the left (filled when voted) and an overlapping avatar stack of that option's voters on the right (photo or initials-on-avatar_color, capped at 3 + `+N` overflow) instead of the old percentage badge. Needed `avatar_url`/`avatar_color` on `PoolResponse` (events.types.ts) and on the `get_pool_responses_by_event` SECURITY DEFINER function (migration `20260801225328_add_avatar_to_pool_responses_function.sql`) — previously that RPC only exposed respondent names. PoolsSection's inter-poll spacing bumped (`gap-2` → `gap-4`) since cards no longer have borders to separate them.
Fixed a visual bug affecting every avatar circle that has BOTH a real photo and a random `avatar_color`: the `style={{ backgroundColor: avatar_color }}` was applied unconditionally, so on any circle where the `<img>` doesn't pixel-perfectly cover the rounded div (object-cover + rounded-full clipping isn't exact), a thin ring of that random color leaks through around the photo's edge. `ProfileScreen.tsx`/`EditPictureScreen.tsx` already guarded against this (`avatar_url ? 'transparent' : avatar_color`); applied the same guard to the three spots that didn't — `PoolCard.tsx` (voter avatar stack), `AttendeeList.tsx`, and `HostRow.tsx`.
EventDetailScreen's Location/Umfragen/Gäste sections are now collapsible: `openSections` state (`{ location, polls, guests }`, all `true` by default) toggled via `toggleSection(key)`; each headline row is now a full-width `<button>`, and `ChevronRightIcon` is wrapped in a `<span>` that gets `rotate-90` (+ `transition-transform duration-200`) when its section is open — pointing down when expanded, right when collapsed — with the section content conditionally rendered on that same state.
Guests (never hosts) now see a "•••" button (`MoreIcon`, same `bg-secondary` circle as the back/copy buttons) in the header's top-right, in the spot the host's copy-link button occupies for hosts. Clicking it toggles a `menuOpen` dropdown — a `w-56.25 rounded-3xl bg-quaternary/50 backdrop-blur-xl` panel (translucent + blurred on purpose, over the hero image) closed by a `fixed inset-0` invisible backdrop — listing zugesagt/vielleicht/abgesagt (`RSVP_MENU`, reuses the existing `handleRsvp`, current status highlighted with a `bg-tertiary` pill) then, after a divider, a red "🗑️ Löschen" row (`text-warning`) that calls the new `handleLeaveEvent` — deletes only that guest's own `rsvps` row (new `deleteRsvp(eventId, userId)` in events.service.ts, backed by the pre-existing `rsvps_delete_own` RLS policy) and redirects to `/parties`, never the event itself.
Dead-code cleanup pass (baseline before: `tsc` clean, `eslint` 77 errors / 36 warnings; after: `tsc` clean, 0 errors / 14 warnings). Deleted 5 unreferenced files: `features/events/EventDetailScreen 2.tsx` (untracked editor duplicate), `features/events/components/EventBackground.tsx` and `EventInfoCard.tsx` (both zero importers and both still written against the pre-rewrite token system), `features/settings/screens/ChangePasswordScreen.tsx` (the unstyled dead twin previously noted here), and `components/shared/Combobox.tsx` (zero importers — `Selectbox` is the one actually used by BirthdateForm/EditAgeScreen). Deleted unused code inside surviving files: `EventDetailScreen.tsx` lost the `HostRow`/`RsvpButtons` imports, the `deleting` and `descExpanded` state, the local `getCountdown()` + its `value`/`unit`/`formattedDate` results, and `handleDelete`; `ProfileScreen.tsx` lost `handleSignOut`; `Selectbox.tsx` lost the computed-but-unused `isHighlighted`; `pools.service.ts` lost `deletePool`/`deletePoolResponse`; `auth.types.ts` lost `AuthStep`.
TWO FEATURE GAPS this cleanup made explicit — the code was there but wired to nothing, and is now gone: (1) **hosts cannot delete an event.** `deleteEvent(eventId)` is deliberately KEPT in events.service.ts as the rebuild hook; the UI needs a host version of the ••• dropdown carrying a Löschen row (mirror `handleLeaveEvent`, but call `deleteEvent`). (2) **there is no sign-out on the profile page.** The only reachable logout is the `/home` placeholder page (`app/(dashboard)/home/page.tsx`, which also holds the only 'Account löschen' → `delete_self` RPC call, and which `app/page.tsx` and the auth callback route both still redirect to). A 6th ProfileScreen row would fix it.
Structural tidy-up in the same pass: `features/settings/change-password.tsx` (default export was confusingly named `ChangePasswordPage` for what is a form) moved to `features/settings/components/ChangePasswordForm.tsx` and renamed to `ChangePasswordForm`; its 3 importers (AuthScreen, app/(auth)/forgot-password/page.tsx, EditPasswordScreen) were updated, and the now-empty `features/settings/screens/` directory is gone. `PartiesScreen.tsx` no longer declares its own local `Profile` type and no longer queries `profiles` inline — it imports `getMyProfile`/`Profile` from `features/profile/services/profile.service`, so profile reads go through the service layer everywhere. A shared `getOrigin()` (SSR-safe, returns '' on the server) now lives in `lib/utils.ts`; it replaced the private copy in `auth.service.ts` and, more importantly, replaced the `origin` state + `useEffect(() => setOrigin(window.location.origin))` pattern in both `CreateEventScreen.tsx` and `EventDetailScreen.tsx` — that pattern was React 19's only two remaining `react-hooks/set-state-in-effect` lint ERRORS, and both are now gone. `types/database.types.ts` is generated by `supabase gen types typescript`, so it was added to eslint's `globalIgnores` instead of being hand-fixed (it alone accounted for 73 of the 77 quote errors, which would have come straight back on the next regeneration).
EventDetailScreen pass 2 — host dropdown, skeletons, browser-native errors, animations (all four verified: `tsc` clean, eslint 0 errors, route returns 200, SSR HTML contains 34 skeleton nodes, and the emitted CSS was inspected to confirm `.skeleton`, `@keyframes skeleton-shimmer`, `.grid-rows-[0fr]/[1fr]`, `.transition-[grid-template-rows]` and `.right-13.75` all compile).
(a) HOST DROPDOWN: the ••• button (`MoreIcon`) is now rendered for BOTH roles at `absolute right-0`, so the menu anchor is identical for host and guest; the host's copy-link button moved from `right-0` to `right-13.75` (45px button + 10px gap) and now sits to the LEFT of the •••. One `menuPanelClass` panel serves both roles: guests get the 3 `RSVP_MENU` rows + divider + a "Löschen" row wired to `handleLeaveEvent` (deletes only their own rsvp row); hosts get ONLY the "Löschen" row, wired to the new `handleDeleteEvent` → `confirm('Event wirklich löschen? …')` → `deleteEvent(event.id)` → `/parties`. This re-fills the host-delete gap the previous cleanup pass documented, so `deleteEvent()` in events.service.ts is live again.
(b) RSVP CHECKMARK: a lucide `Check` icon (`CheckIcon`, `ml-auto`) sits permanently on whichever RSVP row matches the current `rsvpStatus`, on the RIGHT of the row — the `bg-tertiary` pill highlight stays too. The apple emojis (✅🤔❌) remain the left column and are deliberately NOT lucide icons; lucide is used for every non-RSVP icon. Tapping a row no longer closes the menu instantly: `handleRsvp` awaits the write, moves the ✓, then `setTimeout(() => setMenuOpen(false), 600)` so the confirmation is visible. `handleRsvp` also stopped re-fetching the session (it uses the already-loaded `userId`), removing one round-trip per vote.
(c) SKELETONS: the single all-or-nothing `Promise.all` + `loading` flag (which rendered `null` for the whole page) was split into FOUR independent flags — `eventLoading` (event+host+rsvp status), `countsLoading`, `poolsLoading`, `attendeesLoading` — each clearing its own block's shimmer as its query lands, so the title appears while the map/polls/guests are still loading. The effect now has a `cancelled` cleanup flag. Skeleton style is a gradient sweep, NOT an opacity pulse: new globals.css tokens `--color-skeleton` (rgba(118,118,128,0.25), same value as `--color-secondary`) and `--color-skeleton-sheen` (rgba(255,255,255,0.08)), a top-level `@keyframes skeleton-shimmer` (translateX -100%→100%), and a `.skeleton` utility using a `::after` overlay with a `linear-gradient(90deg, transparent, sheen, transparent)` on a 1.5s infinite loop, plus a `prefers-reduced-motion` guard that kills the animation. Usage is class-based (`className='… skeleton'`) — there is deliberately NO Skeleton component wrapper. The hero image gets its own `heroLoaded` state: shimmer until the `<img onLoad>` fires, then the image cross-fades in over 500ms. The ••• spot holds a skeleton circle while `eventLoading`, because the host/guest role isn't known yet. Umfragen and Gäste DO show skeletons before their data lands and disappear entirely if they turn out empty (accepted layout shift). The shimmer is hand-rolled CSS on purpose — `tw-animate-css` was evaluated for this and could not do a gradient sweep, so it was uninstalled (`npm uninstall tw-animate-css`) rather than left as a dead dependency; do not re-add it. EventMap owns its own skeleton too — see the EventMap rewrite note below for how it ended up. InviteScreen shares EventMap, so it gets the same map skeleton.
(d) ERRORS: new module-level `alertError(message, detail?)` helper builds `alert('German sentence\n\nraw supabase detail')` — browser-native dialogs only, no custom UI, per explicit instruction. Wired into event-load failure, RSVP save, guest leave and host delete.
(e) COLLAPSE ANIMATION: the three Location/Umfragen/Gäste blocks now render through one local `Section({ title, open, onToggle, children })` component defined in EventDetailScreen.tsx (used 6x — 3 real + 3 skeleton variants — so it is not a single-use abstraction). Content animates height via the `grid-rows-[0fr]` → `grid-rows-[1fr]` trick with `transition-[grid-template-rows] duration-200` and an `overflow-hidden` inner div, which reaches the content's natural height without measuring it; the chevron keeps its existing `rotate-90 duration-200`. The section container lost its `gap-4` (a gap would still render when collapsed) — the inner wrapper carries `pt-4` instead, and the original per-section bottom spacing is preserved exactly (Location and Umfragen children carry `pb-7.5`, Gäste carries none, matching the old `mb-7.5` placement).
(f) DROPDOWN ANIMATION: the menu panel is now always mounted (so it animates on close too, not just open) and toggles `opacity-100 scale-100` ↔ `pointer-events-none opacity-0 scale-95` with `origin-top-right transition-all duration-150 ease-out`, so it grows out of the ••• button. `aria-hidden={!menuOpen}` and `aria-expanded` on the trigger; the click-away backdrop still only mounts while open.
(g) POOLSSECTION is now purely presentational — props are `{ pools, userId, onRefresh }`. It no longer fetches, which kills a real double-fetch (EventDetailScreen called `getEventPools` for its length check AND PoolsSection fetched the same rows again). Its `isHost` prop and its empty-state box are gone; that box was already invisible since it used the deleted `border-border`/`bg-background-secondary`/`text-hint` tokens. InviteScreen was updated to match: it now fetches pools in its own `Promise.all` and renders `<PoolsSection>` only when `pools.length > 0`.
Poll voting is now OPTIMISTIC. The old PoolCard drove the radio circle from local `selectedOptionId` state but drew the voter avatar stack from `pool.responses` (server data), so tapping an option moved the radio instantly while your own profile picture only jumped to the new option after the write + `onRefresh()` refetch had round-tripped — a visible multi-second lag. PoolCard now reconstructs its own row locally: `pendingOptionId` state holds the tapped option, `selectedOptionId = pendingOptionId ?? serverResponse?.option_id ?? null`, and a synthetic `myRow: PoolResponse` is merged into the response list — replaced IN PLACE via `.map()` when a server row already exists (so changing your vote never reorders the other voters) or appended when it's your first vote. Avatar fields prefer `myProfile` and fall back to `serverResponse`, so nothing regresses to '?' initials during the window before the profile fetch resolves. `onRefresh()` still runs after a successful write to reconcile with the server, but it is now invisible — the merged output is identical, so there is no flicker. On failure `pendingOptionId` rolls back to its previous value and `alertError` fires; previously `upsertPoolResponse` errors were swallowed entirely with no rollback and no message. This required threading a `myProfile: Profile | null` prop down EventDetailScreen → PoolsSection → PoolCard (EventDetailScreen and InviteScreen both now call `getMyProfile`; EventDetailScreen does it in its parallel load block). `alertError` moved from a module-level function inside EventDetailScreen.tsx to `lib/utils.ts` so PoolCard could share it. Merge logic was verified against 6 scenarios (first vote, post-refetch idempotence, switching options, error rollback, never-voted, unique React keys) — all pass.
EventMap was rewritten from a Google Maps EMBED IFRAME to a Google Maps STATIC IMAGE, because the iframe made a correct skeleton impossible. Measured directly: the embed URL returns only 2170 bytes in ~0.37s — a JS bootstrap with 6 script tags, not the map — so the iframe's `onLoad` fired almost immediately, the skeleton cleared, and the user then stared at a blank box for several seconds while Google's JS fetched and painted tiles. A cross-origin iframe gives no signal for "tiles painted", so the fix was to stop using one. The component now renders an `<img>` pointing at `maps.googleapis.com/maps/api/staticmap` (`zoom=15`, `size=640x246&scale=2` — 2.6:1, matching the `h-33` container's aspect on a 375px phone so `object-cover` barely crops; marker in brand pink `color:0xFF0090`), whose `onLoad` only fires once the PNG is decoded, so the skeleton now ends exactly when the map becomes visible. The whole block is wrapped in an `<a target='_blank' rel='noopener noreferrer'>` to `https://www.google.com/maps/search/?api=1&query=<location>` (the official Google Maps URLs API, which deep-links into the native app on mobile), so tapping the map opens it in Google Maps — this replaces the pan/zoom that was lost with the iframe. There is an `onError` → `failed` state that swaps in a tappable `bg-secondary` box reading "In Google Maps öffnen", so a missing key or a disabled API can never leave a skeleton shimmering forever.
Google Cloud setup for this (done, but note it if the key is ever rotated or replaced): the Maps Static API and the Maps Embed API are separate products, so BOTH steps were needed — (1) enabling "Maps Static API" on the project via the API library, and (2) adding Maps Static API to the `Maps-API-key` credential's API restrictions, which had been locked to Maps Embed API only. The two failures give different 403 texts and are easy to confuse: "This API is not activated on your API project" = step 1 missing, "This API key is not authorized to use this service or API" = step 2 missing. Verified working: the production URL returns HTTP 200, `image/png`, 1280x492, ~119KB in 0.6s, with the brand-pink marker rendering correctly. That key's Application restrictions are still "None" — worth tightening to Websites later, but it was left alone here to avoid breaking local dev.
EventDetailScreen's root div was `bg-white` (a leftover that could flash white below the content on a short event, in an otherwise all-black app) and is now `bg-main`, matching the content section it wraps.
Remaining 14 eslint warnings are all intentional and were left alone: 12x `@next/next/no-img-element` (real `<img>` tags for Supabase-storage avatars/backgrounds — switching to `next/image` needs `remotePatterns` configured in next.config.ts first) and 1x `react-hooks/exhaustive-deps` in DateTimePicker.tsx. Also confirmed pre-existing and NOT caused by the cleanup: `npx next build` fails while prerendering Next's internal `/_global-error` page with `TypeError: Cannot read properties of null (reading 'useContext')` — verified identical on a clean HEAD checkout. Also noted, not acted on: CLAUDE.md claims `middleware.ts` is in place, but no `middleware.ts` and no `lib/supabase/server.ts` exist in the repo — every screen guards its own session client-side via `supabase.auth.getSession()` instead.
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