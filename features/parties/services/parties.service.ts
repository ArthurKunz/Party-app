import { supabase } from '@/lib/supabase/client'
import { isPartyOver } from '@/lib/utils'
import { removeStorageFolder } from '@/lib/storage'
import type { CreatePartyPayload, PartyWithCount, PartyDetail, Attendee, PartyHost, RsvpStatus } from '../types/parties.types'

export async function createParty(payload: CreatePartyPayload) {
  return supabase.from('events').insert(payload).select('id, invite_code').single()
}

async function attachCountAndAttendees(party: Omit<PartyWithCount, 'attendee_count' | 'attendees'>): Promise<PartyWithCount> {
  const [countResult, attendeesResult] = await Promise.all([
    supabase.rpc('get_rsvp_count', { p_event_id: party.id }),
    supabase.rpc('get_event_attendees', { p_event_id: party.id }),
  ])
  return {
    ...party,
    attendee_count: countResult.data ?? 0,
    attendees: ((attendeesResult.data as Attendee[] | null) ?? []).slice(0, 10),
  }
}

const AVATAR_COLORS = ['#FF0090', '#A336FF', '#161BFA', '#5684FF', '#AE4FFF', '#D47AFF', '#E224A1']

function hostColor(hostId: string): string {
  const sum = hostId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

interface HostedRow {
  id: string
  title: string
  event_date: string
  ends_at: string | null
  location: string
  invite_code: string
  background_url: string | null
  max_guests: number | null
}

interface AttendedRsvpRow {
  status: string
  parties: {
    id: string
    title: string
    event_date: string
    ends_at: string | null
    location: string
    invite_code: string
    background_url: string | null
    host_id: string
    max_guests: number | null
  } | null
}

export async function getHostedParties(userId: string): Promise<PartyWithCount[]> {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, event_date, ends_at, location, invite_code, background_url, max_guests')
    .eq('host_id', userId)
    .order('event_date', { ascending: true })
  if (error || !data) return []

  // A finished party drops out HERE rather than in the screen, so the two RPCs below
  // never fire for a party nobody is going to see. The row itself stays in the
  // database: the invite link keeps working and the host keeps their guest list.
  const upcoming = (data as unknown as HostedRow[]).filter((e) => !isPartyOver(e.event_date, e.ends_at))

  // get_event_attendees / get_rsvp_count already include the host themselves.
  return Promise.all(
    upcoming.map((e) =>
      attachCountAndAttendees({
        id: e.id,
        title: e.title,
        event_date: e.event_date,
        location: e.location,
        invite_code: e.invite_code,
        background_url: e.background_url,
        max_guests: e.max_guests,
      })
    )
  )
}

export async function getAttendedParties(userId: string): Promise<PartyWithCount[]> {
  // 'going', 'not_going' and 'maybe' RSVPs all appear under "Ich bin Gast"
  const { data, error } = await supabase
    .from('rsvps')
    .select('status, parties(id, title, event_date, ends_at, location, invite_code, background_url, host_id, max_guests)')
    .eq('user_id', userId)
  if (error || !data) return []

  const rows = (data as unknown as AttendedRsvpRow[])
    // You are never a guest at your own party — it belongs on the 'Gastgeber' tab only,
    // and a party that is over belongs on neither.
    .filter(
      (r) =>
        r.parties !== null &&
        r.parties.host_id !== userId &&
        !isPartyOver(r.parties.event_date, r.parties.ends_at)
    )
    .map((r) => ({ status: r.status as RsvpStatus, party: r.parties! }))
    .sort((a, b) => new Date(a.party.event_date).getTime() - new Date(b.party.event_date).getTime())

  if (rows.length === 0) return []

  return Promise.all(
    rows.map(async ({ status, party }) => {
      // get_event_host is SECURITY DEFINER so it bypasses profiles RLS
      const [hostResult, countResult, attendeesResult] = await Promise.all([
        supabase.rpc('get_event_host', { p_event_id: party.id }),
        supabase.rpc('get_rsvp_count', { p_event_id: party.id }),
        supabase.rpc('get_event_attendees', { p_event_id: party.id }),
      ])
      const host = (hostResult.data as PartyHost[] | null)?.[0] ?? null
      // get_event_attendees / get_rsvp_count already include the host themselves.
      const attendees = (attendeesResult.data as Attendee[] | null) ?? []
      return {
        id: party.id,
        title: party.title,
        event_date: party.event_date,
        location: party.location,
        invite_code: party.invite_code,
        background_url: party.background_url,
        max_guests: party.max_guests,
        attendee_count: countResult.data ?? 0,
        attendees: attendees.slice(0, 10),
        rsvp_status: status,
        host_firstname: host?.firstname ?? null,
        host_lastname: host?.lastname ?? null,
        host_avatar_color: host?.avatar_color ?? hostColor(party.host_id),
        host_avatar_url: host?.avatar_url ?? null,
      }
    })
  )
}

const PARTY_DETAIL_COLUMNS = 'id, host_id, title, description, event_date, ends_at, location, invite_code, background_url, max_guests'

export async function getPartyById(partyId: string): Promise<PartyDetail | null> {
  const { data, error } = await supabase
    .from('events')
    .select(PARTY_DETAIL_COLUMNS)
    .eq('id', partyId)
    .maybeSingle()
  if (error || !data) return null
  return data
}

// Through an RPC rather than the table, because this is the one read that has to
// work WITHOUT an account. Leaving `events` world-readable for its sake handed every
// party — and every invite code — to anyone who asked. The function is keyed on the
// code, which is the secret the link already rests on, so there is nothing to walk.
export async function getPartyByInviteCode(inviteCode: string): Promise<PartyDetail | null> {
  const { data, error } = await supabase.rpc('get_party_by_invite_code', { p_invite_code: inviteCode })
  if (error || !data) return null
  return (data as unknown as PartyDetail[])[0] ?? null
}

export async function getPartyHost(partyId: string): Promise<PartyHost | null> {
  const { data, error } = await supabase.rpc('get_event_host', { p_event_id: partyId })
  if (error || !data || data.length === 0) return null
  return data[0] as unknown as PartyHost
}

export async function getPartyAttendees(partyId: string): Promise<Attendee[]> {
  const { data, error } = await supabase.rpc('get_event_attendees', { p_event_id: partyId })
  if (error || !data) return []
  return data as unknown as Attendee[]
}

interface RsvpCountRow { going_count: number; maybe_count: number; not_going_count: number }

export async function getRsvpCountsByStatus(partyId: string): Promise<{ going: number; maybe: number; not_going: number }> {
  const { data } = await (supabase.rpc as unknown as (fn: string, args: Record<string, string>) => Promise<{ data: unknown }>)('get_rsvp_counts_by_status', { p_event_id: partyId })
  const row = (data as RsvpCountRow[] | null)?.[0]
  return { going: row?.going_count ?? 0, maybe: row?.maybe_count ?? 0, not_going: row?.not_going_count ?? 0 }
}

export async function getMyRsvpStatus(partyId: string, userId: string): Promise<RsvpStatus | null> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('status')
    .eq('event_id', partyId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data.status as RsvpStatus
}

export async function setRsvp(partyId: string, userId: string, status: RsvpStatus) {
  return supabase
    .from('rsvps')
    .upsert({ event_id: partyId, user_id: userId, status }, { onConflict: 'event_id,user_id' })
}

// The host's edit screen writes the whole form at once; RLS restricts it to their
// own party, so no host_id check is needed here.
export async function updateParty(partyId: string, patch: Partial<CreatePartyPayload>) {
  return supabase.from('events').update(patch).eq('id', partyId)
}

// Options and responses go with it by cascade.
export async function deletePool(poolId: string) {
  return supabase.from('pools').delete().eq('id', poolId)
}

// The background lives at {host_id}/{party_id}/background.ext and is NOT removed by
// deleting the row — 41 files from deleted parties had piled up that way. The row goes
// first because that is what the host asked for; a failed cleanup afterwards only
// leaves the orphan we used to leave every time anyway.
export async function deleteParty(partyId: string, hostId: string) {
  const result = await supabase.from('events').delete().eq('id', partyId)
  if (!result.error) await removeStorageFolder('event-backgrounds', `${hostId}/${partyId}`)
  return result
}

export async function deleteRsvp(partyId: string, userId: string) {
  return supabase.from('rsvps').delete().eq('event_id', partyId).eq('user_id', userId)
}
