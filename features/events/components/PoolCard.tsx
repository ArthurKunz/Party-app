'use client'

import { useState } from 'react'
import { alertError, getInitials } from '@/lib/utils'
import type { Profile } from '@/features/profile/services/profile.service'
import { upsertPoolResponse } from '../services/pools.service'
import type { Pool, PoolResponse } from '../types/events.types'

type Props = {
  pool: Pool
  userId: string
  myProfile: Profile | null
  onRefresh: () => void
}

export default function PoolCard({ pool, userId, myProfile, onRefresh }: Props) {
  const serverResponse = pool.responses.find((r) => r.user_id === userId) ?? null
  // Holds my own vote locally so my avatar moves the instant I tap, instead of
  // waiting for the write + refetch to come back from the database.
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const selectedOptionId = pendingOptionId ?? serverResponse?.option_id ?? null

  const myRow: PoolResponse | null =
    selectedOptionId === null
      ? null
      : {
          id: serverResponse?.id ?? `pending-${pool.id}`,
          pool_id: pool.id,
          user_id: userId,
          option_id: selectedOptionId,
          text_response: serverResponse?.text_response ?? null,
          created_at: serverResponse?.created_at ?? new Date().toISOString(),
          firstname: myProfile?.firstname ?? serverResponse?.firstname ?? null,
          lastname: myProfile?.lastname ?? serverResponse?.lastname ?? null,
          avatar_url: myProfile?.avatar_url ?? serverResponse?.avatar_url ?? null,
          avatar_color: myProfile?.avatar_color ?? serverResponse?.avatar_color ?? null,
        }

  // My row replaces the server's copy in place, so changing my vote never reorders anyone else.
  const responses =
    myRow === null
      ? pool.responses
      : serverResponse
        ? pool.responses.map((r) => (r.user_id === userId ? myRow : r))
        : [...pool.responses, myRow]

  const handleVote = async (optionId: string) => {
    if (submitting || selectedOptionId === optionId) return
    const previous = pendingOptionId
    setPendingOptionId(optionId)
    setSubmitting(true)
    const { error } = await upsertPoolResponse(pool.id, userId, optionId, null)
    setSubmitting(false)
    if (error) {
      setPendingOptionId(previous)
      alertError('Deine Stimme konnte nicht gespeichert werden.', error.message)
      return
    }
    onRefresh()
  }

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
          const voters = responses.filter((r) => r.option_id === opt.id)
          const isSelected = selectedOptionId === opt.id

          return (
            <button
              key={opt.id}
              type='button'
              onClick={() => void handleVote(opt.id)}
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
                      className='h-6 w-6 rounded-full overflow-hidden flex items-center justify-center text-[9px] font-semibold text-heading'
                      style={{ backgroundColor: v.avatar_url ? 'transparent' : (v.avatar_color ?? '#2A2A2A') }}
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
