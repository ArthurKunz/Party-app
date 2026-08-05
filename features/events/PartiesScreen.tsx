'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { getHostedEvents, getAttendedEvents } from './services/events.service'
import { getMyProfile, type Profile } from '@/features/profile/services/profile.service'
import EventCard from './components/EventCard'
import FloatingEmojis from './components/FloatingEmojis'
import { getInitials } from '@/lib/utils'
import type { EventWithCount } from './types/events.types'

type Tab = 'hosting' | 'attending'

const PlusIcon = <Plus size={24} strokeWidth={3} className='text-white' />

// Same 45px circle as the detail page header; the fill stays bg-secondary because
// there is no hero image behind these to make bg-main/50 readable.
const iconButtonClass =
  'h-11.25 w-11.25 backdrop-blur-xl bg-secondary rounded-full flex justify-center items-center transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'

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

// Both tabs share this: the same card mockup and layout, only the wording differs.
// Either way the one thing a user with no events can do is create their own party
// (V1 has no explore page), so both buttons go to /create-event.
function EmptyState({ title, text, actionLabel }: { title: string; text: string; actionLabel: string }) {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-8'>
      {/* The card mockup, scaled to 0.75 of its original size — every value
          below is the old one times 0.75, so the proportions are unchanged. */}
      <div className='relative h-27 w-48'>
        <div className='absolute left-0 top-0 h-21 w-21 rounded-xl backdrop-blur-xl bg-tertiary' />
        <div className='absolute left-12.5 top-8 h-18 w-36 rounded-xl backdrop-blur-xl bg-secondary' />
        <div className='absolute left-0 top-24 flex flex-col gap-1'>
          <div className='h-1.5 w-10.5 rounded-full bg-white/80 backdrop-blur-xl' />
          <div className='h-1.5 w-7.5 rounded-full bg-white/30 backdrop-blur-xl' />
        </div>
        <div className='absolute left-14 top-27.5 flex flex-col gap-1'>
          <div className='h-1.5 w-18 rounded-full bg-white/80 backdrop-blur-xl' />
          <div className='h-1.5 w-10.5 rounded-full bg-white/30 backdrop-blur-xl' />
        </div>
      </div>

      <div className='flex w-75 flex-col items-center gap-1 px-4 text-center'>
        <span className='font-semibold text-heading-4 text-heading'>{title}</span>
        <span className='text-label-2 text-subheading'>{text}</span>
      </div>

      {/* bg-sheet/text-sheet-heading are the app's white-surface pair, so the
          button needs no new tokens. */}
      <Link
        href='/create-event'
        className='flex h-12.5 items-center gap-2 rounded-full bg-sheet px-6 text-button font-semibold text-sheet-heading transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'
      >
        <Plus size={20} strokeWidth={3} />
        {actionLabel}
      </Link>
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

  // The empty state must NOT run the enter animation: its mockup boxes use
  // backdrop-blur, and an animating ancestor (opacity or transform) renders the whole
  // subtree into its own compositing group, which has no page backdrop to sample — so
  // the blur only appeared once the animation had finished. Skeletons and cards carry
  // no backdrop-filter, so they keep the animation.
  const showEmptyState = !loading && currentList.length === 0

  return (
    <div className='relative w-full min-h-dvh bg-main'>
      <FloatingEmojis active={!loading} />

      {/* min-h-dvh gives the list block below something to grow into, so an empty
          state can centre itself in the space left under the tabs. */}
      <div className='relative z-10 flex min-h-dvh flex-col items-center gap-10 px-4 pt-7.5 pb-safe-nav'>
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
          <div role='tablist' className='relative flex w-full h-12.5 rounded-full bg-secondary p-1 backdrop-blur-xl'>
            <div
              aria-hidden='true'
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white/25 backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
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
        <div
          key={loading ? 'loading' : tab}
          className={`w-full max-w-md flex flex-1 flex-col gap-4 ${showEmptyState ? '' : 'animate-fade-in-up'}`}
        >
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
              <EmptyState
                title='Party schmeißen?'
                text='Erstelle eine Party, lade Freunde ein und schaffe eine unvergessliche Zeit'
                actionLabel='Party erstellen'
              />
            ) : (
              <EmptyState
                title='Noch keine Einladung?'
                text='Sobald dich jemand einlädt, findest du die Party hier. Oder starte einfach selbst eine'
                actionLabel='Party erstellen'
              />
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
