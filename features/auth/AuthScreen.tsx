'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sanitizeNextPath } from '@/lib/utils'
import FloatingEmojis from '@/features/events/components/FloatingEmojis'
import AuthSheet from './components/AuthSheet'
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

  // Arriving with no ?step= means the user just landed on the site: the overview
  // sheet asks first whether they are signing up or signing in.
  const [step, setStep] = useState<'overview' | 'signup' | 'signin' | 'verify'>(
    stepParam === 'signup' ? 'signup' : stepParam === 'signin' ? 'signin' : 'overview'
  )
  const [signupEmail, setSignupEmail] = useState('')

  useEffect(() => {
    if (stepParam === 'onboarding') {
      router.push(onboardingHref)
    }
  }, [router, stepParam, onboardingHref])

  // The password-reset link from the email lands here. It is the one step with no
  // mockup, so it keeps the old full-screen dark layout instead of the sheet.
  if (stepParam === 'reset-password') {
    return (
      <div className='relative w-full h-dvh overflow-hidden bg-main'>
        <div className='relative z-10 w-full h-full flex flex-col items-center justify-center px-6'>
          <div className='w-full max-w-sm'>
            <ChangePasswordForm onSuccess={() => router.push('/parties')} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='relative w-full h-dvh overflow-hidden bg-main'>
      <FloatingEmojis active seed />

      {step === 'overview' && (
        <AuthSheet
          appear
          next={next}
          onCreateAccount={() => setStep('signup')}
          onSignIn={() => setStep('signin')}
        />
      )}

      {step === 'signup' && (
        <SignUpForm
          onClose={() => setStep('overview')}
          onSuccess={(email) => {
            setSignupEmail(email)
            setStep('verify')
          }}
        />
      )}

      {step === 'verify' && (
        <VerifyOtpForm
          email={signupEmail}
          onClose={() => setStep('signup')}
          onSuccess={() => router.push(onboardingHref)}
        />
      )}

      {step === 'signin' && (
        <SignInForm onClose={() => setStep('overview')} onSuccess={() => router.push(next ?? '/parties')} />
      )}
    </div>
  )
}
