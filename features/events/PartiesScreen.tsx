'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getHostedEvents, getAttendedEvents } from './services/events.service'
import EventCard from './components/EventCard'
import type { EventWithCount } from './types/events.types'

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
  const [tab, setTab] = useState<Tab>('hosting')
  const [hosted, setHosted] = useState<EventWithCount[]>([])
  const [attended, setAttended] = useState<EventWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      const userId = session.user.id
      const [hostedEvents, attendedEvents] = await Promise.all([
        getHostedEvents(userId),
        getAttendedEvents(userId),
      ])
      setHosted(hostedEvents)
      setAttended(attendedEvents)
      setLoading(false)
    })
  }, [router])

  const currentList = tab === 'hosting' ? hosted : attended
  const emptyMessage =
    tab === 'hosting'
      ? 'Du hostest noch keine Events.'
      : 'Du nimmst noch an keinem Event teil.'

  return (
    <div className='relative w-screen min-h-screen overflow-hidden bg-[#09090B]'>
      <div className='absolute inset-0 overflow-hidden'>
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

      <div className='absolute inset-0 bg-[#09090B]/10 backdrop-blur-[80px]' />

      <div className='relative z-10 flex flex-col items-center px-6 py-16'>
        <h1 className='text-white text-3xl font-bold text-center'>Meine Events</h1>
        <p className='text-white/50 text-sm mt-2 text-center'>Wo du Gast oder Gastgeber bist</p>

        <div
          role='tablist'
          className='flex bg-white/10 rounded-full p-1 mt-8 w-72'
        >
          {(['hosting', 'attending'] as Tab[]).map((t) => (
            <button
              key={t}
              role='tab'
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === t ? 'bg-white text-[#09090B]' : 'text-white/60'
              }`}
            >
              {t === 'hosting' ? 'Ich hoste' : 'Ich bin Gast'}
            </button>
          ))}
        </div>

        <div className='w-full max-w-md mt-6 flex flex-col gap-3'>
          {loading ? null : currentList.length === 0 ? (
            <p className='text-white/40 text-sm text-center mt-8'>{emptyMessage}</p>
          ) : tab === 'hosting' ? (
            currentList.map((event) => (
              <Link key={event.id} href={`/parties/${event.id}`} className='block'>
                <EventCard event={event} />
              </Link>
            ))
          ) : (
            currentList.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </div>
      </div>
    </div>
  )
}
