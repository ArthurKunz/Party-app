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

  const currentList = [...(tab === 'hosting' ? hosted : attended)].sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  )
  const emptyMessage =
    tab === 'hosting'
      ? 'Du hostest noch keine Events.'
      : 'Du nimmst noch an keinem Event teil.'

  return (
    <div className='relative w-full min-h-dvh bg-background-main'>
      <div className='relative z-10 flex flex-col items-center gap-10 px-4 pt-7.5 pb-safe-nav'>
        <div className='w-full flex flex-col gap-6'>
          <div className='flex w-full items-center justify-between'>
            <Link href='/create-event' className='h-11.25 w-11.25 bg-secondary rounded-full flex justify-center items-center'>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='4' strokeLinecap='round' className='text-white'>
                <line x1='12' y1='6' x2='12' y2='18' />
                <line x1='6' y1='12' x2='18' y2='12' />
              </svg>
            </Link>
            <span className='font-bold text-heading-2 text-heading'>Events</span>
            <Link
              href='/profile'
              className='h-11.25 w-11.25 rounded-full overflow-hidden flex items-center justify-center bg-secondary text-white/90 font-bold text-5'
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt='' className='h-full w-full object-cover' />
              ) : (
                getInitials(profile?.firstname ?? null, profile?.lastname ?? null)
              )}
            </Link>
          </div>

          <div
            role='tablist'
            className='flex bg-secondary rounded-full p-1 w-full h-12.5'
          >
            {(['attending', 'hosting'] as Tab[]).map((t) => (
              <button
                key={t}
                role='tab'
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-full text-button font-medium transition-colors text-white/90 ${
                  tab === t ? 'bg-white/25 ' : ''
                }`}
              >
                {t === 'hosting' ? 'Gastgeber' : 'Gast'}
              </button>
            ))}
          </div>
        </div>

        <div className='w-full max-w-md flex flex-col gap-4'>
          {loading ? null : currentList.length === 0 ? (
            tab === 'hosting' ? (
              <div className='mt-6 flex flex-col items-center gap-8'>
                <div className='relative h-36 w-64'>
                  <div className='absolute left-0 top-0 h-28 w-28 rounded-2xl bg-tertiary' />
                  <div className='absolute left-14 top-8 h-24 w-48 rounded-2xl bg-secondary' />
                  <div className='absolute left-0 top-32 flex flex-col gap-1.5'>
                    <div className='h-2 w-14 rounded-full bg-white/80' />
                    <div className='h-2 w-10 rounded-full bg-white/30' />
                  </div>
                  <div className='absolute left-16 top-[8.5rem] flex flex-col gap-1.5'>
                    <div className='h-2 w-24 rounded-full bg-white/80' />
                    <div className='h-2 w-14 rounded-full bg-white/30' />
                  </div>
                </div>

                <div className='flex w-full flex-col items-center gap-2 px-4 text-center'>
                  <span className='font-bold text-heading-4 text-heading'>
                    Starte jetzt mit &ldquo;{profile?.firstname || 'dir'}&rdquo;
                  </span>
                  <span className='text-subheading-1 text-subheading'>
                    Erstelle eine Party, lade Freunde ein und schaffe eine unvergessliche Zeit
                  </span>
                </div>

                <svg width='130' height='130' viewBox='0 0 200 200' fill='none' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' className='text-arrow'>
                  <path d='M62,12 C32,28 30,62 52,82 C80,105 125,98 138,125 C148,145 100,155 100,165 L100,193' />
                  <path d='M100,193 L89,180 M100,193 L111,180' />
                </svg>
              </div>
            ) : (
              <span className='mt-8 block text-center text-body-1 text-body'>{emptyMessage}</span>
            )
          ) : (
            <>
              <Link href={`/parties/${currentList[0].id}`} className='block'>
                <EventCard event={currentList[0]} isHost={tab === 'hosting'} featured />
              </Link>

              {currentList.length > 1 && (
                <div className='grid grid-cols-2 gap-3'>
                  {currentList.slice(1).map((event) => (
                    <Link key={event.id} href={`/parties/${event.id}`} className='block'>
                      <EventCard event={event} isHost={tab === 'hosting'} />
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
