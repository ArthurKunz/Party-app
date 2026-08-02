'use client'

import { useState } from 'react'
import { getInitials } from '@/lib/utils'
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

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <span className='block text-subheading-1 font-semibold text-heading'>{pool.question}</span>
        {pool.description && (
          <span className='block mt-1 text-body-1 text-body'>{pool.description}</span>
        )}
      </div>

      <div className='flex flex-col gap-2'>
        {pool.options.map((opt) => {
          const voters = pool.responses.filter((r) => r.option_id === opt.id)
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
              className={`h-12.5 rounded-full pl-3 pr-3 flex items-center justify-between gap-3 ${
                isSelected ? 'bg-tertiary' : 'bg-secondary'
              }`}
            >
              <div className='flex items-center gap-3 min-w-0'>
                <div
                  className={`h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-heading' : 'border-label-small'
                  }`}
                >
                  {isSelected && <div className='h-3 w-3 rounded-full bg-heading' />}
                </div>
                <span className='truncate text-label-1 text-heading'>{opt.label}</span>
              </div>

              {voters.length > 0 && (
                <div className='flex items-center -space-x-2 shrink-0'>
                  {voters.slice(0, 3).map((v) => (
                    <div
                      key={v.id}
                      className={`h-6 w-6 rounded-full overflow-hidden border ${isSelected ? 'border-tertiary' : 'border-secondary'} flex items-center justify-center text-[9px] font-semibold text-heading`}
                      style={{ backgroundColor: v.avatar_color ?? '#2A2A2A' }}
                    >
                      {v.avatar_url ? (
                        <img src={v.avatar_url} alt='' className='h-full w-full object-cover' />
                      ) : (
                        getInitials(v.firstname, v.lastname)
                      )}
                    </div>
                  ))}
                  {voters.length > 3 && (
                    <div className='h-6 w-6 rounded-full bg-quaternary ring-2 ring-main flex items-center justify-center text-[9px] font-semibold text-heading'>
                      +{voters.length - 3}
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
