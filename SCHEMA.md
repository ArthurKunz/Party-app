# Schema

The table is `events`. The app calls it a party everywhere else, so PostgREST embeds
have to be aliased: `parties:events(...)`, never `parties(...)`.

## profiles
| column        | type        | notes                                                |
|---------------|-------------|------------------------------------------------------|
| id            | uuid PK     | IS `auth.users.id` — no separate auth_user_id column  |
| firstname     | text        | nullable until onboarding fills it                    |
| lastname      | text        | nullable until onboarding fills it                    |
| birthday      | date        | nullable — never leaves the row, see below            |
| avatar_url    | text        | nullable — initials avatar when empty                 |
| avatar_color  | text        | not null, default `#A336FF`                           |
| created_at    | timestamptz | default now()                                         |

`profiles.id → auth.users(id) ON DELETE CASCADE`. Deleting the auth user takes the
profile, and every FK below cascades from there, which is what makes `delete_self()`
a complete erasure.

**birthday never leaves the row.** A profile reads its own date to render the age on
the profile screen and to prefill the birthday wheel. Every path that shows *someone
else's* age goes through an RPC that returns `age int`, computed in the database.

## events
| column         | type        | notes                                    |
|----------------|-------------|------------------------------------------|
| id             | uuid PK     | default gen_random_uuid()                 |
| host_id        | uuid FK     | → profiles.id ON DELETE CASCADE           |
| title          | text        | not null                                  |
| description    | text        | nullable                                  |
| event_type     | text        | nullable — stubbed, no UI                 |
| invite_code    | text        | not null, UNIQUE — 10 hex chars           |
| event_date     | timestamptz | not null                                  |
| ends_at        | timestamptz | nullable — optional end time              |
| location       | text        | not null                                  |
| max_guests     | int         | nullable — null means no cap              |
| background_url | text        | nullable                                  |
| created_at     | timestamptz | default now()                             |

## rsvps
| column       | type        | notes                                          |
|--------------|-------------|------------------------------------------------|
| id           | uuid PK     | default gen_random_uuid()                       |
| event_id     | uuid FK     | → events.id ON DELETE CASCADE                   |
| user_id      | uuid FK     | → profiles.id ON DELETE CASCADE                 |
| status       | text        | CHECK in `going` / `maybe` / `not_going`        |
| responded_at | timestamptz | default now()                                   |

UNIQUE (event_id, user_id) — one answer per person per party.

Three answers, not two. `host` is a fourth word the attendee RPCs invent to mark the
host in a guest list; it is never stored, because the insert policy forbids the host
from RSVPing to their own party.

## pools / pool_options / pool_responses
The voting feature. There is no `votes` table — this replaced it.

**pools**
| column              | type        | notes                                 |
|---------------------|-------------|---------------------------------------|
| id                  | uuid PK     | default gen_random_uuid()              |
| event_id            | uuid FK     | → events.id ON DELETE CASCADE          |
| question            | text        | not null                               |
| description         | text        | nullable                               |
| type                | text        | CHECK in `options` / `text_only`       |
| allow_text_response | boolean     | default false                          |
| allow_multiple      | boolean     | default false                          |
| created_at          | timestamptz | default now()                          |

**pool_options**
| column     | type        | notes                                  |
|------------|-------------|----------------------------------------|
| id         | uuid PK     | default gen_random_uuid()               |
| pool_id    | uuid FK     | → pools.id ON DELETE CASCADE            |
| label      | text        | not null                                |
| position   | int         | default 0                               |
| created_at | timestamptz | default now()                           |

UNIQUE (id, pool_id) — exists only so pool_responses can point at the pair.

**pool_responses**
| column        | type        | notes                                              |
|---------------|-------------|-----------------------------------------------------|
| id            | uuid PK     | default gen_random_uuid()                            |
| pool_id       | uuid FK     | → pools.id ON DELETE CASCADE                         |
| user_id       | uuid FK     | → profiles.id ON DELETE CASCADE                      |
| option_id     | uuid FK     | → pool_options(pool_id, id), ON DELETE SET NULL      |
| text_response | text        | nullable                                             |
| created_at    | timestamptz | default now()                                        |

