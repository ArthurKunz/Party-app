'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import Avatar from '@/components/shared/Avatar'
import FloatingEmojis from '@/features/parties/components/FloatingEmojis'
import { getMyProfile, type Profile } from './services/profile.service'

const ChevronIcon = <ChevronRight size={20} strokeWidth={2.5} className='text-subheading' />

// Rows are 50px tall, grouped into rounded translucent cards like iOS settings.
// Radius is half a row's 50px height, so a one-row card is a full pill and the
// two-row card keeps the identical corners without becoming one.
const cardClass = 'w-full rounded-[25px] bg-secondary backdrop-blur-xl overflow-hidden'
const rowClass =
  'flex h-12.5 w-full items-center gap-3 px-4 transition-colors duration-150 active:bg-white/10'
const rowLabelClass = 'text-button text-label-large'
const rowValueClass = 'text-button text-subheading'

export default function ProfileScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      setProfile(await getMyProfile(session.user.id))
      setEmail(session.user.email ?? '')
      setLoading(false)
    })
  }, [router])

  const name = [profile?.firstname, profile?.lastname].filter(Boolean).join(' ') || 'Unbekannt'

  return (
    <div className='relative w-full min-h-dvh bg-main'>
      <FloatingEmojis active={!loading} />

      <div className='relative z-10 flex flex-col items-center px-4 pt-10 pb-safe-nav'>
        {loading ? (
          <>
            <div className='h-31.25 w-31.25 rounded-full skeleton' />
            <div className='mt-4 h-7 w-48 rounded-full skeleton' />
            <div className='mt-2 h-4 w-56 rounded-full skeleton' />
            <div className='mt-12.5 flex w-full flex-col gap-3'>
              {[0, 1].map((i) => (
                <div key={i} className='h-37.5 w-full rounded-[25px] skeleton' />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Only the header animates in: the cards below carry backdrop-blur, and an
                ancestor animating opacity would kill their blur for its duration. */}
            <Avatar
              size={125}
              url={profile?.avatar_url ?? null}
              color={profile?.avatar_color ?? null}
              firstname={profile?.firstname ?? null}
              lastname={profile?.lastname ?? null}
              className='animate-fade-in-up'
            />

            <span className='mt-4 text-heading-3 font-bold text-heading animate-fade-in-up'>{name}</span>
            <span className='text-subheading-1 text-subheading animate-fade-in-up'>{email}</span>

            <div className='mt-12.5 flex w-full flex-col gap-3'>
              {/* Name and Profilbild in one card. Name is edited in place: the value
                  on the right is the input itself. */}
              <div className={cardClass}>
                <Link href='/profile/name' className={rowClass}>
                  <span className='text-xl leading-none'>👤</span>
                  <span className={`${rowLabelClass} shrink-0`}>Name</span>
                  <span className={`ml-auto truncate ${rowValueClass}`}>{name}</span>
                  {ChevronIcon}
                </Link>

                <div className='flex px-4'>
                  {/* Invisible spacer matching the emoji column, so the hairline always
                      starts under the label however the emoji is sized. */}
                  <div className='w-6 shrink-0' />
                  <div className='ml-3 h-[0.75px] flex-1 bg-white/10 backdrop-blur-xl' />
                </div>

                <Link href='/profile/picture' className={rowClass}>
                  <span className='text-xl leading-none'>📸</span>
                  <span className={rowLabelClass}>Profilbild</span>
                  <Avatar
                    size={30}
                    url={profile?.avatar_url ?? null}
                    color={profile?.avatar_color ?? null}
                    firstname={profile?.firstname ?? null}
                    lastname={profile?.lastname ?? null}
                    className='ml-auto'
                  />
                  {ChevronIcon}
                </Link>
              </div>

              <div className={cardClass}>
                <Link href='/profile/password' className={rowClass}>
                  <span className='text-xl leading-none'>🤫</span>
                  <span className={rowLabelClass}>Passwort</span>
                  <span className='ml-auto flex items-center'>{ChevronIcon}</span>
                </Link>

                <div className='flex px-4'>
                  <div className='w-6 shrink-0' />
                  <div className='ml-3 h-[0.75px] flex-1 bg-white/10 backdrop-blur-xl' />
                </div>

                {/* Abmelden and Account löschen live together on their own page, the
                    same way Profilbild does. */}
                <Link href='/profile/account' className={rowClass}>
                  <span className='text-xl leading-none'>⚙️</span>
                  <span className={rowLabelClass}>Account verwalten</span>
                  <span className='ml-auto flex items-center'>{ChevronIcon}</span>
                </Link>

                <div className='flex px-4'>
                  <div className='w-6 shrink-0' />
                  <div className='ml-3 h-[0.75px] flex-1 bg-white/10 backdrop-blur-xl' />
                </div>

                <Link href='/profile/legal' className={rowClass}>
                  <span className='text-xl leading-none'>👨🏻‍⚖️</span>
                  <span className={rowLabelClass}>Rechtliches</span>
                  <span className='ml-auto flex items-center'>{ChevronIcon}</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
