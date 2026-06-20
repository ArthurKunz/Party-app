import { supabase } from '@/lib/supabase/client'
import type { CreateEventPayload, EventWithCount, EventDetail, Attendee, EventHost, RsvpStatus } from '../types/events.types'

export async function createEvent(payload: CreateEventPayload) {
  return supabase.from('events').insert(payload).select('id, invite_code').single()
}

async function attachCount(event: Omit<EventWithCount, 'attendee_count'>): Promise<EventWithCount> {
  const { data } = await supabase.rpc('get_rsvp_count', { p_event_id: event.id })
  return { ...event, attendee_count: data ?? 0 }
}

export async function getHostedEvents(userId: string): Promise<EventWithCount[]> {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, event_date, location, invite_code')
    .eq('host_id', userId)
    .order('event_date', { ascending: true })
  if (error || !data) return []
  return Promise.all(data.map(attachCount))
}

export async function getAttendedEvents(userId: string): Promise<EventWithCount[]> {
  // Both 'going' and 'not_going' RSVPs appear under "Ich bin Gast"
  const { data, error } = await supabase
    .from('rsvps')
    .select('events(id, title, event_date, location, invite_code)')
    .eq('user_id', userId)
  if (error || !data) return []
  const events = data
    .map((row) => row.events as unknown as Omit<EventWithCount, 'attendee_count'> | null)
    .filter((e): e is Omit<EventWithCount, 'attendee_count'> => e !== null)
  return Promise.all(events.map(attachCount))
}

const EVENT_DETAIL_COLUMNS = 'id, host_id, title, description, event_date, location, invite_code'

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
  return data[0]
}

export async function getEventAttendees(eventId: string): Promise<Attendee[]> {
  const { data, error } = await supabase.rpc('get_event_attendees', { p_event_id: eventId })
  if (error || !data) return []
  return data
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