Three things hold a row honest, because RLS cannot:
- The FK is **composite** — `(pool_id, option_id)` — so an option always belongs to
  the poll it was answered in. Null option_id still passes (MATCH SIMPLE), which is
  what lets a text-only answer write.
- UNIQUE (pool_id, user_id, option_id) — no voting for the same option twice.
- Trigger `pool_responses_single_answer` — when `allow_multiple = false`, one row per
  person per poll. `upsertPoolResponse` deletes before it inserts, so changing your
  mind still works.

## Not built yet
- **tasks** (checklist / who brings what) — V1 scope, no table.
- **Coming late + expected arrival time** — V1 scope, no column on rsvps.
- **party_score** — V2, no column. Do not assume it exists.

---

## RLS

Enabled on all six tables. Every policy is scoped to `authenticated`; `anon` holds no
table grant anywhere and reaches the database only through the three invite-code RPCs.

**profiles** — SELECT / INSERT / UPDATE, all `auth.uid() = id`. Only your own row.
Another person's name or age is never read from this table, only from an RPC.

**events**
- SELECT: `host_id = auth.uid() OR is_party_member(id)`
- INSERT: WITH CHECK `host_id = auth.uid()`
- UPDATE / DELETE: `host_id = auth.uid()`

**rsvps**
- SELECT: own row, or any row on a party you host
- INSERT / UPDATE: own row, **not** on your own party, and `party_has_room(...)` —
  max_guests is enforced here, not in the UI
- DELETE: own row, or the host removing a guest

**pools / pool_options** — members read, host writes.

**pool_responses** — members of the party read all answers and write their own.

### Two rules worth restating
- An RLS SELECT policy has to be satisfiable from the row's own columns.
  `.insert(...).select(...)` becomes `INSERT ... RETURNING`, which Postgres checks
  against the SELECT policy while the new row is still invisible to any function that
  looks it up again.
- RLS decides WHO writes a row, never WHAT is in it. The anon key ships in the browser
  bundle, so anything the UI merely declines to offer needs a CHECK, a UNIQUE, an FK
  or a trigger.

---

## Functions

All `SECURITY DEFINER` with `search_path` pinned. `SECURITY DEFINER` bypasses RLS, so
each one carries its own check — usually `is_party_member()`.

`is_party_member(event_id)` is what keeps the events ↔ rsvps policies from recursing:
the policy on `events` needs to read `rsvps`, whose policy needs to read `events`.

| function | check | reachable by |
|---|---|---|
| `is_party_member(uuid)` | — | authenticated |
| `party_has_room(uuid, uuid)` | — | authenticated |
| `get_event_attendees(uuid)` | is_party_member | authenticated |
| `get_event_attendees_by_invite_code(text)` | **none — the link is the claim** | authenticated |
| `get_attendee_avatars_for_events(uuid[])` | is_party_member | authenticated |
| `get_host_info_for_events(uuid[])` | is_party_member | authenticated |
| `get_pool_responses_by_event(uuid)` | inline membership | authenticated |
| `get_party_by_invite_code(text)` | none — public invite page | **anon** |
| `get_party_pools_by_invite_code(text)` | none — public invite page | **anon** |
| `get_event_host(uuid)` | none | **anon** |
| `get_rsvp_count(uuid)` | none | **anon** |
| `get_rsvp_counts_by_status(uuid)` | none | **anon** |
| `delete_self()` | auth.uid() | authenticated |

The three anon-reachable lookups are what make `/e/[invite_code]` work without an
account. `get_event_host` and the two counters take a raw event id rather than the
code, so an id alone is enough for a host's name and a headcount. Event ids are not
published anywhere, so this is small — but keying them on the invite code too would
leave exactly one public entry point.

Both attendee RPCs return `age int`. They used to return `birthday` — the full date —
to every invited browser, where it was passed straight to `calculateAge` and the rest
thrown away. Guest lists are full of minors; the purpose is answered by an integer.
