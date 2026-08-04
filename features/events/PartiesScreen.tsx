'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getHostedEvents, getAttendedEvents } from './services/events.service'
import { getMyProfile, type Profile } from '@/features/profile/services/profile.service'
import EventCard from './components/EventCard'
import { getInitials } from '@/lib/utils'
import type { EventWithCount } from './types/events.types'

type Tab = 'hosting' | 'attending'

const PlusIcon = <Plus size={24} strokeWidth={3} className='text-white' />

// Same 45px circle as the detail page header; the fill stays bg-secondary because
// there is no hero image behind these to make bg-main/50 readable.
const iconButtonClass =
  'h-11.25 w-11.25 bg-secondary rounded-full flex justify-center items-center transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'

// One card placeholder, shaped exactly like the real card it replaces.
function CardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div className='flex flex-col gap-2 pb-1.5'>
      <div className={`w-full rounded-lg skeleton ${featured ? 'aspect-[2/1]' : 'aspect-square'}`} />
      <div className='flex flex-col gap-1.5'>
        <div className='h-3.5 w-2/3 rounded-full skeleton' />
        <div className='h-3 w-1/3 rounded-full skeleton' />
      </div>
    </div>
  )
}

export default function PartiesScreen() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('attending')
  const [hosted, setHosted] = useState<EventWithCount[]>([])
  const [attended, setAttended] = useState<EventWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      const userId = session.user.id

      // The avatar clears its own skeleton as soon as the profile lands, like the
      // detail page's per-block loading flags.
      void getMyProfile(userId).then((myProfile) => {
        setProfile(myProfile)
        setProfileLoading(false)
      })

      const [hostedEvents, attendedEvents] = await Promise.all([
        getHostedEvents(userId),
        getAttendedEvents(userId),
      ])
      setHosted(hostedEvents)
      setAttended(attendedEvents)
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
    <div className='relative w-full min-h-dvh bg-main'>
      <div className='relative z-10 flex flex-col items-center gap-10 px-4 pt-7.5 pb-safe-nav'>
        <div className='w-full flex flex-col gap-6'>
          <div className='flex w-full items-center justify-between'>
            <Link href='/create-event' aria-label='Event erstellen' className={iconButtonClass}>
              {PlusIcon}
            </Link>
            <span className='font-bold text-heading-2 text-heading'>Events</span>
            {profileLoading ? (
              <div className='h-11.25 w-11.25 rounded-full skeleton' />
            ) : (
              <Link
                href='/profile'
                aria-label='Profil'
                className={`${iconButtonClass} overflow-hidden text-white/90 font-bold text-5`}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt='' className='h-full w-full object-cover' />
                ) : (
                  getInitials(profile?.firstname ?? null, profile?.lastname ?? null)
                )}
              </Link>
            )}
          </div>

          {/* The highlight is one element that slides, instead of a background
              jumping between the two buttons. */}
          <div role='tablist' className='relative flex w-full h-12.5 rounded-full bg-secondary p-1'>
            <div
              aria-hidden='true'
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white/25 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                tab === 'hosting' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            {(['attending', 'hosting'] as Tab[]).map((t) => (
              <button
                key={t}
                role='tab'
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className='relative z-10 flex-1 rounded-full py-2 text-button font-medium text-white/90'
              >
                {t === 'hosting' ? 'Gastgeber' : 'Gast'}
              </button>
            ))}
          </div>
        </div>

        {/* Keyed so the block replays its enter animation both when the real cards
            replace the skeletons and on every tab switch. */}
        <div key={loading ? 'loading' : tab} className='w-full max-w-md flex flex-col gap-4 animate-fade-in-up'>
          {loading ? (
            <>
              <CardSkeleton featured />
              <div className='grid grid-cols-2 gap-3'>
                {[0, 1, 2, 3].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </>
          ) : currentList.length === 0 ? (
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

                {/* Hand-drawn illustration, deliberately not a lucide icon: it has to
                    curve down onto the + in the bottom nav. */}
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
