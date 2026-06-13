import { supabase } from '@/lib/supabase/client'
import type { CreateEventPayload } from '../types/events.types'

export async function createEvent(payload: CreateEventPayload) {
  return supabase.from('events').insert(payload).select('invite_code').single()
}
