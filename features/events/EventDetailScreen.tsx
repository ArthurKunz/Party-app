'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { eventCoverGradient } from '@/lib/utils'
import {
  getEventById,
  getEventAttendees,
  getEventHost,
  getMyRsvpStatus,
  setRsvp,
  deleteEvent,
  getRsvpCountsByStatus,
} from './services/events.service'
import HostRow from './components/HostRow'
import RsvpButtons from './components/RsvpButtons'
import PoolsSection from './components/PoolsSection'
import AttendeeList from './components/AttendeeList'
import EventMap from './components/EventMap'
import type { EventDetail, Attendee, EventHost, RsvpStatus } from './types/events.types'

const BackIcon = (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='19' y1='12' x2='5' y2='12' />
    <polyline points='12 19 5 12 12 5' />
  </svg>
)

const CopyIcon = (
  <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='9' y='9' width='13' height='13' rx='2' />
    <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
  </svg>
)

function getCountdown(dateString: string): { value: number; unit: string } {
  const diffMs = new Date(dateString).getTime() - Date.now()
  if (diffMs <= 0) return { value: 0, unit: 'Tage' }
  const hours = Math.floor(diffMs / 36e5)
  if (hours < 24) return { value: hours, unit: 'Stunden' }
  return { value: Math.floor(hours / 24), unit: 'Tage' }
}

