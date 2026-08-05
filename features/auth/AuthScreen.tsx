'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sanitizeNextPath } from '@/lib/utils'
import SignInForm from './components/SignInForm'
import SignUpForm from './components/SignUpForm'
import VerifyOtpForm from './components/VerifyOtpForm'
import ChangePasswordForm from '@/features/settings/components/ChangePasswordForm'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stepParam = searchParams.get('step')
  // Set when the flow was entered from somewhere specific (an invite link), so
  // every exit below returns there instead of dumping the user on the parties list.
  const next = sanitizeNextPath(searchParams.get('next'))
  const onboardingHref = next ? `/onboarding?next=${encodeURIComponent(next)}` : '/onboarding'

  const [step, setStep] = useState<'signup' | 'signin' | 'verify'>('signup')
  const [signupEmail, setSignupEmail] = useState('')

  useEffect(() => {
    if (stepParam === 'onboarding') {
      router.push(onboardingHref)
    }
  }, [router, stepParam, onboardingHref])

  const effectiveStep = stepParam === 'reset-password' ? ('reset-password' as const) : step
  const activeDot = effectiveStep === 'verify' ? 1 : 0

  return (
    <div className='relative w-full h-dvh overflow-hidden bg-main'>
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
            <VerifyOtpForm email={signupEmail} onSuccess={() => router.push(onboardingHref)} />
          )}

          {effectiveStep === 'signin' && (
            <SignInForm
              onSuccess={() => router.push(next ?? '/parties')}
              onGoToSignUp={() => setStep('signup')}
            />
          )}

          {effectiveStep === 'reset-password' && (
            <ChangePasswordForm onSuccess={() => router.push('/parties')} />
          )}
        </div>

        {/* Progress dots */}
        <div className='absolute bottom-8 flex gap-2 items-center'>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeDot === i ? 'w-6 bg-white' : 'w-2 bg-white/30 backdrop-blur-xl'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
