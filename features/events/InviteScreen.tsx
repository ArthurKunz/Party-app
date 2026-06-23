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
          <span className='block text-hint'>Dieses Event existiert nicht (mehr).</span>
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
      <span className='block text-center text-3xl font-bold text-headline'>{event.title}</span>
      <HostRow host={host} />

      <div className='mt-8'>
        <EventInfoCard eventDate={event.event_date} location={event.location} />
      </div>

      <div className='mt-8'>
        <span className='block text-xs font-semibold uppercase tracking-wide text-label'>Infos</span>
        <span className='mt-2 block text-center text-sm leading-relaxed text-hint'>
          {event.description?.trim() || 'Keine Beschreibung vorhanden.'}
        </span>
      </div>

      <div className='mt-8'>
        <AttendeeList attendees={attendees} />
      </div>

      <div className='mt-10'>
        <RsvpButtons
          status={null}
          onGoing={handleAnonRsvp}
          onMaybe={handleAnonRsvp}
          onNotGoing={handleAnonRsvp}
        />
        <span className='mt-3 block text-center text-xs text-hint'>
          Melde dich an, um zu- oder abzusagen.
        </span>
      </div>
    </EventBackground>
  )
}
