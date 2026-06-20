'use client'

import { useState } from 'react'
import { getInitials } from '@/lib/utils'
import { upsertPoolResponse, deletePool } from '../services/pools.service'
import type { Pool } from '../types/events.types'

type Props = {
  pool: Pool
  isHost: boolean
  userId: string
  onDelete: () => void
  onRefresh: () => void
}

function Avatar({ firstname, lastname }: { firstname: string | null; lastname: string | null }) {
  return (
    <div className='h-6 w-6 shrink-0 rounded-full bg-background-profilpicture flex items-center justify-center text-[10px] font-semibold text-body'>
      {getInitials(firstname, lastname)}
    </div>
  )
}

function displayName(firstname: string | null, lastname: string | null) {
  return [firstname, lastname].filter(Boolean).join(' ') || 'Anonym'
}

export default function PoolCard({ pool, isHost, userId, onDelete, onRefresh }: Props) {
  const myResponse = pool.responses.find((r) => r.user_id === userId)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    myResponse?.option_id ?? null
  )
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Umfrage wirklich löschen?')) return
    setDeleting(true)
    await deletePool(pool.id)
    onDelete()
  }

  // — Host view —
  if (isHost) {
    return (
      <div className='rounded-2xl border border-border bg-background-secondary p-5 flex flex-col gap-4 mt-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <span className='block text-sm font-semibold text-headline'>{pool.question}</span>
            {pool.description && (
              <span className='block mt-1 text-xs text-hint'>{pool.description}</span>
            )}
          </div>
          <button
            type='button'
            onClick={handleDelete}
            disabled={deleting}
            className='shrink-0 h-8 w-8 flex items-center justify-center rounded-full border border-border-input bg-background-input text-hint text-xs disabled:opacity-40'
          >
            {deleting ? '…' : '✕'}
          </button>
        </div>

        {pool.responses.length === 0 ? (
          <span className='text-xs text-hint'>Noch keine Antworten.</span>
        ) : (
          <div className='flex flex-col gap-3'>
            {pool.options.map((opt) => {
              const optResponses = pool.responses.filter((r) => r.option_id === opt.id)
              return (
                <div key={opt.id}>
                  <span className='text-xs font-medium text-subheadline mb-1.5 block'>
                    {opt.label} ({optResponses.length})
                  </span>
                  <div className='flex flex-col gap-1.5'>
                    {optResponses.map((r) => (
                      <div key={r.id} className='flex items-center gap-2'>
                        <Avatar firstname={r.firstname} lastname={r.lastname} />
                        <span className='text-xs text-body'>{displayName(r.firstname, r.lastname)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // — Guest view —
  const hasVoted = myResponse !== null
  const totalVotes = pool.responses.length

  return (
    <div className='rounded-2xl border border-border bg-background-secondary p-5 flex flex-col gap-4 mt-3'>
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
                <span
                  className={`shrink-0 ml-2 text-xs font-semibold ${
                    isSelected ? 'text-button/70' : 'text-hint'
                  }`}
                >
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
