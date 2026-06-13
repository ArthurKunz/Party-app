'use client'

import { useEffect, useState } from 'react'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      setProfile(await getMyProfile(session.user.id))
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
        <div className='flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold text-white'>
          {getInitials(profile?.firstname ?? null, profile?.lastname ?? null)}
        </div>
        <h1 className='mt-4 text-2xl font-bold text-white'>{name}</h1>
        {profile?.birthday && (
          <p className='mt-1 text-sm text-white/50'>{calculateAge(profile.birthday)} Jahre alt</p>
        )}

        <div className='mt-10 w-full max-w-md overflow-hidden rounded-2xl bg-white/5'>
          <button className='flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/5'>
            <span className='flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white'>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <circle cx='12' cy='7' r='4' />
                <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
              </svg>
            </span>
            <span className='text-sm text-white'>Konto verwalten</span>
          </button>

          <div className='mx-4 h-px bg-white/10' />

          <button className='flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/5'>
            <span className='flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white'>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                <polyline points='14 2 14 8 20 8' />
              </svg>
            </span>
            <span className='text-sm text-white'>Rechtliche Informationen</span>
          </button>

          <div className='mx-4 h-px bg-white/10' />

          <button
            onClick={handleSignOut}
            className='flex w-full items-center px-4 py-3.5 text-left text-sm font-medium text-red-500 transition-colors hover:bg-white/5'
          >
            Abmelden
          </button>
        </div>
      </div>
    </div>
  )
}
