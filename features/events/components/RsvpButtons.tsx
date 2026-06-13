'use client'

import type { RsvpStatus } from '../types/events.types'

type Props = {
  status: RsvpStatus | null
  onGoing: () => void
  onNotGoing: () => void
  loading?: boolean
}

const goingClass =
  'w-full rounded-full bg-green-600 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50'
const notGoingClass =
  'w-full rounded-full bg-red-600 py-3 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50'

// No RSVP yet -> offer both choices. Already responded -> single toggle to the other state.
export default function RsvpButtons({ status, onGoing, onNotGoing, loading }: Props) {
  if (status === 'going') {
    return (
      <button type='button' onClick={onNotGoing} disabled={loading} className={notGoingClass}>
        Absagen
      </button>
    )
  }
  if (status === 'not_going') {
    return (
      <button type='button' onClick={onGoing} disabled={loading} className={goingClass}>
        Zusagen
      </button>
    )
  }
  return (
    <div className='flex gap-3'>
      <button type='button' onClick={onNotGoing} disabled={loading} className={notGoingClass}>
        Absagen
      </button>
      <button type='button' onClick={onGoing} disabled={loading} className={goingClass}>
        Zusagen
      </button>
    </div>
  )
}
