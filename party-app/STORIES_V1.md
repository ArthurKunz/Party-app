# User Stories

## V1 — MVP (Weeks 1–6, launch by ~July 2026)
Goal: shippable product real people can use

### User types
- Non-user: no account, can only view basic event info via shareable link
- User: signed-up, has a profile, can create events and RSVP
- Guest: a user who RSVPd to a specific event (derived from rsvps table)
- Host: a user who created a specific event (derived from events.host_id)
No role column exists on profiles — roles are always derived from relationships.

### In scope

As a non-user, I can open an event link, see basic info, and get prompted to sign up
As a user, I can sign up and log in with email
As a user, I have a profile with my name and age
As a user, I can RSVP to a public event
As a user, I can open a private event via link and RSVP
As a host, I can create an event with a name, description, type, date, time, and location
As a host, I can see who is coming with their name, age, and headcount
As a host, I can copy a shareable link for my event to send to anyone

### Not in V1 — explicitly cut

- No explore page — cut to avoid cold start, revisit at V2
- No collaborative event type — voting on date/time/location is V2
- No party score or reputation system — nothing to score yet in V1
- No discovery feed with filters — no point without enough users
- No external sharing buttons (WhatsApp, Instagram) — the link is enough
- No checklist / who brings what — V2 feature
- No arrival time estimates or live tracking — V3
- No host dashboard demographics — V3
- No age filters or age limits on events — moderation complexity, skip
- No party type tags (chill, rave, dinner etc.) — useless without a feed
- No push notifications — V3
- No native mobile app — web only in V1
- No AI features — V3
- No profile photo upload — using initials avatar instead
- No gender field on profiles — legal complexity for under-18 users
- No public profile pages — nothing meaningful without Party Score
- No PWA — adds deployment complexity, not needed to prove the concept
- No join request approval flow — private events use link-only access
- No payments or monetization — V3
