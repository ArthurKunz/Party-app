'use client'

import { useEffect, useState } from 'react'
import { getEventPools } from '../services/pools.service'
import type { Pool } from '../types/events.types'
import PoolCard from './PoolCard'

type Props = {
  eventId: string
  isHost: boolean
  userId: string
}

export default function PoolsSection({ eventId, isHost, userId }: Props) {
  const [pools, setPools] = useState<Pool[]>([])

  useEffect(() => {
    void getEventPools(eventId).then(setPools)
  }, [eventId])

  const refresh = () => void getEventPools(eventId).then(setPools)

  return (
    <div className='flex flex-col gap-2'>
      {pools.map((pool) => (
        <PoolCard
          key={pool.id}
          pool={pool}
          userId={userId}
          onRefresh={refresh}
        />
      ))}

      {pools.length === 0 && (
        <div className='rounded-2xl border border-border bg-background-secondary p-5'>
          <span className='text-sm text-hint'>
            {isHost ? 'Noch keine Umfragen.' : 'Keine Umfragen für dieses Event.'}
          </span>
        </div>
      )}
    </div>
  )
}
