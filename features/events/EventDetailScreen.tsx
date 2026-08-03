'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Copy, MoreHorizontal, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getInitials, getOrigin } from '@/lib/utils'
import {
  getEventById,
  getEventAttendees,
  getEventHost,
  getMyRsvpStatus,
  setRsvp,
  deleteRsvp,
  getRsvpCountsByStatus,
} from './services/events.service'
import { getEventPools } from './services/pools.service'
import PoolsSection from './components/PoolsSection'
import AttendeeList from './components/AttendeeList'
import EventMap from './components/EventMap'
import type { EventDetail, Attendee, EventHost, RsvpStatus, Pool } from './types/events.types'

const BackIcon = <ChevronLeft size={24} strokeWidth={3} className='text-white' />

const ChevronRightIcon = <ChevronRight size={24} strokeWidth={3} className='text-heading' />

const CopyIcon = <Copy size={15} strokeWidth={2} className='text-heading' />

const MoreIcon = <MoreHorizontal size={20} strokeWidth={2.5} className='text-heading' />

const TrashIcon = <Trash2 size={20} strokeWidth={2.5} className='text-warning' />

const RSVP_MENU: { status: RsvpStatus; label: string; icon: string }[] = [
  { status: 'going', label: 'zugesagt', icon: '✅' },
  { status: 'maybe', label: 'vielleicht', icon: '🤔' },
  { status: 'not_going', label: 'abgesagt', icon: '❌' },
]

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
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [pools, setPools] = useState<Pool[]>([])
  const [openSections, setOpenSections] = useState({ location: true, polls: true, guests: true })

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))

  useEffect(() => {
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

  const handleCopy = async () => {
    if (!event) return
    await navigator.clipboard.writeText(`${getOrigin()}/e/${event.invite_code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeaveEvent = async () => {
    if (!event || !userId) return
    if (!confirm('Event für dich löschen? Du kannst über den Einladungslink jederzeit wieder beitreten.')) return
    setMenuOpen(false)
    const { error } = await deleteRsvp(event.id, userId)
    if (error) { alert(error.message); return }
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

  const formattedTime = new Date(event.event_date).toLocaleTimeString('de-DE', {
    hour: '2-digit', minute: '2-digit',
  }) + ' Uhr'

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

      <div className='relative w-full h-100 overflow-hidden'>
        {event.background_url ? (
          <img src={event.background_url} alt='' className='absolute inset-0 h-full w-full object-cover' />
        ) : (
          <div className='absolute inset-0 bg-secondary' />
        )}
        <div className='absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-main to-transparent pointer-events-none' />

        <div className='relative z-10 px-4 py-7.5'>
          <div className='relative w-full h-10'>
            <button
              onClick={() => router.push('/parties')}
              aria-label='Zurück'
              className='absolute left-0 top-0 h-11.25 w-11.25 bg-secondary rounded-full flex justify-center items-center backdrop-blur-xs'
            >
              {BackIcon}
            </button>

            {isHost && (
              <button
                onClick={handleCopy}
                aria-label='Link kopieren'
                className='absolute right-0 top-0 h-11.25 w-11.25 bg-secondary rounded-full flex justify-center items-center'
              >
                {copied ? <span className='text-label-1 text-heading'>✓</span> : CopyIcon}
              </button>
            )}

            {!isHost && (
              <div className='absolute right-0 top-0'>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label='Mehr Optionen'
                  className='h-11.25 w-11.25 bg-secondary rounded-full flex justify-center items-center backdrop-blur-xs'
                >
                  {MoreIcon}
                </button>

                {menuOpen && (
                  <>
                    <div className='fixed inset-0 z-10' onClick={() => setMenuOpen(false)} />
                    <div className='absolute right-0 top-13 z-20 w-56.25 rounded-3xl bg-quaternary/50 backdrop-blur-xs p-2 flex flex-col'>
                      {RSVP_MENU.map(({ status, label, icon }) => (
                        <button
                          key={status}
                          type='button'
                          onClick={() => { handleRsvp(status); setMenuOpen(false) }}
                          disabled={rsvpLoading}
                          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-left ${
                            rsvpStatus === status ? 'bg-tertiary' : ''
                          }`}
                        >
                          <span className='w-5 h-5 flex items-center justify-center text-md'>{icon}</span>
                          <span className='text-label-1 text-label-large'>{label}</span>
                        </button>
                      ))}
                      <div className='h-0.25 w-full bg-[#3D3D3D] my-2' />
                      <button
                        type='button'
                        onClick={handleLeaveEvent}
                        className='flex items-center gap-3.25 w-full px-4 py-3'
                      >
                        <span className='w-5 h-5 flex items-center justify-center'>{TrashIcon}</span>
                        <span className='text-label-1 font-semibold text-warning'>Löschen</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
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

        <div className='relative flex flex-col gap-5'>
          <div className='w-full flex flex-col gap-4'>
            <button
              type='button'
              onClick={() => toggleSection('location')}
              className='flex items-center gap-0.5 w-full'
            >
              <span className='text-heading-4 text-heading font-semibold'>Location</span>
              <span className={`transition-transform duration-200 ${openSections.location ? 'rotate-90' : ''}`}>
                {ChevronRightIcon}
              </span>
            </button>
            {openSections.location && (
              <div className='w-full mb-7.5'>
                <EventMap location={event.location} />
                <div className='flex flex-col mt-2'>
                  <span className='truncate font-md text-label-1 text-label-large'>{address}</span>
                  <span className='truncate text-label-2 text-label-small'>{city && `in ${city}`}</span>
                </div>
              </div>
            )}
          </div>

          {pools.length > 0 && (
            <div className='w-full flex flex-col gap-4'>
              <button
                type='button'
                onClick={() => toggleSection('polls')}
                className='flex items-center gap-0.5 w-full'
              >
                <span className='text-heading-4 text-heading font-semibold'>Umfragen</span>
                <span className={`transition-transform duration-200 ${openSections.polls ? 'rotate-90' : ''}`}>
                  {ChevronRightIcon}
                </span>
              </button>
              {openSections.polls && (
                <div className='mb-7.5'>
                  {userId && (
                    <PoolsSection eventId={eventId} isHost={isHost} userId={userId} />
                  )}
                </div>
              )}
            </div>
          )}

          {attendees.length > 0 && (
            <div className='w-full flex flex-col gap-4'>
              <button
                type='button'
                onClick={() => toggleSection('guests')}
                className='flex items-center gap-0.5 w-full'
              >
                <span className='text-heading-4 text-heading font-semibold'>Gäste</span>
                <span className={`transition-transform duration-200 ${openSections.guests ? 'rotate-90' : ''}`}>
                  {ChevronRightIcon}
                </span>
              </button>
              {openSections.guests && <AttendeeList attendees={attendees} />}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
