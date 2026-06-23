'use client'

import { useState } from 'react'
import { upsertPoolResponse } from '../services/pools.service'
import type { Pool } from '../types/events.types'

type Props = {
  pool: Pool
  userId: string
  onRefresh: () => void
}

export default function PoolCard({ pool, userId, onRefresh }: Props) {
  const myResponse = pool.responses.find((r) => r.user_id === userId)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(myResponse?.option_id ?? null)
  const [submitting, setSubmitting] = useState(false)

  const hasVoted = myResponse != null
  const totalVotes = pool.responses.length

  return (
    <div className='rounded-2xl border border-border bg-background-secondary p-5 flex flex-col gap-4'>
      <div>
        <span className='block text-sm font-semibold text-headline'>{pool.question}</span>
        {pool.description && (
          <span className='block mt-1 text-xs text-hint'>{pool.description}</span>
        )}
      </div>

      <div className='flex flex-col gap-2'>
        {pool.options.map((opt) => {
          const count = pool.responses.filter((r) => r.option_id === opt.id).length
          const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          const isSelected = selectedOptionId === opt.id

          return (
            <button
              key={opt.id}
              type='button'
              onClick={() => {
                if (submitting || isSelected) return
                setSelectedOptionId(opt.id)
                setSubmitting(true)
                void upsertPoolResponse(pool.id, userId, opt.id, null).then(() => {
                  setSubmitting(false)
                  onRefresh()
                })
              }}
              disabled={submitting}
              className={`h-11 rounded-xl border px-4 text-sm text-left flex items-center justify-between ${
                isSelected
                  ? 'bg-background-button text-button border-transparent'
                  : 'bg-background-input border-border-input text-input'
              }`}
            >
              <span>{opt.label}</span>
              {hasVoted && (
                <span className={`shrink-0 ml-2 text-xs font-semibold ${isSelected ? 'text-button/70' : 'text-hint'}`}>
                  {percentage}%
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
