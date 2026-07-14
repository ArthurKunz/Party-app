'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { calculateAge, getInitials } from '@/lib/utils'
import { getMyProfile, type Profile } from './services/profile.service'

const CIRCLES = [
  { color: '#161BFA', radius: 700 },
  { color: '#5684FF', radius: 630 },
  { color: '#AE4FFF', radius: 560 },
  { color: '#A336FF', radius: 490 },
  { color: '#D47AFF', radius: 420 },
  { color: '#E224A1', radius: 350 },
  { color: '#FF0090', radius: 280 },
]

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return null

  const name = [profile?.firstname, profile?.lastname].filter(Boolean).join(' ') || 'Unbekannt'

  return (
    <div className='relative w-full min-h-dvh overflow-hidden bg-background-main'>
      <div className='relative z-10 flex flex-col items-center px-4 pt-10 pb-safe-nav'>
        <div
          className='flex h-24 w-24 items-center justify-center rounded-full overflow-hidden border border-border text-2xl font-semibold text-headline'
          style={{ backgroundColor: profile?.avatar_url ? 'transparent' : (profile?.avatar_color ?? '#A336FF') }}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt='Profilbild' className='w-full h-full object-cover' />
          ) : (
            getInitials(profile?.firstname ?? null, profile?.lastname ?? null)
          )}
        </div>
        <span className='mt-4 block text-3xl font-bold text-headline'>{name}</span>
        <span className='text-xs text-hint'>{email}</span>

        <div className='w-full mt-12.5 flex flex-col gap-2.5'>
          <Link href='/profile/name' className='block w-full h-17.5 bg-background-secondary rounded-2xl border border-border px-3 py-3'>
            <div className='w-full h-full flex items-center justify-between'>
              <div className='w-50 h-full flex gap-3 items-center'>
                <div className='h-full aspect-square rounded-full flex justify-center items-center text-3xl'>
                  👤
                </div>
                <div className='flex flex-col'>
                  <span className='text-headline text-md text-semibold'>Name</span>
                  <span className='text-xs text-hint'>{name}</span>
                </div>
              </div>
              <div className='h-7.5 w-7.5 rounded-full flex items-center justify-center'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='text-hint'>
                  <path d='m9 18 6-6-6-6' />
                </svg>
              </div>
            </div>
          </Link>

          <Link href='/profile/age' className='block w-full h-17.5 bg-background-secondary rounded-2xl border border-border px-3 py-3'>
            <div className='w-full h-full flex items-center justify-between'>
              <div className='w-50 h-full flex gap-3 items-center'>
                <div className='h-full aspect-square rounded-full flex justify-center items-center text-3xl'>
                  🎂
                </div>
                <div className='flex flex-col'>
                  <span className='text-headline text-md text-semibold'>Alter</span>
                  <span className='text-xs text-hint'>{profile?.birthday ? `${calculateAge(profile.birthday)} Jahre` : '—'}</span>
                </div>
              </div>
              <div className='h-7.5 w-7.5 rounded-full flex items-center justify-center'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='text-hint'>
                  <path d='m9 18 6-6-6-6' />
                </svg>
              </div>
            </div>
          </Link>

          <Link href='/profile/picture' className='block w-full h-17.5 bg-background-secondary rounded-2xl border border-border px-3 py-3'>
            <div className='w-full h-full flex items-center justify-between'>
              <div className='w-50 h-full flex gap-3 items-center'>
                <div className='h-full aspect-square rounded-full flex justify-center items-center text-3xl'>
                  📸
                </div>
                <span className='text-headline text-md text-semibold'>Profilbild</span>
              </div>
              <div className='h-7.5 w-7.5 rounded-full flex items-center justify-center'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='text-hint'>
                  <path d='m9 18 6-6-6-6' />
                </svg>
              </div>
            </div>
          </Link>

          <Link href='/profile/password' className='block w-full h-17.5 bg-background-secondary rounded-2xl border border-border px-3 py-3'>
            <div className='w-full h-full flex items-center justify-between'>
              <div className='w-50 h-full flex gap-3 items-center'>
                <div className='h-full aspect-square rounded-full flex justify-center items-center text-3xl'>
                  🤫
                </div>
                <span className='text-headline text-md text-semibold'>Passwort</span>
              </div>
              <div className='h-7.5 w-7.5 rounded-full flex items-center justify-center'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='text-hint'>
                  <path d='m9 18 6-6-6-6' />
                </svg>
              </div>
            </div>
          </Link>

          <Link href='/profile/legal' className='block w-full h-17.5 bg-background-secondary rounded-2xl border border-border px-3 py-3'>
            <div className='w-full h-full flex items-center justify-between'>
              <div className='w-50 h-full flex gap-3 items-center'>
                <div className='h-full aspect-square rounded-full flex justify-center items-center text-3xl'>
                  👨🏻‍⚖️
                </div>
                <span className='text-headline text-md text-semibold'>Rechtliches</span>
              </div>
              <div className='h-7.5 w-7.5 rounded-full flex items-center justify-center'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='text-hint'>
                  <path d='m9 18 6-6-6-6' />
                </svg>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}
