'use client'

import type { EventWithCount } from '../types/events.types'

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function EventCard({ event }: { event: EventWithCount }) {
  return (
    <div className='flex items-center gap-4 p-4 rounded-xl bg-white/5'>
      <div className='w-14 h-14 rounded-lg bg-white/10 shrink-0' />
      <div className='flex-1 min-w-0'>
        <p className='text-white font-medium truncate'>{event.title}</p>
        <p className='text-white/50 text-sm mt-0.5'>{formatDate(event.event_date)}</p>
      </div>
      <div className='text-right shrink-0'>
        <p className='text-white text-2xl font-semibold leading-none'>{event.attendee_count}</p>
        <p className='text-white/50 text-xs mt-1'>Teilnehmer</p>
      </div>
    </div>
  )
}
