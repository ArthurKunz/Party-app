'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const BackIcon = (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='19' y1='12' x2='5' y2='12' />
    <polyline points='12 19 5 12 12 5' />
  </svg>
)

export default function LegalScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      setLoading(false)
    })
  }, [router])

  if (loading) return null

  return (
    <div className='relative w-full min-h-dvh overflow-hidden bg-background-main'>
      <div className='relative z-10 flex flex-col px-6 pt-7.5 pb-12'>
        <div className='relative flex items-center justify-center'>
          <button
            onClick={() => router.push('/profile')}
            aria-label='Zurück'
            className='absolute left-0 flex h-11 w-11 items-center justify-center rounded-full text-headline'
          >
            {BackIcon}
          </button>
          <span className='text-2xl font-bold text-headline'>Rechtliches</span>
        </div>

        <p className='mt-10 text-sm text-hint'>
          Impressum und Datenschutzerklärung folgen in Kürze.
        </p>
      </div>
    </div>
  )
}
