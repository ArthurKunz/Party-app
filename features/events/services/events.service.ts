import { supabase } from '@/lib/supabase/client'
import type { CreateEventPayload, EventWithCount, EventDetail, Attendee, EventHost, RsvpStatus } from '../types/events.types'

export async function createEvent(payload: CreateEventPayload) {
  return supabase.from('events').insert(payload).select('id, invite_code').single()
}

async function attachCountAndAttendees(event: Omit<EventWithCount, 'attendee_count' | 'attendees'>): Promise<EventWithCount> {
  const [countResult, attendeesResult] = await Promise.all([
    supabase.rpc('get_rsvp_count', { p_event_id: event.id }),
    supabase.rpc('get_event_attendees', { p_event_id: event.id }),
  ])
  return {
    ...event,
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
  location: string
  invite_code: string
  background_url: string | null
}

interface AttendedRsvpRow {
  status: string
  events: {
    id: string
    title: string
    event_date: string
    location: string
    invite_code: string
    background_url: string | null
    host_id: string
  } | null
}

export async function getHostedEvents(userId: string): Promise<EventWithCount[]> {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, event_date, location, invite_code, background_url')
    .eq('host_id', userId)
    .order('event_date', { ascending: true })
  if (error || !data) return []
  return Promise.all(
    (data as unknown as HostedRow[]).map((e) =>
      attachCountAndAttendees({
        id: e.id,
        title: e.title,
        event_date: e.event_date,
        location: e.location,
        invite_code: e.invite_code,
        background_url: e.background_url,
      })
    )
  )
}

export async function getAttendedEvents(userId: string): Promise<EventWithCount[]> {
  // Both 'going' and 'not_going' RSVPs appear under "Ich bin Gast"
  const { data, error } = await supabase
    .from('rsvps')
    .select('status, events(id, title, event_date, location, invite_code, background_url, host_id)')
    .eq('user_id', userId)
  if (error || !data) return []

  const rows = (data as unknown as AttendedRsvpRow[])
    .filter((r) => r.events !== null)
    .map((r) => ({ status: r.status as 'going' | 'not_going', event: r.events! }))

  if (rows.length === 0) return []

  return Promise.all(
    rows.map(async ({ status, event }) => {
      // get_event_host is SECURITY DEFINER so it bypasses profiles RLS
      const [hostResult, countResult, attendeesResult] = await Promise.all([
        supabase.rpc('get_event_host', { p_event_id: event.id }),
        supabase.rpc('get_rsvp_count', { p_event_id: event.id }),
        supabase.rpc('get_event_attendees', { p_event_id: event.id }),
      ])
      const host = (hostResult.data as { firstname: string | null; lastname: string | null }[] | null)?.[0] ?? null
      return {
        id: event.id,
        title: event.title,
        event_date: event.event_date,
        location: event.location,
        invite_code: event.invite_code,
        background_url: event.background_url,
        attendee_count: countResult.data ?? 0,
        attendees: ((attendeesResult.data as Attendee[] | null) ?? []).slice(0, 10),
        rsvp_status: status,
        host_firstname: host?.firstname ?? null,
        host_lastname: host?.lastname ?? null,
        host_avatar_color: hostColor(event.host_id),
        host_avatar_url: null,
      }
    })
  )
}

const EVENT_DETAIL_COLUMNS = 'id, host_id, title, description, event_date, location, invite_code, background_url'

export async function getEventById(eventId: string): Promise<EventDetail | null> {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_DETAIL_COLUMNS)
    .eq('id', eventId)
    .maybeSingle()
  if (error || !data) return null
  return data
}

export async function getEventByInviteCode(inviteCode: string): Promise<EventDetail | null> {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_DETAIL_COLUMNS)
    .eq('invite_code', inviteCode)
    .maybeSingle()
  if (error || !data) return null
  return data
}

export async function getEventHost(eventId: string): Promise<EventHost | null> {
  const { data, error } = await supabase.rpc('get_event_host', { p_event_id: eventId })
  if (error || !data || data.length === 0) return null
  return data[0] as unknown as EventHost
}

export async function getEventAttendees(eventId: string): Promise<Attendee[]> {
  const { data, error } = await supabase.rpc('get_event_attendees', { p_event_id: eventId })
  if (error || !data) return []
  return data as unknown as Attendee[]
}

interface RsvpCountRow { going_count: number; maybe_count: number; not_going_count: number }

export async function getRsvpCountsByStatus(eventId: string): Promise<{ going: number; maybe: number; not_going: number }> {
  const { data } = await (supabase.rpc as unknown as (fn: string, args: Record<string, string>) => Promise<{ data: unknown }>)('get_rsvp_counts_by_status', { p_event_id: eventId })
  const row = (data as RsvpCountRow[] | null)?.[0]
  return { going: row?.going_count ?? 0, maybe: row?.maybe_count ?? 0, not_going: row?.not_going_count ?? 0 }
}

export async function getMyRsvpStatus(eventId: string, userId: string): Promise<RsvpStatus | null> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('status')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data.status as RsvpStatus
}

export async function setRsvp(eventId: string, userId: string, status: RsvpStatus) {
  return supabase
    .from('rsvps')
    .upsert({ event_id: eventId, user_id: userId, status }, { onConflict: 'event_id,user_id' })
}

export async function deleteEvent(eventId: string) {
  return supabase.from('events').delete().eq('id', eventId)
}
