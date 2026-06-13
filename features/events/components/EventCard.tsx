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
    <div className='flex items-center gap-4 p-4 rounded-xl border border-border bg-background-secondary'>
      <div className='w-14 h-14 rounded-lg bg-background-tertiary shrink-0' />
      <div className='flex-1 min-w-0'>
        <span className='block text-body font-medium truncate text-headline'>{event.title}</span>
        <span className='mt-0.5 block text-sm text-hint'>{formatDate(event.event_date)}</span>
      </div>
      <div className='text-right shrink-0'>
        <span className='block text-2xl font-semibold leading-none text-headline'>{event.attendee_count}</span>
        <span className='mt-1 block text-xs text-hint'>Teilnehmer</span>
      </div>
    </div>
  )
}
