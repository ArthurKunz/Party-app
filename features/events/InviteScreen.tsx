'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { eventCoverGradient } from '@/lib/utils'
import {
  getEventByInviteCode,
  getEventAttendees,
  getEventHost,
  getMyRsvpStatus,
  setRsvp,
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

function getCountdown(dateString: string): { value: number; unit: string } {
  const diffMs = new Date(dateString).getTime() - Date.now()
  if (diffMs <= 0) return { value: 0, unit: 'Tage' }
  const hours = Math.floor(diffMs / 36e5)
  if (hours < 24) return { value: hours, unit: 'Stunden' }
  return { value: Math.floor(hours / 24), unit: 'Tage' }
}

export default function InviteScreen({ inviteCode }: { inviteCode: string }) {
  const router = useRouter()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [host, setHost] = useState<EventHost | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus | null>(null)
  const [counts, setCounts] = useState({ going: 0, maybe: 0, not_going: 0 })
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)

  useEffect(() => {
    async function load() {
      const eventData = await getEventByInviteCode(inviteCode)
      if (!eventData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user.id ?? null
      setUserId(uid)

      const [attendeeData, hostData, countData] = await Promise.all([
        getEventAttendees(eventData.id),
        getEventHost(eventData.id),
        getRsvpCountsByStatus(eventData.id),
      ])
      const rsvp = uid ? await getMyRsvpStatus(eventData.id, uid) : null

      setEvent(eventData)
      setAttendees(attendeeData)
      setHost(hostData)
      setCounts(countData)
      setRsvpStatus(rsvp)
      setLoading(false)
    }
    load()
  }, [inviteCode])

  const handleRsvp = async (status: RsvpStatus) => {
    if (!userId) {
      router.push('/login')
      return
    }
    if (!event) return
    setRsvpLoading(true)
    const { error } = await setRsvp(event.id, userId, status)
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

  if (loading) return null

  if (notFound || !event) {
    return (
      <div className='relative w-full min-h-dvh flex items-center justify-center bg-background-main'>
        <span className='text-hint text-sm'>Dieses Event existiert nicht (mehr).</span>
      </div>
    )
  }

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
          <div className='relative flex items-center justify-center'>
            <button
              onClick={() => window.history.length > 1 ? router.back() : router.push('/parties')}
              aria-label='Zurück'
              className='absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border border-glass bg-glass text-body backdrop-blur-xl'
            >
              {BackIcon}
            </button>
            <span className='text-3xl font-bold text-headline'>{event.title}</span>
          </div>

          <div className='mt-2 flex justify-center'>
            <HostRow host={host} />
          </div>

          <div className='flex-1' />

          <div className='flex flex-col items-center'>
            <span className='text-[90px] font-bold leading-none text-headline'>{value}</span>
            <span className='mt-1 text-sm font-light text-headline'>{unit}</span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className='relative z-10 mx-auto w-full max-w-md px-6 pt-6 pb-12 flex flex-col gap-7.5'>

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

        {userId && (
          <PoolsSection eventId={event.id} isHost={false} userId={userId} />
        )}

        <div className='flex flex-col gap-2'>
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

          <AttendeeList attendees={attendees} />
        </div>

        <RsvpButtons
          status={rsvpStatus}
          onGoing={() => handleRsvp('going')}
          onMaybe={() => handleRsvp('maybe')}
          onNotGoing={() => handleRsvp('not_going')}
          loading={rsvpLoading}
        />

        {!userId && (
          <span className='block text-center text-xs text-hint'>
            Melde dich an, um zu- oder abzusagen.
          </span>
        )}

      </div>
    </div>
  )
}
