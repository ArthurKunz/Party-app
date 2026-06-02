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

  const effectiveStep =
    stepParam === 'reset-password' ? ('reset-password' as const) : step

  return (
    <div className='w-screen h-screen p-2.5 flex bg-primary'>
      <div className='w-3/5 flex justify-center items-end h-full rounded-3xl bg-[linear-gradient(180deg,#0056FF_0%,#0c0c0c_75%,#0c0c0c_100%)]'>
        {(effectiveStep === 'signup' || effectiveStep === 'verify') && (
          <div className='flex flex-col items-center w-65 h-75 mb-15 gap-10'>
            <div className='flex flex-col items-center'>
              <span className='text-center text-sm text-brand font-semibold mb-2.5'>
                Student Connect
              </span>
              <span className='text-center text-3xl text-light-heading font-semibold mb-2'>
                Starte jetzt mit uns
              </span>
              <span className='text-center text-xs w-60 text-light-subheading'>
                Folge diesen einfachen Schritten, um deinen account zu erstellen
              </span>
            </div>
            <div className='w-full flex flex-col gap-2'>
              <div className='w-full h-12.5 bg-white rounded-xl flex gap-3 items-center px-3'>
                <div className='text-xs text-light-heading  w-6 h-6 bg-brand rounded-full flex justify-center items-center'>
                  1
                </div>
                <span className='text-xs text-brand'>Erstelle deinen Account</span>
              </div>
              <div className='w-full h-12.5 bg-secondary rounded-xl flex gap-3 items-center px-3'>
                <div className='text-xs text-light-heading  w-6 h-6 bg-tertiary rounded-full flex justify-center items-center'>
                  2
                </div>
                <span className='text-xs text-light-muted'>Verifiziere dein Account</span>
              </div>
              <div className='w-full h-12.5 bg-secondary rounded-xl flex gap-3 items-center px-3'>
                <div className='text-xs text-light-heading  w-6 h-6 bg-tertiary rounded-full flex justify-center items-center'>
                  3
                </div>
                <span className='text-xs text-light-muted'>Erstelle dein Profil</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='relative w-2/5 h-full px-20 py-20 flex flex-col '>
        <div className='w-full h-full'>
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
      </div>
    </div>
  )
}
