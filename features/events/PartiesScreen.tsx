'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getHostedEvents, getAttendedEvents } from './services/events.service'
import EventCard from './components/EventCard'
import { getInitials } from '@/lib/utils'
import type { EventWithCount } from './types/events.types'

type Profile = {
  firstname: string | null
  lastname: string | null
  avatar_url: string | null
  avatar_color: string | null
}

type Tab = 'hosting' | 'attending'

const CIRCLES = [
  { color: '#161BFA', radius: 700 },
  { color: '#5684FF', radius: 630 },
  { color: '#AE4FFF', radius: 560 },
  { color: '#A336FF', radius: 490 },
  { color: '#D47AFF', radius: 420 },
  { color: '#E224A1', radius: 350 },
  { color: '#FF0090', radius: 280 },
]

export default function PartiesScreen() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('attending')
  const [hosted, setHosted] = useState<EventWithCount[]>([])
  const [attended, setAttended] = useState<EventWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      const userId = session.user.id
      const [hostedEvents, attendedEvents, profileResult] = await Promise.all([
        getHostedEvents(userId),
        getAttendedEvents(userId),
        supabase.from('profiles').select('firstname, lastname, avatar_url, avatar_color').eq('id', userId).maybeSingle(),
      ])
      setHosted(hostedEvents)
      setAttended(attendedEvents)
      if (profileResult.data) setProfile(profileResult.data as Profile)
      setLoading(false)
    })
  }, [router])

  const currentList = tab === 'hosting' ? hosted : attended
  const emptyMessage =
    tab === 'hosting'
      ? 'Du hostest noch keine Events.'
      : 'Du nimmst noch an keinem Event teil.'

  return (
    <div className='relative w-full min-h-dvh overflow-hidden bg-background-main'>
      <div className='fixed inset-0 overflow-hidden'>
        {CIRCLES.flatMap(({ color, radius }) => {
          const size = radius * 2
          const bottom = -(200 + radius)
          return [
            <div
              key={`L-${color}`}
              className='absolute rounded-full'
              style={{ backgroundColor: color, width: size, height: size, bottom, left: -radius }}
            />,
            <div
              key={`R-${color}`}
              className='absolute rounded-full'
              style={{ backgroundColor: color, width: size, height: size, bottom, right: -radius }}
            />,
          ]
        })}
      </div>

      <div className='fixed inset-0 bg-background-main/10 backdrop-blur-[80px]' />

      <div className='relative z-10 flex flex-col items-center px-6 pt-7.5 pb-safe-nav'>
        <div className='flex w-full items-center justify-between mb-8'>
          <Link href='/create-event' className='h-10 w-10 flex justify-center items-center'>
            <span className='text-4xl font-light text-headline'>+</span>
          </Link>
          <span className='text-3xl font-bold text-headline'>Events</span>
          <div
            className='h-10 w-10 shrink-0 rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold text-body'
            style={{ backgroundColor: profile?.avatar_color ?? '#2A2A2A' }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt='' className='h-full w-full object-cover' />
            ) : (
              getInitials(profile?.firstname ?? null, profile?.lastname ?? null)
            )}
          </div>
        </div>

        <div
          role='tablist'
          className='flex bg-background-secondary border border-border rounded-full p-1 mt-8 w-full h-13'
        >
          {(['attending', 'hosting'] as Tab[]).map((t) => (
            <button
              key={t}
              role='tab'
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-full text-md font-medium transition-colors ${
                tab === t ? 'bg-background-button text-button' : 'text-subheadline'
              }`}
            >
              {t === 'hosting' ? 'Ich hoste' : 'Ich bin Gast'}
            </button>
          ))}
        </div>

        <div className='w-full max-w-md mt-6 flex flex-col gap-6'>
          {loading ? null : currentList.length === 0 ? (
            <span className='mt-8 block text-center text-sm text-hint'>{emptyMessage}</span>
          ) : (
            currentList.map((event) => (
              <Link key={event.id} href={`/parties/${event.id}`} className='block'>
                <EventCard event={event} isHost={tab === 'hosting'} />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
