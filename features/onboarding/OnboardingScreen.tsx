'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getSession } from './services/onboarding.service'
import PersonalDataForm from './components/PersonalDataForm'
import BirthdateForm from './components/BirthdateForm'

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
  const [step, setStep] = useState<'name' | 'birthday'>('name')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')

  const handleNameDone = (fn: string, ln: string) => {
    setFirstname(fn)
    setLastname(ln)
    setStep('birthday')
  }

  const handleBirthdateDone = async (birthday: string) => {
    const { data: { session } } = await getSession()
    if (!session) return

    const { error } = await supabase.from('profiles').insert({
      id: session.user.id,
      firstname,
      lastname,
      birthday,
    })

    if (error) alert(error.message)
    else router.push('/home')
  }

  return (
    <div className='relative w-screen h-screen overflow-hidden bg-[#09090B]'>
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

      <div className='relative z-10 w-full h-full flex flex-col items-center justify-center px-6'>
        <div className='w-full max-w-sm'>
          {step === 'name' && <PersonalDataForm onSuccess={handleNameDone} />}
          {step === 'birthday' && <BirthdateForm onSuccess={handleBirthdateDone} />}
        </div>

        <div className='absolute bottom-8 flex gap-2 items-center'>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${i === 2 ? 'w-6 bg-white' : 'w-2 bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
