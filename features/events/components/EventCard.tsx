'use client'

import { getInitials, eventCoverGradient } from '@/lib/utils'
import type { EventWithCount, RsvpStatus } from '../types/events.types'

const MAX_CIRCLES = 9

function getCountdown(dateString: string): { value: number; unit: string } {
  const diffMs = new Date(dateString).getTime() - Date.now()
  if (diffMs <= 0) return { value: 0, unit: 'Tage' }
  const hours = Math.floor(diffMs / 36e5)
  if (hours < 24) return { value: hours, unit: 'Stunden' }
  return { value: Math.floor(hours / 24), unit: 'Tage' }
}

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

const RSVP_BADGE_CONFIG: Record<RsvpStatus, { emoji: string; label: string; classes: string }> = {
  going: { emoji: '✅', label: 'zugesagt', classes: 'bg-success/30 text-success border-success' },
  not_going: { emoji: '❌', label: 'abgesagt', classes: 'bg-warning/30 text-warning border-warning' },
  maybe: { emoji: '🤔', label: 'vielleicht', classes: 'bg-maybe/30 text-maybe border-maybe' },
}

function RsvpBadge({ status }: { status: RsvpStatus }) {
  const { emoji, label, classes } = RSVP_BADGE_CONFIG[status]
  return (
    <div className={`flex items-center gap-1 px-3 h-7.5 rounded-full border border-[0.75px] ${classes}`}>
      <span className='text-xs'>{emoji}</span>
      <span className='text-xs'>{label}</span>
    </div>
  )
}

export default function EventCard({
  event,
  isHost = false,
  featured = false,
}: {
  event: EventWithCount
  isHost?: boolean
  featured?: boolean
}) {
  const { value, unit } = getCountdown(event.event_date)
  const visible = Math.min(event.attendee_count, MAX_CIRCLES)
  const overflow = event.attendee_count - visible
  const hostName = [event.host_firstname, event.host_lastname].filter(Boolean).join(' ')
  const hasAttendees = event.attendee_count > 0
  const guestStat = event.max_guests ? `${event.attendee_count}/${event.max_guests}` : `${event.attendee_count}`

  return (
    // Outer wrapper: no overflow-hidden so circles can hang below; pb reserves space for them
    <div
      className={`relative transition-transform active:scale-[0.98] ${featured ? 'mb-3' : ''}`}
      style={{ paddingBottom: hasAttendees && featured ? 20 : 0 }}
    >
      {/* Card — overflow-hidden clips the blurred background image */}
      <div className='relative overflow-hidden rounded-3xl bg-background-main border border-[#0F0F0F] border-[0.75]'>

        {event.background_url ? (
          <div className='absolute inset-0'>
            <img
              src={event.background_url}
              alt=''
              aria-hidden='true'
              className='h-full w-full object-cover'
              style={{ filter: 'blur(7.5px) brightness(0.35)', transform: 'scale(1.1)' }}
            />
          </div>
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${eventCoverGradient(event.id)} opacity-20`}
          />
        )}

        <div className='absolute bg-background-main/60 w-full h-full'/>

        {/* Content */}
        <div className='relative z-10 flex flex-col gap-5 p-5'>
          {featured ? (
            <>
              <div className='flex flex-col gap-2'>
                {!isHost && (
                  <div className='flex items-start justify-between gap-3'>
                    <div
                      className='h-12.5 w-12.5 shrink-0 overflow-hidden rounded-full flex items-center justify-center text-lg font-semibold text-body'
                      style={{ backgroundColor: event.host_avatar_color ?? '#2A2A2A' }}
                    >
                      {event.host_avatar_url ? (
                        <img src={event.host_avatar_url} alt='' className='h-full w-full object-cover' />
                      ) : (
                        getInitials(event.host_firstname ?? null, event.host_lastname ?? null)
                      )}
                    </div>
                    {event.rsvp_status && <RsvpBadge status={event.rsvp_status} />}
                  </div>
                )}

                <div className='flex flex-col'>
                  <span className='truncate text-2xl font-semibold text-headline'>{event.title}</span>
                  {!isHost && <span className='truncate text-xs font-light text-subheadline'>{hostName || 'Unbekannt'}</span>}
                </div>

              </div>

              <div className='w-full flex justify-between mb-2'>
                <div className='flex flex-col items-center gap-1'>
                  <div className='flex items-center gap-1'>
                    <div className='p-2 bg-background-tertiary rounded-full text-xs'>📅</div>
                    <div className='p-2 bg-background-tertiary rounded-full text-xs text-headline font-md'>{formatShortDate(event.event_date)}</div>
                  </div>
                  <span className='text-[10px] text-hint font-light'>Datum</span>
                </div>

                <div className='flex flex-col items-center gap-1'>
                  <div className='flex items-center gap-1'>
                    <div className='p-2 bg-background-tertiary rounded-full text-xs'>⏳</div>
                    <div className='h-7.5 w-7.5 flex justify-center items-center bg-background-tertiary rounded-full text-xs text-headline font-md'>{String(value)}</div>
                  </div>
                  <span className='text-[10px] text-hint font-light'>{unit}</span>
                </div>

                <div className='flex flex-col items-center gap-1'>
                  <div className='flex items-center gap-1'>
                    <div className='p-2 bg-background-tertiary rounded-full text-xs'>👥</div>
                    <div className='p-2 bg-background-tertiary rounded-full text-xs text-headline font-md'>{guestStat}</div>
                  </div>
                  <span className='text-[10px] text-hint font-light'>max. Gäste</span>
                </div>
              </div>
            </>
          ) : (
            <div className='flex items-start justify-between gap-3'>
              <div className='flex min-w-0 flex-1 flex-col'>
                <div className='flex justify-between'>
                  <div className='flex flex-col'>
                    <span className='truncate text-2xl font-semibold text-headline'>{event.title}</span>
                    {!isHost && (
                      <span className='truncate text-xs font-light text-subheadline'>{hostName || 'Unbekannt'}</span>
                    )}
                  </div>
                  <div className='flex shrink-0 flex-col items-end gap-2'>
                    {!isHost && event.rsvp_status && <RsvpBadge status={event.rsvp_status} />}
                  </div>
                </div>
                
                <div className='flex justify-between mt-3'>
                  {hasAttendees && (
                    <div className='w-full flex items-center'>
                      {Array.from({ length: visible }).map((_, i) => {
                        const a = event.attendees?.[i]
                        return (
                          <div
                            key={i}
                            className='h-8 w-8 rounded-full overflow-hidden ring-1 ring-background-main flex items-center justify-center text-[10px] font-semibold text-body'
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
                  <div className='flex items-center gap-1'>
                    <div className='p-2 bg-background-tertiary rounded-full text-xs'>⏳</div>
                    <div className='h-8 w-8 flex justify-center items-center bg-background-tertiary rounded-full text-xs text-headline font-md'>{String(value)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {hasAttendees && featured && (
          <div className='absolute w-full bottom-[-5] px-6 flex items-center'>
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