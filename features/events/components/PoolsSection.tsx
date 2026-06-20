'use client'

import { useState, useEffect } from 'react'
import { getEventPools } from '../services/pools.service'
import type { Pool } from '../types/events.types'
import PoolCard from './PoolCard'
import CreatePoolForm from './CreatePoolForm'

type Props = {
  eventId: string
  isHost: boolean
  userId: string
}

export default function PoolsSection({ eventId, isHost, userId }: Props) {
  const [pools, setPools] = useState<Pool[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    void getEventPools(eventId).then(setPools)
  }, [eventId])

  const refresh = () => void getEventPools(eventId).then(setPools)

  return (
    <div>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-semibold uppercase tracking-wide text-label'>
          Umfragen{pools.length > 0 ? ` (${pools.length})` : ''}
        </span>
        {isHost && !showForm && (
          <button
            type='button'
            onClick={() => setShowForm(true)}
            className='text-xs text-hint border border-border-input rounded-full px-3 py-1.5'
          >
            + Hinzufügen
          </button>
        )}
      </div>

      {pools.map((pool) => (
        <PoolCard
          key={pool.id}
          pool={pool}
          isHost={isHost}
          userId={userId}
          onDelete={refresh}
          onRefresh={refresh}
        />
      ))}

      {isHost && showForm && (
        <div className='mt-3'>
          <CreatePoolForm
            eventId={eventId}
            onCreated={() => { setShowForm(false); refresh() }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {pools.length === 0 && !showForm && (
        <div className='mt-3 rounded-2xl border border-border bg-background-secondary p-5'>
          <span className='text-sm text-hint'>
            {isHost
              ? 'Noch keine Umfragen. Füge eine hinzu!'
              : 'Keine Umfragen für dieses Event.'}
          </span>
        </div>
      )}
    </div>
  )
}
