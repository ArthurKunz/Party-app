'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { alertError, sanitizeNextPath } from '@/lib/utils'
import FloatingEmojis from '@/features/parties/components/FloatingEmojis'
import { getSession } from './services/onboarding.service'
import PersonalDataForm from './components/PersonalDataForm'
import BirthdateForm from './components/BirthdateForm'
import ProfilePictureForm from './components/ProfilePictureForm'

type Step = 'name' | 'birthday' | 'picture'

export default function OnboardingScreen() {
  const router = useRouter()
  // Carried over from the auth flow, so a user who started on an invite link
  // lands back on that party once their profile exists.
  const next = sanitizeNextPath(useSearchParams().get('next'))
  const [step, setStep] = useState<Step>('name')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [birthday, setBirthday] = useState('')

  const handleNameDone = (fn: string, ln: string) => {
    setFirstname(fn)
    setLastname(ln)
    setStep('birthday')
  }

  const handleBirthdateDone = (bd: string) => {
    setBirthday(bd)
    setStep('picture')
  }

  const handlePictureDone = async (avatarUrl: string | null, avatarColor: string) => {
    const { data: { session } } = await getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('profiles').insert({
      id: session.user.id,
      firstname,
      lastname,
      birthday,
      avatar_url: avatarUrl,
      avatar_color: avatarColor,
    })

    if (error) {
      alertError('Dein Profil konnte nicht gespeichert werden.', error.message)
      return
    }
    router.push(next ?? '/parties')
  }

  return (
    <div className='relative w-full h-dvh overflow-hidden bg-main'>
      <FloatingEmojis active seed />

      {/* Only the Name sheet slides up (it sets `appear` itself): the later steps
          swap their contents inside a panel that is already standing. */}
      {step === 'name' && <PersonalDataForm onSuccess={handleNameDone} onClose={() => router.push('/login')} />}

      {step === 'birthday' && (
        <BirthdateForm onSuccess={handleBirthdateDone} onClose={() => setStep('name')} />
      )}

      {step === 'picture' && (
        <ProfilePictureForm
          firstname={firstname}
          lastname={lastname}
          onSuccess={handlePictureDone}
          onClose={() => setStep('birthday')}
        />
      )}
    </div>
  )
}
