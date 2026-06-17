'use client'

import type { RsvpStatus } from '../types/events.types'

type Props = {
  status: RsvpStatus | null
  onGoing: () => void
  onNotGoing: () => void
  loading?: boolean
}

const CheckIcon = (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='20 6 9 17 4 12' />
  </svg>
)

const XIcon = (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='18' y1='6' x2='6' y2='18' />
    <line x1='6' y1='6' x2='18' y2='18' />
  </svg>
)

const goingClass =
  'flex w-full items-center justify-center gap-2 rounded-full bg-success py-3 font-semibold text-button transition-opacity hover:opacity-90 disabled:opacity-50'
const notGoingClass =
  'flex w-full items-center justify-center gap-2 rounded-full bg-warning py-3 font-semibold text-body transition-opacity hover:opacity-90 disabled:opacity-50'

// No RSVP yet -> offer both choices. Already responded -> single toggle to the other state.
export default function RsvpButtons({ status, onGoing, onNotGoing, loading }: Props) {
  if (status === 'going') {
    return (
      <button type='button' onClick={onNotGoing} disabled={loading} className={notGoingClass}>
        {XIcon} Absagen
      </button>
    )
  }
  if (status === 'not_going') {
    return (
      <button type='button' onClick={onGoing} disabled={loading} className={goingClass}>
        {CheckIcon} Zusagen
      </button>
    )
  }
  return (
    <div className='flex gap-3'>
      <button type='button' onClick={onNotGoing} disabled={loading} className={notGoingClass}>
        {XIcon} Absagen
      </button>
      <button type='button' onClick={onGoing} disabled={loading} className={goingClass}>
        {CheckIcon} Zusagen
      </button>
    </div>
  )
}
