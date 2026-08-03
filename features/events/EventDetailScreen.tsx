'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronLeft, ChevronRight, Copy, MoreHorizontal, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { alertError, getInitials, getOrigin } from '@/lib/utils'
import { getMyProfile, type Profile } from '@/features/profile/services/profile.service'
import {
  getEventById,
  getEventAttendees,
  getEventHost,
  getMyRsvpStatus,
  setRsvp,
  deleteEvent,
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

const CheckIcon = <Check size={18} strokeWidth={3} className='text-heading' />

const RSVP_MENU: { status: RsvpStatus; label: string; icon: string }[] = [
  { status: 'going', label: 'zugesagt', icon: '✅' },
  { status: 'maybe', label: 'vielleicht', icon: '🤔' },
  { status: 'not_going', label: 'abgesagt', icon: '❌' },
]

const iconButtonClass = 'h-11.25 w-11.25 bg-secondary rounded-full flex justify-center items-center backdrop-blur-xs'

const menuPanelClass =
  'absolute right-0 top-13 z-20 w-56.25 origin-top-right rounded-3xl bg-quaternary/50 backdrop-blur-xs p-2 flex flex-col transition-all duration-150 ease-out'

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className='w-full flex flex-col'>
      <button
        type='button'
        onClick={onToggle}
        aria-expanded={open}
        className='flex items-center gap-0.5 w-full'
      >
        <span className='text-heading-4 text-heading font-semibold'>{title}</span>
        <span className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>
          {ChevronRightIcon}
        </span>
      </button>
      {/* 0fr → 1fr animates to the content's natural height without having to measure it. */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className='overflow-hidden'>
          <div className='pt-4'>{children}</div>
        </div>
      </div>
    </div>
  )
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
  const [copied, setCopied] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [pools, setPools] = useState<Pool[]>([])
  const [myProfile, setMyProfile] = useState<Profile | null>(null)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [openSections, setOpenSections] = useState({ location: true, polls: true, guests: true })

  // One flag per block, so every section clears its own skeleton the moment its data lands.
  const [eventLoading, setEventLoading] = useState(true)
  const [countsLoading, setCountsLoading] = useState(true)
  const [poolsLoading, setPoolsLoading] = useState(true)
  const [attendeesLoading, setAttendeesLoading] = useState(true)

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (!session) { router.push('/login'); return }
      const uid = session.user.id
      setUserId(uid)

      void Promise.all([
        getEventById(eventId),
        getEventHost(eventId),
        getMyRsvpStatus(eventId, uid),
      ]).then(([eventData, hostData, status]) => {
        if (cancelled) return
        if (!eventData) {
          alertError('Dieses Event konnte nicht geladen werden.')
          router.push('/parties')
          return
        }
        setEvent(eventData)
        setHost(hostData)
        setIsHost(eventData.host_id === uid)
        setRsvpStatus(status)
        setEventLoading(false)
      })

      void getRsvpCountsByStatus(eventId).then((data) => {
        if (cancelled) return
        setCounts(data)
        setCountsLoading(false)
      })

      void getEventAttendees(eventId).then((data) => {
        if (cancelled) return
        setAttendees(data)
        setAttendeesLoading(false)
      })

      void getEventPools(eventId).then((data) => {
        if (cancelled) return
        setPools(data)
        setPoolsLoading(false)
      })

      // Needed so my own avatar can be rendered optimistically when I vote in a poll.
      void getMyProfile(uid).then((data) => {
        if (!cancelled) setMyProfile(data)
      })
    })

    return () => { cancelled = true }
  }, [eventId, router])

  const refreshPools = () => {
    void getEventPools(eventId).then(setPools)
  }

  const handleCopy = async () => {
    if (!event) return
    await navigator.clipboard.writeText(`${getOrigin()}/e/${event.invite_code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteEvent = async () => {
    if (!event) return
    if (!confirm('Event wirklich löschen? Das kann nicht rückgängig gemacht werden.')) return
    setMenuOpen(false)
    const { error } = await deleteEvent(event.id)
    if (error) { alertError('Event konnte nicht gelöscht werden.', error.message); return }
    router.push('/parties')
  }

  const handleLeaveEvent = async () => {
    if (!event || !userId) return
    if (!confirm('Event für dich löschen? Du kannst über den Einladungslink jederzeit wieder beitreten.')) return
    setMenuOpen(false)
    const { error } = await deleteRsvp(event.id, userId)
    if (error) { alertError('Du konntest nicht aus dem Event entfernt werden.', error.message); return }
    router.push('/parties')
  }

  const handleRsvp = async (status: RsvpStatus) => {
    if (!event || !userId) return
    setRsvpLoading(true)
    const { error } = await setRsvp(event.id, userId, status)
    if (error) {
      alertError('Deine Antwort konnte nicht gespeichert werden.', error.message)
      setRsvpLoading(false)
      return
    }
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
    // Hold the menu open briefly so the ✓ visibly lands on the row that was tapped.
    setTimeout(() => setMenuOpen(false), 600)
  }

  const statsLoading = eventLoading || countsLoading

  const stats: { label: string; value: string }[] = event
    ? [
        {
          label: 'Datum',
          value: new Date(event.event_date).toLocaleDateString('de-DE', {
            day: '2-digit', month: '2-digit', year: '2-digit',
          }),
        },
        {
          label: 'Uhrzeit',
          value: new Date(event.event_date).toLocaleTimeString('de-DE', {
            hour: '2-digit', minute: '2-digit',
          }) + ' Uhr',
        },
        ...(event.max_guests != null ? [{ label: 'Max. Gäste', value: String(event.max_guests) }] : []),
        { label: 'zugesagt', value: String(counts.going) },
        { label: 'abgesagt', value: String(counts.not_going) },
        { label: 'vielleicht', value: String(counts.maybe) },
      ]
    : []

  const locationCommaIndex = event ? event.location.lastIndexOf(',') : -1
  const address = !event ? '' : locationCommaIndex === -1 ? event.location : event.location.slice(0, locationCommaIndex).trim()
  const city = !event || locationCommaIndex === -1 ? '' : event.location.slice(locationCommaIndex + 1).trim()

  return (
    <div className='relative w-full bg-main'>

      <div className='relative w-full h-100 overflow-hidden'>
        {event?.background_url ? (
          <>
            <img
              src={event.background_url}
              alt=''
              onLoad={() => setHeroLoaded(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                heroLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {!heroLoaded && <div className='absolute inset-0 skeleton' />}
          </>
        ) : eventLoading ? (
          <div className='absolute inset-0 skeleton' />
        ) : (
          <div className='absolute inset-0 bg-secondary' />
        )}
        <div className='absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-main to-transparent pointer-events-none' />

        <div className='relative z-10 px-4 py-7.5'>
          <div className='relative w-full h-10'>
            <button
              onClick={() => router.push('/parties')}
              aria-label='Zurück'
              className={`absolute left-0 top-0 ${iconButtonClass}`}
            >
              {BackIcon}
            </button>

            {/* Role is unknown until the event loads, so hold the spot with a skeleton circle. */}
            {eventLoading && <div className='absolute right-0 top-0 h-11.25 w-11.25 rounded-full skeleton' />}

            {!eventLoading && isHost && (
              <button
                onClick={handleCopy}
                aria-label='Link kopieren'
                className={`absolute right-13.75 top-0 ${iconButtonClass}`}
              >
                {copied ? <span className='text-label-1 text-heading'>✓</span> : CopyIcon}
              </button>
            )}

            {!eventLoading && (
              <div className='absolute right-0 top-0'>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label='Mehr Optionen'
                  aria-expanded={menuOpen}
                  className={iconButtonClass}
                >
                  {MoreIcon}
                </button>

                {menuOpen && <div className='fixed inset-0 z-10' onClick={() => setMenuOpen(false)} />}

                <div
                  aria-hidden={!menuOpen}
                  className={`${menuPanelClass} ${
                    menuOpen ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95'
                  }`}
                >
                  {!isHost && (
                    <>
                      {RSVP_MENU.map(({ status, label, icon }) => (
                        <button
                          key={status}
                          type='button'
                          onClick={() => handleRsvp(status)}
                          disabled={rsvpLoading}
                          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-left ${
                            rsvpStatus === status ? 'bg-tertiary' : ''
                          }`}
                        >
                          <span className='w-5 h-5 flex items-center justify-center text-md'>{icon}</span>
                          <span className='text-label-1 text-label-large'>{label}</span>
                          {rsvpStatus === status && <span className='ml-auto flex items-center'>{CheckIcon}</span>}
                        </button>
                      ))}
                      <div className='h-0.25 w-full bg-[#3D3D3D] my-2' />
                    </>
                  )}
                  <button
                    type='button'
                    onClick={isHost ? handleDeleteEvent : handleLeaveEvent}
                    className='flex items-center gap-3.25 w-full px-4 py-3'
                  >
                    <span className='w-5 h-5 flex items-center justify-center'>{TrashIcon}</span>
                    <span className='text-label-1 font-semibold text-warning'>Löschen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className='relative px-4 pb-7.5 bg-main flex flex-col gap-12.5'>

        <div className='w-full flex flex-col gap-5'>
          {eventLoading ? (
            <div className='w-full flex flex-col gap-3'>
              <div className='w-full flex flex-col gap-2'>
                <div className='h-9 w-3/4 rounded-lg skeleton' />
                <div className='flex items-center gap-2'>
                  <div className='w-6.25 h-6.25 rounded-full skeleton' />
                  <div className='h-3.5 w-32 rounded-full skeleton' />
                </div>
              </div>
              <div className='flex flex-col gap-1.5'>
                <div className='h-3 w-full rounded-full skeleton' />
                <div className='h-3 w-5/6 rounded-full skeleton' />
              </div>
            </div>
          ) : (
            <div className='w-full flex flex-col gap-3'>
              <div className='w-full flex flex-col'>
                <span className='text-heading-1 font-semibold text-heading'>{event?.title}</span>
                <div className='flex items-center gap-2'>
                  <div className='w-6.25 h-6.25 rounded-full overflow-hidden flex items-center justify-center bg-secondary text-white/90 font-bold text-5'>
                    {host?.avatar_url ? (
                      <img src={host.avatar_url} alt='' className='h-full w-full object-cover' />
                    ) : (
                      getInitials(host?.firstname ?? null, host?.lastname ?? null)
                    )}
                  </div>
                  <span className='text-[14px] text-label-large'>
                    {[host?.firstname, host?.lastname].filter(Boolean).join(' ') || 'Unbekannt'}
                  </span>
                </div>
              </div>
              <span className='text-body text-body-1'>{event?.description}</span>
            </div>
          )}

          <div className='w-full h-0.25 bg-[#161616]'/>

          <div className='w-full overflow-x-auto scroll-smooth scrollbar-none [-webkit-overflow-scrolling:touch]'>
            {statsLoading ? (
              <div className='flex w-max gap-6'>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className='flex flex-col gap-1'>
                    <div className='h-3 w-14 rounded-full skeleton' />
                    <div className='h-3.5 w-10 rounded-full skeleton' />
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex w-max gap-6'>
                {stats.map((stat) => (
                  <div key={stat.label} className='flex flex-col gap-1'>
                    <span className='text-label-2 font-medium text-label-small'>{stat.label}</span>
                    <span className='text-label-1 font-semibold text-label-large'>{stat.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='relative flex flex-col gap-5'>
          <Section title='Location' open={openSections.location} onToggle={() => toggleSection('location')}>
            {eventLoading || !event ? (
              <div className='w-full pb-7.5'>
                <div className='h-33 w-full rounded-2xl skeleton' />
                <div className='flex flex-col gap-1.5 mt-2'>
                  <div className='h-3.5 w-48 rounded-full skeleton' />
                  <div className='h-3 w-24 rounded-full skeleton' />
                </div>
              </div>
            ) : (
              <div className='w-full pb-7.5'>
                <EventMap location={event.location} />
                <div className='flex flex-col mt-2'>
                  <span className='truncate font-md text-label-1 text-label-large'>{address}</span>
                  <span className='truncate text-label-2 text-label-small'>{city && `in ${city}`}</span>
                </div>
              </div>
            )}
          </Section>

          {poolsLoading ? (
            <Section title='Umfragen' open={openSections.polls} onToggle={() => toggleSection('polls')}>
              <div className='flex flex-col gap-4 pb-7.5'>
                <div className='h-4 w-2/3 rounded-full skeleton' />
                {[0, 1, 2].map((i) => (
                  <div key={i} className='h-12.5 w-full rounded-full skeleton' />
                ))}
              </div>
            </Section>
          ) : pools.length > 0 && userId ? (
            <Section title='Umfragen' open={openSections.polls} onToggle={() => toggleSection('polls')}>
              <div className='pb-7.5'>
                <PoolsSection
                  pools={pools}
                  userId={userId}
                  myProfile={myProfile}
                  onRefresh={refreshPools}
                />
              </div>
            </Section>
          ) : null}

          {attendeesLoading ? (
            <Section title='Gäste' open={openSections.guests} onToggle={() => toggleSection('guests')}>
              <div className='flex flex-col'>
                {[0, 1, 2].map((i) => (
                  <div key={i} className='flex items-center gap-3 py-3'>
                    <div className='h-12.5 w-12.5 shrink-0 rounded-full skeleton' />
                    <div className='min-w-0 flex-1 flex flex-col gap-1.5'>
                      <div className='h-3.5 w-32 rounded-full skeleton' />
                      <div className='h-3 w-20 rounded-full skeleton' />
                    </div>
                    <div className='h-7.5 w-24 rounded-full skeleton' />
                  </div>
                ))}
              </div>
            </Section>
          ) : attendees.length > 0 ? (
            <Section title='Gäste' open={openSections.guests} onToggle={() => toggleSection('guests')}>
              <AttendeeList attendees={attendees} />
            </Section>
          ) : null}
        </div>

      </div>
    </div>
  )
}
