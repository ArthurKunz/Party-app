'use client'

import { getInitials, eventCoverGradient } from '@/lib/utils'
import type { EventWithCount } from '../types/events.types'

const MAX_CIRCLES = 9

function getCountdown(dateString: string): { value: number; unit: string } {
  const diffMs = new Date(dateString).getTime() - Date.now()
  if (diffMs <= 0) return { value: 0, unit: 'Tage' }
  const hours = Math.floor(diffMs / 36e5)
  if (hours < 24) return { value: hours, unit: 'Stunden' }
  return { value: Math.floor(hours / 24), unit: 'Tage' }
}

function formatDate(dateString: string): string {
  const d = new Date(dateString)
  const weekday = d.toLocaleDateString('de-DE', { weekday: 'short' })
  const date = d.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' })
  return `${weekday}., ${date}`
}

export default function EventCard({
  event,
  isHost = false,
}: {
  event: EventWithCount
  isHost?: boolean
}) {
  const { value, unit } = getCountdown(event.event_date)
  const visible = Math.min(event.attendee_count, MAX_CIRCLES)
  const overflow = event.attendee_count - visible
  const hostName = [event.host_firstname, event.host_lastname].filter(Boolean).join(' ')
  const hasAttendees = event.attendee_count > 0

  return (
    // Outer wrapper: no overflow-hidden so circles can hang below; pb reserves space for them
    <div
      className='relative transition-transform active:scale-[0.98]'
      style={{ paddingBottom: hasAttendees ? 20 : 0 }}
    >
      {/* Card — overflow-hidden clips the blurred background image */}
      <div className='relative overflow-hidden rounded-3xl bg-background-secondary border border-border'>
        {/* Background */}
        {event.background_url ? (
          <div className='absolute inset-0'>
            <img
              src={event.background_url}
              alt=''
              aria-hidden='true'
              className='h-full w-full object-cover'
              style={{ filter: 'blur(3px) brightness(0.35)', transform: 'scale(1.1)' }}
            />
          </div>
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${eventCoverGradient(event.id)} opacity-20`}
          />
        )}

        {/* Content */}
        <div className={`relative z-10 px-8 pb-3 ${isHost ? 'pt-5' : 'pt-8'}`}>
          {/* Top row */}
          <div className='flex items-center justify-between gap-3'>
            <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
              {!isHost && event.rsvp_status && (
                <span
                  className={`text-xs font-light ${
                    event.rsvp_status === 'going' ? 'text-success' : 'text-warning'
                  }`}
                >
                  {event.rsvp_status === 'going' ? 'zugesagt' : 'abgesagt'}
                </span>
              )}
              <span className='truncate text-3xl font-bold text-headline'>{event.title}</span>
              {!isHost && (
                <div className='mt-1 flex items-center gap-1.5'>
                  <div
                    className='flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full text-[8px] font-semibold text-body'
                    style={{ backgroundColor: event.host_avatar_color ?? '#2A2A2A' }}
                  >
                    {event.host_avatar_url ? (
                      <img src={event.host_avatar_url} alt='' className='h-full w-full object-cover' />
                    ) : (
                      getInitials(event.host_firstname ?? null, event.host_lastname ?? null)
                    )}
                  </div>
                  <span className='truncate text-[12px] text-subheadline'>{hostName || 'Unbekannt'}</span>
                </div>
              )}
            </div>

            <div className='flex flex-col items-center'>
              <span className='text-4xl font-bold leading-none text-headline'>{value}</span>
              <span className='mt-0.5 text-xs text-headline font-light'>{unit}</span>
            </div>
          </div>

          {/* Location + date */}
          {!isHost && (
            <p className='mt-3 mb-1.5 text-center text-xs font-thin text-hint'>
              {event.location} · {formatDate(event.event_date)}
            </p>
          )}
        </div>
      </div>

      {/* Attendee circles — outside the overflow-hidden card, hanging below its bottom edge */}
      {hasAttendees && (
        <div className='absolute w-full bottom-[-5] px-8 flex items-center'>
          {Array.from({ length: visible }).map((_, i) => {
            const a = event.attendees?.[i]
            return (
              <div
                key={i}
                className='h-10 w-10 rounded-full overflow-hidden ring-1 ring-background-main flex items-center justify-center text-[10px] font-semibold text-body'
                style={{ marginLeft: i === 0 ? 0 : -7.5, backgroundColor: a?.avatar_color ?? '#2A2A2A' }}
              >
                {a?.avatar_url ? (
                  <img src={a.avatar_url} alt='' className='h-full w-full object-cover' />
                ) : (
                  getInitials(a?.firstname ?? null, a?.lastname ?? null)
                )}
              </div>
            )
          })}
          {overflow > 0 && (
            <div
              className='flex h-10 w-10 items-center justify-center rounded-full bg-background-tertiary text-[10px] font-semibold text-hint ring-1 ring-background-main'
              style={{ marginLeft: -7.5 }}
            >
              +{overflow}
            </div>
          )}
        </div>
      )}
    </div>
  )
}