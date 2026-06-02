'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { SignInProps } from '../types/auth.types'
import { sendResetPasswordEmail, signInWithGoogle, signInWithPassword } from '../services/auth.service'

type SignInStep = 'signin' | 'forgot' | 'forgot-sent'

export default function SignInForm({ onSuccess, onGoToSignUp }: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<SignInStep>('signin')
  const [resetEmail, setResetEmail] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await signInWithPassword(email, password)
    if (error) {
      console.error('SignIn error:', error)
      alert(error.message)
      return
    }
    onSuccess()
  }

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle()
    if (error) {
      console.error('Google signin error:', error)
      alert(error.message)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await sendResetPasswordEmail(resetEmail)
    if (error) {
      alert(error.message)
      return
    }
    setStep('forgot-sent')
  }

  if (step === 'forgot') {
    return (
      <div className='w-full flex flex-col items-center gap-15'>
        <div className='w-full h-full flex flex-col items-center gap-2.5'>
          <h1 className='text-4xl font-bold text-center text-light-heading'>Password zurücksetzen</h1>
          <span className='text-center text-sm text-light-subheading'>Gib deine Emailadresse ein und wir werden eine <span className='text-brand text-sm font-semibold '>Zurücksetzung</span> an dich senden</span>
        </div>
        <div className='w-full flex flex-col gap-2'>
          <label className='text-sm text-light-label'>Email</label>
          <input
          type='Email'
          placeholder='Email'
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          className='w-full text-light-input text-xs px-3 h-12 bg-input-bg border border-input-border rounded-md text-sm text-light focus:outline-none placeholder:text-xs placeholder:text-light-placeholder'
          />
        </div>
        <button 
            type='submit'
            onClick={handleForgotPassword}
            className='flex w-full items-center justify-center gap-2 rounded-full bg-button-bg py-3 text-sm font-semibold'
        >
          weiter
        </button>
      </div>
    )
  }

  if (step === 'forgot-sent') {
    return (
      <div className='w-full flex flex-col items-center gap-15'>
        <div className='w-full h-full flex flex-col items-center gap-2.5'>
          <h1 className='text-4xl font-bold text-center text-light-heading'>Passwort zurücksetzen</h1>
          <span className='text-center text-sm text-light-subheading'>Wir haben ein Zurücksetzungslink an <span className='text-brand text-sm font-semibold '>{resetEmail}</span> gesendet</span>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full flex flex-col items-center gap-15'>

      <div className='w-full h-full flex flex-col items-center gap-2.5'>
        <h1 className='text-4xl font-bold text-light-heading'>Login</h1>
        <span className='text-center text-sm text-light-subheading'>Log dich ein und lerne <span className='text-brand text-sm font-semibold '>Leipzig</span> kennen</span>
      </div>

      <form className='w-full flex flex-col gap-12.5' onSubmit={handleSignIn} noValidate>
        <div className='w-full'>
          <div className='w-full flex flex-col gap-5'>
            <div className='w-full flex flex-col gap-2'>
              <label className='text-sm text-light-label'>Email</label>
              <input
              type='email'
              placeholder='max.mustermann@example.com'
              className='w-full text-light-input text-xs px-3 h-12 bg-input-bg border border-input-border rounded-md text-sm text-light focus:outline-none placeholder:text-xs placeholder:text-light-placeholder'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className='w-full flex flex-col gap-2'>
              <label className='text-sm text-light-label'>Passwort</label>
              <input
              type='password'
              placeholder='Gib dein Passwort ein'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full text-light-input text-xs px-3 h-12 bg-input-bg border border-input-border rounded-md text-sm text-light focus:outline-none placeholder:text-xs placeholder:text-light-placeholder'
              />
              <span 
              className='text-xs text-light-subheading cursor-pointer'
              onClick={()=> setStep('forgot')}
              >Password vergessen?</span>
            </div>
          </div>
        </div>

        <div className='w-full flex flex-col gap-5'>
          <button 
            type='submit'
            className='flex w-full items-center justify-center gap-2 rounded-full bg-button-bg py-3 text-sm font-semibold'
          >
            Sign Up
          </button>
          <div className='w-full flex justify-between items-center'>
            <div className='w-full h-0.25 bg-divider-bg'></div>
            <span className='text-xs text-light-muted px-2.5'>Oder</span>
            <div className='w-full h-0.25 bg-divider-bg'></div>
          </div>
          <button
            type='button'
            onClick={handleGoogleSignIn}
            className='flex w-full items-center justify-center gap-2 rounded-full bg-button-bg py-3 text-sm font-semibold'
          >
            <Image src='/icons/Google.png' alt='' width={18} height={18} className='shrink-0' />
            Google
          </button>
        </div>
      </form>
      <div className='absolute flex justify-center items-center w-full h-10 bg-primary bottom-0 left-[50%] translate-x-[-50%]'>
        <span className='text-xs text-center text-light-muted'>Noch kein Account? <span className='text-brand text-sm font-semibold cursor-pointer' onClick={() => onGoToSignUp()}>Sign Up</span></span>
      </div>
    </div>
  )
}
