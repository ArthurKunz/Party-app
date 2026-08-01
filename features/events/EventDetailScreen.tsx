'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import {
  getEventById,
  getEventAttendees,
  getEventHost,
  getMyRsvpStatus,
  setRsvp,
  deleteEvent,
  getRsvpCountsByStatus,
} from './services/events.service'
import { getEventPools } from './services/pools.service'
import HostRow from './components/HostRow'
import RsvpButtons from './components/RsvpButtons'
import PoolsSection from './components/PoolsSection'
import AttendeeList from './components/AttendeeList'
import EventMap from './components/EventMap'
import type { EventDetail, Attendee, EventHost, RsvpStatus, Pool } from './types/events.types'

const BackIcon = (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' className='text-white'>
    <polyline points='9 6 15 12 9 18' transform='rotate(180 12 12)' />
  </svg>
)

const ChevronRightIcon = (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' className='text-heading'>
    <polyline points='9 6 15 12 9 18' />
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
  const [pools, setPools] = useState<Pool[]>([])

  useEffect(() => {
    setOrigin(window.location.origin)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const uid = session.user.id
      setUserId(uid)
      const [eventData, attendeeData, hostData, status, countData, poolData] = await Promise.all([
        getEventById(eventId),
        getEventAttendees(eventId),
        getEventHost(eventId),
        getMyRsvpStatus(eventId, uid),
        getRsvpCountsByStatus(eventId),
        getEventPools(eventId),
      ])
      if (!eventData) { router.push('/parties'); return }
      setEvent(eventData)
      setAttendees(attendeeData)
      setHost(hostData)
      setIsHost(eventData.host_id === uid)
      setRsvpStatus(status)
      setCounts(countData)
      setPools(poolData)
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

  const shortDate = new Date(event.event_date).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  })

  const stats: { label: string; value: string }[] = [
    { label: 'Datum', value: shortDate },
    { label: 'Uhrzeit', value: formattedTime },
    ...(event.max_guests != null ? [{ label: 'Max. Gäste', value: String(event.max_guests) }] : []),
    { label: 'zugesagt', value: String(counts.going) },
    { label: 'abgesagt', value: String(counts.not_going) },
    { label: 'vielleicht', value: String(counts.maybe) },
  ]

  const locationCommaIndex = event.location.lastIndexOf(',')
  const address = locationCommaIndex === -1 ? event.location : event.location.slice(0, locationCommaIndex).trim()
  const city = locationCommaIndex === -1 ? '' : event.location.slice(locationCommaIndex + 1).trim()

  return (
    <div className='relative w-full bg-white'>

      <div className='px-4 py-7.5 relative w-full h-100 bg-green-500'>
        <div className='relative w-full bg-blue-500 h-10'>
          <button
            onClick={() => router.push('/parties')}
            aria-label='Zurück'
            className='absolute left-0 top-0 h-11.25 w-11.25 bg-secondary rounded-full flex justify-center items-center'
          >
            {BackIcon}
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className='relative px-4 pb-7.5 bg-main flex flex-col gap-12.5'>

        <div className='w-full flex flex-col gap-5'>
          <div className='w-full flex flex-col gap-3'>
            <div className='w-full flex flex-col'>
              <span className='text-heading-1 font-semibold text-heading'>{event.title}</span>
              <div className='flex items-center gap-2'>
                <div className='w-6.25 h-6.25 rounded-full overflow-hidden flex items-center justify-center bg-secondary text-white/90 font-bold text-5'>
                  {host?.avatar_url ? (
                    <img src={host.avatar_url} alt='' className='h-full w-full object-cover' />
                  ) : (
                    getInitials(host?.firstname ?? null, host?.lastname ?? null)
                  )}
                </div>
                <span className='text-[14px] text-label-large'>{`${host?.firstname ?? null} ${host?.lastname ?? null}`}</span>
              </div>
            </div>
            <span className='text-body text-body-1'>{event?.description}</span>
          </div>

          <div className='w-full h-0.25 bg-[#161616]'/>

          <div className='w-full overflow-x-auto scroll-smooth scrollbar-none [-webkit-overflow-scrolling:touch]'>
            <div className='flex w-max gap-6'>
              {stats.map((stat) => (
                <div key={stat.label} className='flex flex-col gap-1'>
                  <span className='text-label-2 font-medium text-label-small'>{stat.label}</span>
                  <span className='text-label-1 font-semibold text-label-large'>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='w-full flex flex-col gap-4'>
          <div className='flex items-center gap-0.5'>
            <span className='text-heading-4 text-heading font-semibold'>Location</span>
            {ChevronRightIcon}
          </div>
          <div className='w-full '>
            <EventMap location={event.location} />
            <div className='flex flex-col mt-2'>
              <span className='truncate font-md text-label-1 text-label-large'>{address}</span>
              <span className='truncate text-label-2 text-label-small'>{city && `in ${city}`}</span>
            </div>
          </div>
        </div>

        {pools.length > 0 && (
          <div className='w-full flex flex-col gap-4'>
            <div className='flex items-center gap-0.5'>
              <span className='text-heading-4 text-heading font-semibold'>Umfragen</span>
              {ChevronRightIcon}
            </div>
            <div>
              {userId && (
                <PoolsSection eventId={eventId} isHost={isHost} userId={userId} />
              )}
            </div>
          </div>
        )}

        {attendees.length > 0 && (
          <div className='w-full flex flex-col gap-4'>
            <div className='flex items-center gap-0.5'>
              <span className='text-heading-4 text-heading font-semibold'>Gäste</span>
              {ChevronRightIcon}
            </div>
            <AttendeeList attendees={attendees} />
          </div>
        )}

      </div>
    </div>
  )
}
