'use client'

import type { EventWithCount } from '../types/events.types'

export default function EventCard({
  event,
  isHost = false,
  featured = false,
}: {
  event: EventWithCount
  isHost?: boolean
  featured?: boolean
}) {
  const hostName = [event.host_firstname, event.host_lastname].filter(Boolean).join(' ')

  return (
    <div className='flex flex-col gap-2 transition-transform active:scale-[0.98] pb-1.5 '>
      <div
        className={`relative overflow-hidden rounded-lg bg-secondary ${
          featured ? 'aspect-[2/1]' : 'aspect-square'
        }`}
      >
        {event.background_url && (
          <img
            src={event.background_url}
            alt=''
            aria-hidden='true'
            className='absolute inset-0 h-full w-full object-cover'
          />
        )}
      </div>

      <div className='flex flex-col min-w-0'>
        <span className='truncate font-md text-label-1 text-label-large'>
          {event.title}
        </span>
        {!isHost && (
          <span className='truncate text-label-2 text-label-small'>von {hostName || 'Unbekannt'}</span>
        )}
      </div>
    </div>
  )
}