export default function EventDetailScreen({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [host, setHost] = useState<EventHost | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [counts, setCounts] = useState({ going: 0, maybe: 0, not_going: 0 })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [origin, setOrigin] = useState('')
  const [descExpanded, setDescExpanded] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const uid = session.user.id
      setUserId(uid)
      const [eventData, attendeeData, hostData, status, countData] = await Promise.all([
        getEventById(eventId),
        getEventAttendees(eventId),
        getEventHost(eventId),
        getMyRsvpStatus(eventId, uid),
        getRsvpCountsByStatus(eventId),
      ])
      if (!eventData) { router.push('/parties'); return }
      setEvent(eventData)
      setAttendees(attendeeData)
      setHost(hostData)
      setIsHost(eventData.host_id === uid)
      setRsvpStatus(status)
      setCounts(countData)
      setLoading(false)
    })
  }, [eventId, router])

  const shareLink = event ? `${origin}/e/${event.invite_code}` : ''

  const handleCopy = async () => {
    if (!shareLink) return
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (!event) return
    if (!confirm('Event wirklich löschen? Das kann nicht rückgängig gemacht werden.')) return
    setDeleting(true)
    const { error } = await deleteEvent(event.id)
    if (error) { alert(error.message); setDeleting(false); return }
    router.push('/parties')
  }

  const handleRsvp = async (status: RsvpStatus) => {
    if (!event) return
    setRsvpLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    const { error } = await setRsvp(event.id, session.user.id, status)
    if (error) { alert(error.message); setRsvpLoading(false); return }
    const oldStatus = rsvpStatus
    setCounts(prev => {
      const next = { ...prev }
      if (oldStatus === 'going') next.going = Math.max(0, next.going - 1)
      else if (oldStatus === 'maybe') next.maybe = Math.max(0, next.maybe - 1)
      else if (oldStatus === 'not_going') next.not_going = Math.max(0, next.not_going - 1)
      if (status === 'going') next.going++
      else if (status === 'maybe') next.maybe++
      else next.not_going++
      return next
    })
    setRsvpStatus(status)
    setRsvpLoading(false)
  }

  if (loading || !event) return null

  const { value, unit } = getCountdown(event.event_date)
  const formattedDate = new Date(event.event_date).toLocaleDateString('de-DE', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: '2-digit',
  })
  const formattedTime = new Date(event.event_date).toLocaleTimeString('de-DE', {
    hour: '2-digit', minute: '2-digit',
  }) + ' Uhr'

  const desc = event.description?.trim() ?? ''
  const TRUNCATE_AT = 160
  const isLong = desc.length > TRUNCATE_AT

  return (
    <div className='relative min-h-screen'>

      {/* ── FIXED FULL-PAGE BACKGROUND ── */}
      <div className='fixed inset-0 overflow-hidden'>
        {event.background_url ? (
          <img
            src={event.background_url}
            alt=''
            aria-hidden='true'
            className='h-full w-full object-cover'
            style={{ filter: 'blur(2px)', transform: 'scale(1.15)' }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${eventCoverGradient(event.id)} opacity-20`} />
        )}
      </div>
      <div className='fixed inset-0 bg-background-main/50' />

      {/* ── HERO ── */}
      <div className='relative z-10 h-[45dvh]'>
        <div className='flex h-full flex-col px-6 pt-7.5 pb-10'>
          {/* Header */}
          <div className='relative flex items-center justify-center'>
            <button
              onClick={() => router.push('/parties')}
              aria-label='Zurück'
              className='absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border border-glass bg-glass text-body backdrop-blur-xl'
            >
              {BackIcon}
            </button>
            <span className='text-3xl font-bold text-headline'>{event.title}</span>
          </div>

          {/* Host */}
          <div className='mt-2 flex justify-center'>
            <HostRow host={host} />
          </div>

          <div className='flex-1' />

          {/* Countdown */}
          <div className='flex flex-col items-center'>
            <span className='text-[90px] font-bold leading-none text-headline'>{value}</span>
            <span className='mt-1 text-sm font-light text-headline'>{unit}</span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className='relative z-10 mx-auto w-full max-w-md px-6 pt-6 pb-12 flex flex-col gap-7.5'>

        {isHost && (
          <button
            onClick={handleCopy}
            className='flex h-14 w-full items-center justify-between gap-3 rounded-2xl border border-border bg-background-secondary px-4'
          >
            <span className='flex items-center gap-3 truncate text-hint text-sm'>
              <span className='shrink-0 text-background-icon'>{CopyIcon}</span>
              <span className='truncate'>{shareLink}</span>
            </span>
            <span className='shrink-0 text-body text-xs'>{copied ? 'Kopiert ✓' : 'Kopieren'}</span>
          </button>
        )}

        <div className='flex flex-col gap-2'>
          <div className='flex gap-2'>
            <div className='w-full h-15 flex items-center justify-center rounded-2xl border border-border bg-background-secondary'>
              <span className='text-md font-medium text-body text-center'>{formattedDate}</span>
            </div>
            <div className='w-full h-15 flex items-center justify-center rounded-2xl border border-border bg-background-secondary'>
              <span className='text-md font-medium text-body'>{formattedTime}</span>
            </div>
          </div>
          <EventMap location={event.location} />

          {desc ? (
            <div className='rounded-2xl border border-border bg-background-secondary p-4'>
              <span className='text-sm leading-none font-light text-hint'>
                {isLong && !descExpanded ? desc.slice(0, TRUNCATE_AT) + '…' : desc}
                {isLong && !descExpanded && (
                  <button onClick={() => setDescExpanded(true)} className='ml-1 text-xs font-semibold text-brand-pink'>
                    mehr lesen
                  </button>
                )}
                {isLong && descExpanded && (
                  <button onClick={() => setDescExpanded(false)} className='ml-1 text-xs font-semibold text-brand-pink'>
                    weniger lesen
                  </button>
                )}
              </span>
            </div>
          ) : null}
        </div>




        {/* Pools */}
        {userId && (
          <PoolsSection eventId={eventId} isHost={isHost} userId={userId} />
        )}



        <div className='flex flex-col gap-2'>
          {/* Stats */}
          <div className='flex gap-2'>
            <div className='flex-1 flex flex-col items-center gap-0.5 rounded-2xl border border-border bg-background-secondary p-3'>
              <span className='text-2xl font-bold text-headline'>{counts.going}</span>
              <span className='text-xs text-hint text-success'>zugesagt</span>
            </div>
            <div className='flex-1 flex flex-col items-center gap-0.5 rounded-2xl border border-border bg-background-secondary p-3'>
              <span className='text-2xl font-bold text-headline'>{counts.maybe}</span>
              <span className='text-xs text-hint text-maybe'>vielleicht</span>
            </div>
            <div className='flex-1 flex flex-col items-center gap-0.5 rounded-2xl border border-border bg-background-secondary p-3'>
              <span className='text-2xl font-bold text-headline'>{counts.not_going}</span>
              <span className='text-xs text-hint text-warning'>abgesagt</span>
            </div>
          </div>

          {/* Attendee list */}
          <AttendeeList attendees={attendees} />
        </div>

        {!isHost && (
          <RsvpButtons
            status={rsvpStatus}
            onGoing={() => handleRsvp('going')}
            onMaybe={() => handleRsvp('maybe')}
            onNotGoing={() => handleRsvp('not_going')}
            loading={rsvpLoading}
          />
        )}

        {isHost && (
          <button
            type='button'
            onClick={handleDelete}
            disabled={deleting}
            className='w-full rounded-full bg-warning py-3 font-semibold text-body disabled:opacity-50'
          >
            {deleting ? 'Wird gelöscht…' : 'Event löschen'}
          </button>
        )}

      </div>
    </div>
  )
}
