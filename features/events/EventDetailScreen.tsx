'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { calculateAge, getInitials } from '@/lib/utils'
import { getEventById, getEventAttendees, deleteEvent } from './services/events.service'
import type { EventDetail, Attendee } from './types/events.types'

const CIRCLES = [
  { color: '#161BFA', radius: 700 },
  { color: '#5684FF', radius: 630 },
  { color: '#AE4FFF', radius: 560 },
  { color: '#A336FF', radius: 490 },
  { color: '#D47AFF', radius: 420 },
  { color: '#E224A1', radius: 350 },
  { color: '#FF0090', radius: 280 },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ClockIcon = (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='9' />
    <polyline points='12 7 12 12 15 14' />
  </svg>
)

const CalendarIcon = (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='3' y='4' width='18' height='18' rx='2' />
    <line x1='3' y1='10' x2='21' y2='10' />
    <line x1='8' y1='2' x2='8' y2='6' />
    <line x1='16' y1='2' x2='16' y2='6' />
  </svg>
)

const PinIcon = (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
    <circle cx='12' cy='10' r='3' />
  </svg>
)

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
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      const [eventData, attendeeData] = await Promise.all([
        getEventById(eventId),
        getEventAttendees(eventId),
      ])
      if (!eventData) {
        router.push('/parties')
        return
      }
      setEvent(eventData)
      setAttendees(attendeeData)
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

  if (loading || !event) return null

  return (
    <div className='relative w-screen min-h-screen overflow-hidden bg-[#09090B]'>
      <div className='absolute inset-0 overflow-hidden'>
        {CIRCLES.flatMap(({ color, radius }) => {
          const size = radius * 2
          const bottom = -(200 + radius)
          return [
            <div key={`L-${color}`} className='absolute rounded-full' style={{ backgroundColor: color, width: size, height: size, bottom, left: -radius }} />,
            <div key={`R-${color}`} className='absolute rounded-full' style={{ backgroundColor: color, width: size, height: size, bottom, right: -radius }} />,
          ]
        })}
      </div>

      <div className='absolute inset-0 bg-[#09090B]/10 backdrop-blur-[80px]' />

      <div className='relative z-10 mx-auto w-full max-w-md px-6 py-10'>
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
          <button
            onClick={handleCopy}
            aria-label='Link kopieren'
            className='flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-xl transition-colors hover:bg-white/20'
          >
            {CopyIcon}
          </button>
        </div>

        <h1 className='mt-8 text-center text-3xl font-bold text-white'>{event.title}</h1>

        <div className='mt-8 flex flex-col gap-4 rounded-2xl bg-white/5 p-5'>
          <div className='flex items-center gap-3 text-white/80'>
            <span className='text-white/50'>{ClockIcon}</span>
            <span>{formatTime(event.event_date)} Uhr</span>
          </div>
          <div className='flex items-center gap-3 text-white/80'>
            <span className='text-white/50'>{CalendarIcon}</span>
            <span>{formatDate(event.event_date)}</span>
          </div>
          <div className='flex items-center gap-3 text-white/80'>
            <span className='text-white/50'>{PinIcon}</span>
            <span>{event.location}</span>
          </div>
        </div>

        <div className='mt-8'>
          <h2 className='text-xs font-semibold uppercase tracking-wide text-white/50'>Infos</h2>
          <p className='mt-2 text-sm leading-relaxed text-white/80'>
            {event.description?.trim() || 'Keine Beschreibung vorhanden.'}
          </p>
        </div>

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

        <div className='mt-8'>
          <h2 className='text-xs font-semibold uppercase tracking-wide text-white/50'>
            Teilnehmer ({attendees.length})
          </h2>
          <div className='mt-2 flex flex-col gap-2'>
            {attendees.length === 0 ? (
              <p className='py-4 text-center text-sm text-white/40'>Noch keine Zusagen.</p>
            ) : (
              attendees.map((a) => (
                <div key={a.user_id} className='flex items-center gap-3 rounded-xl bg-white/5 p-3'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white'>
                    {getInitials(a.firstname, a.lastname)}
                  </div>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium text-white'>
                      {[a.firstname, a.lastname].filter(Boolean).join(' ') || 'Unbekannt'}
                    </p>
                    {a.birthday && (
                      <p className='text-xs text-white/50'>{calculateAge(a.birthday)} Jahre</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className='mt-10 flex flex-col gap-3'>
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
        </div>
      </div>
    </div>
  )
}
