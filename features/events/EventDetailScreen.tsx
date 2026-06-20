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
} from './services/events.service'
import EventBackground from './components/EventBackground'
import EventInfoCard from './components/EventInfoCard'
import AttendeeList from './components/AttendeeList'
import HostRow from './components/HostRow'
import RsvpButtons from './components/RsvpButtons'
import PoolsSection from './components/PoolsSection'
import type { EventDetail, Attendee, EventHost, RsvpStatus } from './types/events.types'

const CopyIcon = (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='9' y='9' width='13' height='13' rx='2' />
    <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
  </svg>
)

export default function EventDetailScreen({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [host, setHost] = useState<EventHost | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      const uid = session.user.id
      setUserId(uid)
      const [eventData, attendeeData, hostData, status] = await Promise.all([
        getEventById(eventId),
        getEventAttendees(eventId),
        getEventHost(eventId),
        getMyRsvpStatus(eventId, uid),
      ])
      if (!eventData) {
        router.push('/parties')
        return
      }
      setEvent(eventData)
      setAttendees(attendeeData)
      setHost(hostData)
      setIsHost(eventData.host_id === uid)
      setRsvpStatus(status)
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
    if (error) {
      alert(error.message)
      setDeleting(false)
      return
    }
    router.push('/parties')
  }

  const handleRsvp = async (status: RsvpStatus) => {
    if (!event) return
    setRsvpLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    const { error } = await setRsvp(event.id, session.user.id, status)
    if (error) {
      alert(error.message)
      setRsvpLoading(false)
      return
    }
    setRsvpStatus(status)
    setRsvpLoading(false)
  }

  if (loading || !event) return null

  const day = new Date(event.event_date).toLocaleDateString('de-DE', { day: 'numeric' })
  const month = new Date(event.event_date).toLocaleDateString('de-DE', { month: 'short' }).replace('.', '')

  return (
    <EventBackground>
      <div className='flex items-center justify-between'>
        <button
          onClick={() => router.push('/parties')}
          aria-label='Zurück'
          className='flex h-11 w-11 items-center justify-center rounded-full border border-glass bg-glass text-body backdrop-blur-xl'
        >
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <line x1='19' y1='12' x2='5' y2='12' />
            <polyline points='12 19 5 12 12 5' />
          </svg>
        </button>
        {isHost && (
          <button
            onClick={handleCopy}
            aria-label='Link kopieren'
            className='flex h-11 w-11 items-center justify-center rounded-full border border-glass bg-glass text-body backdrop-blur-xl'
          >
            {CopyIcon}
          </button>
        )}
      </div>

      <div className='relative mt-6 overflow-hidden rounded-3xl border border-border bg-background-secondary'>
        <div className={`h-28 w-full bg-gradient-to-br ${eventCoverGradient(event.id)}`} />
        <div className='px-5 pb-5'>
          <div className='-mt-8 mb-4 flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-background-button shadow-lg'>
            <span className='text-xl font-bold leading-none text-button'>{day}</span>
            <span className='text-[10px] font-semibold uppercase leading-none text-button/70'>{month}</span>
          </div>
          <span className='block text-2xl font-bold text-headline'>{event.title}</span>
          {!isHost && <HostRow host={host} />}
        </div>
      </div>

      <div className='mt-6'>
        <EventInfoCard eventDate={event.event_date} location={event.location} />
      </div>

      <div className='mt-6 rounded-2xl border border-border bg-background-secondary p-5'>
        <span className='block text-xs font-semibold uppercase tracking-wide text-label'>Infos</span>
        <span className='mt-2 block text-sm leading-relaxed text-hint'>
          {event.description?.trim() || 'Keine Beschreibung vorhanden.'}
        </span>
      </div>

      {isHost && (
        <div className='mt-6'>
          <span className='block text-xs font-semibold uppercase tracking-wide text-label'>Einladungslink</span>
          <button
            onClick={handleCopy}
            className='mt-2 flex h-14 w-full items-center justify-between gap-3 rounded-xl border border-border-input bg-background-input px-4 text-sm text-input'
          >
            <span className='flex items-center gap-3 truncate'>
              <span className='shrink-0 text-background-icon'>{CopyIcon}</span>
              <span className='truncate'>{shareLink}</span>
            </span>
            <span className='shrink-0 text-subheadline'>{copied ? 'Kopiert ✓' : 'Kopieren'}</span>
          </button>
        </div>
      )}

      <div className='mt-6'>
        <AttendeeList attendees={attendees} />
      </div>

      {userId && (
        <div className='mt-6'>
          <PoolsSection eventId={eventId} isHost={isHost} userId={userId} />
        </div>
      )}

      <div className='mt-10 flex flex-col gap-3'>
        {isHost ? (
          <>
            <button
              type='button'
              className='w-full rounded-full bg-background-button py-3 font-semibold text-button'
            >
              Bearbeiten
            </button>
            <button
              type='button'
              onClick={handleDelete}
              disabled={deleting}
              className='w-full rounded-full bg-warning py-3 font-semibold text-body disabled:opacity-50'
            >
              {deleting ? 'Wird gelöscht…' : 'Event löschen'}
            </button>
          </>
        ) : (
          <RsvpButtons
            status={rsvpStatus}
            onGoing={() => handleRsvp('going')}
            onNotGoing={() => handleRsvp('not_going')}
            loading={rsvpLoading}
          />
        )}
      </div>
    </EventBackground>
  )
}
