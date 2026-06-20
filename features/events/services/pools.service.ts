import { supabase } from '@/lib/supabase/client'
import type { Pool, PoolOption, PoolResponse, PoolType } from '../types/events.types'

type RawPoolRow = {
  id: string
  event_id: string
  question: string
  description: string | null
  type: string
  allow_text_response: boolean
  created_at: string | null
}

type RawOptionRow = {
  id: string
  pool_id: string
  label: string
  position: number
}

export async function getEventPools(eventId: string): Promise<Pool[]> {
  const [{ data: poolRows }, { data: responseRows }] = await Promise.all([
    supabase
      .from('pools')
      .select('id, event_id, question, description, type, allow_text_response, created_at')
      .eq('event_id', eventId)
      .order('created_at'),
    supabase.rpc('get_pool_responses_by_event', { p_event_id: eventId }),
  ])

  if (!poolRows || poolRows.length === 0) return []

  const poolIds = (poolRows as RawPoolRow[]).map((p) => p.id)
  const { data: optionRows } = await supabase
    .from('pool_options')
    .select('id, pool_id, label, position')
    .in('pool_id', poolIds)
    .order('position')

  const options = (optionRows ?? []) as RawOptionRow[]
  const responses = (responseRows ?? []) as PoolResponse[]

  return (poolRows as RawPoolRow[]).map((pool) => ({
    id: pool.id,
    event_id: pool.event_id,
    question: pool.question,
    description: pool.description,
    type: pool.type as PoolType,
    allow_text_response: pool.allow_text_response,
    created_at: pool.created_at ?? '',
    options: options
      .filter((o) => o.pool_id === pool.id)
      .map((o): PoolOption => ({ id: o.id, pool_id: o.pool_id, label: o.label, position: o.position })),
    responses: responses.filter((r) => r.pool_id === pool.id),
  }))
}

export async function createPool(payload: {
  event_id: string
  question: string
  description: string | null
  type: PoolType
  allow_text_response: boolean
}) {
  return supabase.from('pools').insert(payload).select('id').single()
}

export async function addPoolOption(poolId: string, label: string, position: number) {
  return supabase.from('pool_options').insert({ pool_id: poolId, label, position })
}

export async function upsertPoolResponse(
  poolId: string,
  userId: string,
  optionId: string | null,
  textResponse: string | null
) {
  return supabase
    .from('pool_responses')
    .upsert(
      { pool_id: poolId, user_id: userId, option_id: optionId, text_response: textResponse },
      { onConflict: 'pool_id,user_id' }
    )
}

export async function deletePoolResponse(poolId: string, userId: string) {
  return supabase
    .from('pool_responses')
    .delete()
    .eq('pool_id', poolId)
    .eq('user_id', userId)
}

export async function deletePool(poolId: string) {
  return supabase.from('pools').delete().eq('id', poolId)
}
