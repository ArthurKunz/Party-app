'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SignInForm from './components/SignInForm'
import SignUpForm from './components/SignUpForm'
import VerifyOtpForm from './components/VerifyOtpForm'
import ChangePasswordPage from '@/features/settings/change-password'

// Two mirrored sets of concentric circles.
// LEFT  center: (0,   viewport_bottom + 200)  — bottom-left corner
// RIGHT center: (100%, viewport_bottom + 200)  — bottom-right corner
// This produces a U-shape: arcs rise steeply on both sides, dip low in the center.
// CSS: left/right: -radius  →  center exactly on the viewport corner
//      bottom: -(200 + radius)  →  circle center 200px below the viewport bottom
// Render order: largest (blue, back) first; smallest (pink, front) last.
const CIRCLES = [
  { color: '#161BFA', radius: 700 },
  { color: '#5684FF', radius: 630 },
  { color: '#AE4FFF', radius: 560 },
  { color: '#A336FF', radius: 490 },
  { color: '#D47AFF', radius: 420 },
  { color: '#E224A1', radius: 350 },
  { color: '#FF0090', radius: 280 },
]

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stepParam = searchParams.get('step')

  const [step, setStep] = useState<'signup' | 'signin' | 'verify'>('signup')
  const [signupEmail, setSignupEmail] = useState('')

  useEffect(() => {
    if (stepParam === 'onboarding') {
      router.push('/onboarding')
    }
  }, [router, stepParam])

  const effectiveStep = stepParam === 'reset-password' ? ('reset-password' as const) : step
  const activeDot = effectiveStep === 'verify' ? 1 : 0

  return (
    <div className='relative w-screen h-screen overflow-hidden bg-background-main'>
      {/* Background — U-shape: left corner + right corner circles */}
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

      {/* Dark overlay with blur */}
      <div className='fixed inset-0 bg-background-main/10 backdrop-blur-[80px]' />

      {/* Content */}
      <div className='relative z-10 w-full h-full flex flex-col items-center justify-center px-6'>
        <div className='w-full max-w-sm'>
          {effectiveStep === 'signup' && (
            <SignUpForm
              onSuccess={(email) => {
                setSignupEmail(email)
                setStep('verify')
              }}
              onGoToSignIn={() => setStep('signin')}
            />
          )}

          {effectiveStep === 'verify' && (
            <VerifyOtpForm email={signupEmail} onSuccess={() => router.push('/onboarding')} />
          )}

          {effectiveStep === 'signin' && (
            <SignInForm
              onSuccess={() => router.push('/home')}
              onGoToSignUp={() => setStep('signup')}
            />
          )}

          {effectiveStep === 'reset-password' && (
            <ChangePasswordPage onSuccess={() => router.push('/home')} />
          )}
        </div>

        {/* Progress dots */}
        <div className='absolute bottom-8 flex gap-2 items-center'>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeDot === i ? 'w-6 bg-white' : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
