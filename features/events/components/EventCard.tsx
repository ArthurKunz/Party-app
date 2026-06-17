'use client'

import { eventCoverGradient } from '@/lib/utils'
import type { EventWithCount } from '../types/events.types'

function getDateParts(dateString: string): { day: string; month: string } {
  const date = new Date(dateString)
  return {
    day: date.toLocaleDateString('de-DE', { day: 'numeric' }),
    month: date.toLocaleDateString('de-DE', { month: 'short' }).replace('.', ''),
  }
}

const PinIcon = (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
    <circle cx='12' cy='10' r='3' />
  </svg>
)

const PersonIcon = (
  <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
    <circle cx='12' cy='7' r='4' />
  </svg>
)

export default function EventCard({ event }: { event: EventWithCount }) {
  const { day, month } = getDateParts(event.event_date)

  return (
    <div className='relative overflow-hidden rounded-3xl border border-border bg-background-secondary transition-transform active:scale-[0.98]'>
      <div className={`h-20 w-full bg-gradient-to-br ${eventCoverGradient(event.id)}`} />

      <div className='px-4 pb-4'>
        <div className='-mt-7 mb-3 flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-background-button shadow-lg'>
          <span className='text-lg font-bold leading-none text-button'>{day}</span>
          <span className='text-[10px] font-semibold uppercase leading-none text-button/70'>{month}</span>
        </div>

        <span className='block truncate text-lg font-semibold text-headline'>{event.title}</span>

        <div className='mt-3 flex items-center justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-1.5 text-hint'>
            <span className='shrink-0 text-background-icon'>{PinIcon}</span>
            <span className='truncate text-sm'>{event.location}</span>
          </div>
          <div className='flex shrink-0 items-center gap-1 rounded-full bg-background-tertiary px-2.5 py-1 text-xs text-body'>
            <span className='text-background-icon'>{PersonIcon}</span>
            {event.attendee_count}
          </div>
        </div>
      </div>
    </div>
  )
}
