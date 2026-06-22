'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getSession } from './services/onboarding.service'
import PersonalDataForm from './components/PersonalDataForm'
import BirthdateForm from './components/BirthdateForm'
import ProfilePictureForm from './components/ProfilePictureForm'

type Step = 'name' | 'birthday' | 'picture'

const STEPS: Step[] = ['name', 'birthday', 'picture']

const CIRCLES = [
  { color: '#161BFA', radius: 700 },
  { color: '#5684FF', radius: 630 },
  { color: '#AE4FFF', radius: 560 },
  { color: '#A336FF', radius: 490 },
  { color: '#D47AFF', radius: 420 },
  { color: '#E224A1', radius: 350 },
  { color: '#FF0090', radius: 280 },
]

export default function OnboardingScreen() {
  const router = useRouter()
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
    if (!session) return

    const { error } = await supabase.from('profiles').insert({
      id: session.user.id,
      firstname,
      lastname,
      birthday,
      avatar_url: avatarUrl,
      avatar_color: avatarColor,
    })

    if (error) alert(error.message)
    else router.push('/home')
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <div className='relative w-screen h-screen overflow-hidden bg-background-main'>
      <div className='fixed inset-0 overflow-hidden'>
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

      <div className='fixed inset-0 bg-background-main/10 backdrop-blur-[80px]' />

      <div className='relative z-10 w-full h-full flex flex-col items-center justify-center px-6'>
        <div className='w-full max-w-sm'>
          {step === 'name' && <PersonalDataForm onSuccess={handleNameDone} />}
          {step === 'birthday' && <BirthdateForm onSuccess={handleBirthdateDone} />}
          {step === 'picture' && <ProfilePictureForm onSuccess={handlePictureDone} />}
        </div>

        <div className='absolute bottom-8 flex gap-2 items-center'>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === stepIndex ? 'w-6 bg-white' : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
