'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
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
      const userId = session.user.id
      const [eventData, attendeeData, hostData, status] = await Promise.all([
        getEventById(eventId),
        getEventAttendees(eventId),
        getEventHost(eventId),
        getMyRsvpStatus(eventId, userId),
      ])
      if (!eventData) {
        router.push('/parties')
        return
      }
      setEvent(eventData)
      setAttendees(attendeeData)
      setHost(hostData)
      setIsHost(eventData.host_id === userId)
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

  return (
    <EventBackground>
      <div className='flex items-center justify-between'>
        <button
          onClick={() => router.push('/parties')}
          aria-label='Zurück'
          className='flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-xl transition-colors hover:bg-white/20'
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
            className='flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-xl transition-colors hover:bg-white/20'
          >
            {CopyIcon}
          </button>
        )}
      </div>

      <h1 className='mt-8 text-center text-3xl font-bold text-white'>{event.title}</h1>
      {!isHost && <HostRow host={host} />}

      <div className='mt-8'>
        <EventInfoCard eventDate={event.event_date} location={event.location} />
      </div>

      <div className='mt-8'>
        <h2 className='text-xs font-semibold uppercase tracking-wide text-white/50'>Infos</h2>
        <p className='mt-2 text-sm leading-relaxed text-white/80'>
          {event.description?.trim() || 'Keine Beschreibung vorhanden.'}
        </p>
      </div>

      {isHost && (
        <div className='mt-8'>
          <h2 className='text-xs font-semibold uppercase tracking-wide text-white/50'>Einladungslink</h2>
          <div className='mt-2 flex items-center gap-3 rounded-xl bg-white/5 p-3'>
            <button
              onClick={handleCopy}
              aria-label='Link kopieren'
              className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20'
            >
              {CopyIcon}
            </button>
            <span className='flex-1 truncate text-sm text-white/70'>
              {copied ? 'Link kopiert!' : shareLink}
            </span>
          </div>
        </div>
      )}

      <div className='mt-8'>
        <AttendeeList attendees={attendees} />
      </div>

      <div className='mt-10 flex flex-col gap-3'>
        {isHost ? (
          <>
            <button
              type='button'
              className='w-full rounded-full bg-white py-3 font-medium text-[#09090B] transition-colors hover:bg-white/90'
            >
              Bearbeiten
            </button>
            <button
              type='button'
              onClick={handleDelete}
              disabled={deleting}
              className='w-full rounded-full bg-red-600 py-3 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50'
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
