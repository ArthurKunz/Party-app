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
      <div className='w-full flex flex-col gap-8'>
        <span className='block text-center text-3xl font-bold text-headline'>Password zurücksetzen</span>

        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Email</label>
          <input
            type='email'
            placeholder='Email'
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className='w-full px-4 h-14 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'
          />
        </div>

        <button
          type='button'
          onClick={handleForgotPassword}
          className='w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold'
        >
          Weiter
        </button>
      </div>
    )
  }

  if (step === 'forgot-sent') {
    return (
      <div className='w-full flex flex-col gap-8'>
        <span className='text-3xl text-center font-bold text-headline'>Passwort zurücksetzen</span>

        <span className='block text-center text-xs text-hint'>
          Wir haben einen Link an{' '}
          <span className='text-body font-semibold'>{resetEmail}</span>{' '}
          gesendet
        </span>
      </div>
    )
  }

  return (
    <div className='w-full flex flex-col gap-8'>
      <span className='block text-center text-3xl font-bold text-headline'>Login</span>

      <form className='flex flex-col gap-4' onSubmit={handleSignIn} noValidate>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Email</label>
          <input
            type='email'
            placeholder='max.mustermann@example.com'
            className='w-full px-4 h-14 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Passwort</label>
          <input
            type='password'
            placeholder='Gib dein Passwort ein'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full px-4 h-14 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'
          />
          <span
            className='text-xs text-hint cursor-pointer'
            onClick={() => setStep('forgot')}
          >
            Passwort vergessen?
          </span>
        </div>

        <div className='flex flex-col gap-4 mt-4'>
          <button
            type='submit'
            className='w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold'
          >
            Login
          </button>
          <div className='flex items-center gap-3'>
            <div className='flex-1 h-px bg-glass' />
            <span className='text-xs text-subheadline'>or</span>
            <div className='flex-1 h-px bg-glass' />
          </div>
          <button
            type='button'
            onClick={handleGoogleSignIn}
            className='flex w-full items-center justify-center gap-2 w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold'
          >
            <Image src='/icons/Google.png' alt='' width={18} height={18} className='shrink-0' />
            Google
          </button>
        </div>
      </form>

      <span className='block text-center text-xs text-hint'>
        Noch kein Account?{' '}
        <span className='text-body font-semibold cursor-pointer' onClick={onGoToSignUp}>
          Sign Up
        </span>
      </span>
    </div>
  )
}
