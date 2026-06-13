'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getEventByInviteCode, getEventAttendees, getEventHost } from './services/events.service'
import EventBackground from './components/EventBackground'
import EventInfoCard from './components/EventInfoCard'
import AttendeeList from './components/AttendeeList'
import HostRow from './components/HostRow'
import RsvpButtons from './components/RsvpButtons'
import type { EventDetail, Attendee, EventHost } from './types/events.types'

export default function InviteScreen({ inviteCode }: { inviteCode: string }) {
  const router = useRouter()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [host, setHost] = useState<EventHost | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getEventByInviteCode(inviteCode).then(async (eventData) => {
      if (!eventData) {
        setNotFound(true)
        setLoading(false)
        return
      }
      // Signed-in users manage their RSVP on the canonical /parties/[id] page
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace(`/parties/${eventData.id}`)
        return
      }
      const [attendeeData, hostData] = await Promise.all([
        getEventAttendees(eventData.id),
        getEventHost(eventData.id),
      ])
      setEvent(eventData)
      setAttendees(attendeeData)
      setHost(hostData)
      setLoading(false)
    })
  }, [inviteCode, router])

  if (loading) return null

  if (notFound || !event) {
    return (
      <EventBackground>
        <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center'>
          <p className='text-white/70'>Dieses Event existiert nicht (mehr).</p>
        </div>
      </EventBackground>
    )
  }

  // Anonymous visitor: send them to sign up / log in to RSVP.
  const handleAnonRsvp = () => {
    router.push('/login')
  }

  return (
    <EventBackground>
      <h1 className='text-center text-3xl font-bold text-white'>{event.title}</h1>
      <HostRow host={host} />

      <div className='mt-8'>
        <EventInfoCard eventDate={event.event_date} location={event.location} />
      </div>

      <div className='mt-8'>
        <h2 className='text-xs font-semibold uppercase tracking-wide text-white/50'>Infos</h2>
        <p className='mt-2 text-sm leading-relaxed text-white/80'>
          {event.description?.trim() || 'Keine Beschreibung vorhanden.'}
        </p>
      </div>

      <div className='mt-8'>
        <AttendeeList attendees={attendees} />
      </div>

      <div className='mt-10'>
        <RsvpButtons
          status={null}
          onGoing={handleAnonRsvp}
          onNotGoing={handleAnonRsvp}
        />
        <p className='mt-3 text-center text-xs text-white/40'>
          Melde dich an, um zu- oder abzusagen.
        </p>
      </div>
    </EventBackground>
  )
}
