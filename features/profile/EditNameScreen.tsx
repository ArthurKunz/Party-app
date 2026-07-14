'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getMyProfile, updateProfileName } from './services/profile.service'

const BackIcon = (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='19' y1='12' x2='5' y2='12' />
    <polyline points='12 19 5 12 12 5' />
  </svg>
)

export default function EditNameScreen() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const lastnameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      const profile = await getMyProfile(session.user.id)
      setUserId(session.user.id)
      setFirstname(profile?.firstname ?? '')
      setLastname(profile?.lastname ?? '')
      setLoading(false)
    })
  }, [router])

  const handleFirstnameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    lastnameRef.current?.focus()
  }

  const handleSave = async () => {
    if (!userId) return
    const trimmedFirstname = firstname.trim()
    const trimmedLastname = lastname.trim()
    if (!trimmedFirstname || !trimmedLastname) return

    setSaving(true)
    const { error } = await updateProfileName(userId, trimmedFirstname, trimmedLastname)
    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }
    router.push('/profile')
  }

  if (loading) return null

  const canSave = firstname.trim().length > 0 && lastname.trim().length > 0

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
          <span className='text-2xl font-bold text-headline'>Name</span>
        </div>

        <div className='mt-10 flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label className='text-sm text-label'>Vorname</label>
            <input
              type='text'
              placeholder='Vorname'
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              onKeyDown={handleFirstnameKeyDown}
              className='w-full px-4 h-14 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label className='text-sm text-label'>Nachname</label>
            <input
              ref={lastnameRef}
              type='text'
              placeholder='Nachname'
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className='w-full px-4 h-14 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'
            />
          </div>
        </div>

        <button
          onClick={() => void handleSave()}
          disabled={!canSave || saving}
          className='mt-10 w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold disabled:opacity-40'
        >
          {saving ? 'Speichert…' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}
