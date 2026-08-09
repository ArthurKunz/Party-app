'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sanitizeNextPath } from '@/lib/utils'
import FloatingEmojis from '@/features/parties/components/FloatingEmojis'
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

  // The reset link from the email carries its step in the URL, so it wins over
  // whatever the local state says.
  const effectiveStep = stepParam === 'reset-password' ? ('reset-password' as const) : step

  return (
    <div className='relative w-full h-dvh overflow-hidden bg-main'>
      <FloatingEmojis active seed />

      {effectiveStep === 'overview' && (
        <AuthSheet
          appear
          next={next}
          onCreateAccount={() => setStep('signup')}
          onSignIn={() => setStep('signin')}
        />
      )}

      {effectiveStep === 'signup' && (
        <SignUpForm
          initialEmail={signupEmail}
          onClose={() => setStep('overview')}
          onSignIn={() => setStep('signin')}
          onSuccess={(email, alreadySignedIn) => {
            // Auto-confirmed: the account is live and there is no code to enter.
            if (alreadySignedIn) {
              router.push(onboardingHref)
              return
            }
            setSignupEmail(email)
            setStep('verify')
          }}
        />
      )}

      {effectiveStep === 'verify' && (
        <VerifyOtpForm
          email={signupEmail}
          onClose={() => setStep('signup')}
          onSuccess={() => router.push(onboardingHref)}
        />
      )}

      {effectiveStep === 'signin' && (
        <SignInForm onClose={() => setStep('overview')} onSuccess={() => router.push(next ?? '/parties')} />
      )}

      {/* Where the reset link from the email lands. */}
      {effectiveStep === 'reset-password' && (
        <ChangePasswordForm onSuccess={() => router.push('/parties')} />
      )}
    </div>
  )
}
