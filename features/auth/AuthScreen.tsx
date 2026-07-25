'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SignInForm from './components/SignInForm'
import SignUpForm from './components/SignUpForm'
import VerifyOtpForm from './components/VerifyOtpForm'
import ChangePasswordPage from '@/features/settings/change-password'

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
    <div className='relative w-full h-dvh overflow-hidden bg-background-main'>
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
