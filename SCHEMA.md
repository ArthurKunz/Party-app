# Schema

## profiles
| column        | type      | notes                                    |
|---------------|-----------|------------------------------------------|
| id            | uuid PK   |                                          |
| auth_user_id  | uuid FK   | references auth.users (Supabase Auth)    |
| display_name  | text      |                                          |
| age           | int       |                                          |
| party_score   | int       | default 0 — used in V2                   |
| created_at    | timestamp | default now()                            |

## events
| column        | type      | notes                                    |
|---------------|-----------|------------------------------------------|
| id            | uuid PK   |                                          |
| host_id       | uuid FK   | references profiles.id                   |
| title         | text      |                                          |
| description   | text      |                                          |
| event_type    | text      | e.g. chill, rave, dinner — stubbed V1    |
| invite_code   | text      | unique short nanoid — used for link      |
| event_date    | timestamp |                                          |
| location      | text      |                                          |
| max_guests    | int       | optional                                 |
| created_at    | timestamp | default now()                            |

## rsvps
| column        | type      | notes                                    |
|---------------|-----------|------------------------------------------|
| id            | uuid PK   |                                          |
| event_id      | uuid FK   | references events.id                     |
| user_id       | uuid FK   | references profiles.id                   |
| status        | text      | 'going' or 'not_going'                   |
| responded_at  | timestamp |                                          |

## tasks (stubbed for V2 — create table now, build feature later)
| column        | type      | notes                                    |
|---------------|-----------|------------------------------------------|
| id            | uuid PK   |                                          |
| event_id      | uuid FK   | references events.id                     |
| assigned_to   | uuid FK   | references profiles.id                   |
| title         | text      |                                          |
| is_done       | boolean   | default false                            |
| created_at    | timestamp |                                          |

## votes (stubbed for V2 — create table now, build feature later)
| column        | type      | notes                                    |
|---------------|-----------|------------------------------------------|
| id            | uuid PK   |                                          |
| event_id      | uuid FK   | references events.id                     |
| user_id       | uuid FK   | references profiles.id                   |
| field         | text      | e.g. 'date', 'location', 'type'          |
| value         | text      | the option the user voted for            |
| created_at    | timestamp |                                          |

## RLS policies (write in Supabase before any API calls)
- Only the host can update or delete their own event
- Only authenticated users can create an RSVP
- Users can only read their own RSVPs
- Host can read all RSVPs for their own events
- Profiles are readable by authenticated users only
- Users can only update their own profile
