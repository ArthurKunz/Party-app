'use client'

import type { RsvpStatus } from '../types/events.types'

type Props = {
  status: RsvpStatus | null
  onGoing: () => void
  onMaybe: () => void
  onNotGoing: () => void
  loading?: boolean
}

const base = 'flex-1 rounded-2xl py-3.5 font-semibold cursor-pointer'
const goingClass = `${base} bg-success/50 text-success ring-1 ring-inset ring-success`
const maybeClass = `${base} bg-maybe/50 text-maybe ring-1 ring-inset ring-maybe`
const notGoingClass = `${base} bg-warning/50 text-warning ring-1 ring-inset ring-warning`

export default function RsvpButtons({ status, onGoing, onMaybe, onNotGoing, loading }: Props) {
  const goingBtn = <button type='button' onClick={onGoing} disabled={loading} className={goingClass}>Zusagen</button>
  const maybeBtn = <button type='button' onClick={onMaybe} disabled={loading} className={maybeClass}>Vielleicht</button>
  const notGoingBtn = <button type='button' onClick={onNotGoing} disabled={loading} className={notGoingClass}>Absagen</button>

  if (status === 'going') return <div className='flex gap-3'>{maybeBtn}{notGoingBtn}</div>
  if (status === 'maybe') return <div className='flex gap-3'>{goingBtn}{notGoingBtn}</div>
  if (status === 'not_going') return <div className='flex gap-3'>{goingBtn}{maybeBtn}</div>
  return <div className='flex gap-3'>{goingBtn}{maybeBtn}</div>
}
