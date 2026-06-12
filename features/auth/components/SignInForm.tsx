'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { SignInProps } from '../types/auth.types'
import { sendResetPasswordEmail, signInWithGoogle, signInWithPassword } from '../services/auth.service'

type SignInStep = 'signin' | 'forgot' | 'forgot-sent'

const inputClass = 'w-full px-4 h-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-white/40'

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
        <div className='flex flex-col items-center gap-2'>
          <h1 className='text-3xl font-bold text-white text-center'>Password zurücksetzen</h1>
          <span className='text-sm text-white/50 text-center'>
            Gib deine Emailadresse ein und wir senden dir eine{' '}
            <span className='text-[#D47AFF] font-semibold'>Zurücksetzung</span>
          </span>
        </div>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-white/80'>Email</label>
          <input
            type='email'
            placeholder='Email'
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type='button'
          onClick={handleForgotPassword}
          className='w-full h-12 rounded-full bg-white text-[#09090B] text-sm font-semibold'
        >
          Weiter
        </button>
      </div>
    )
  }

  if (step === 'forgot-sent') {
    return (
      <div className='w-full flex flex-col items-center gap-8'>
        <div className='flex flex-col items-center gap-2'>
          <h1 className='text-3xl font-bold text-white text-center'>Passwort zurücksetzen</h1>
          <span className='text-sm text-white/50 text-center'>
            Wir haben einen Link an{' '}
            <span className='text-[#D47AFF] font-semibold'>{resetEmail}</span>{' '}
            gesendet
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full flex flex-col gap-8'>
      <div className='flex flex-col items-center gap-2'>
        <h1 className='text-3xl font-bold text-white'>Login</h1>
        <span className='text-sm text-white/50 text-center'>
          Log dich ein und lerne <span className='text-[#D47AFF] font-semibold'>Leipzig</span> kennen
        </span>
      </div>

      <form className='flex flex-col gap-4' onSubmit={handleSignIn} noValidate>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-white/80'>Email</label>
          <input
            type='email'
            placeholder='max.mustermann@example.com'
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-white/80'>Passwort</label>
          <input
            type='password'
            placeholder='Gib dein Passwort ein'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          <span
            className='text-xs text-white/40 cursor-pointer hover:text-white/60 transition-colors'
            onClick={() => setStep('forgot')}
          >
            Passwort vergessen?
          </span>
        </div>

        <div className='flex flex-col gap-4 mt-4'>
          <button
            type='submit'
            className='w-full h-12 rounded-full bg-white text-[#09090B] text-sm font-semibold'
          >
            Login
          </button>
          <div className='flex items-center gap-3'>
            <div className='flex-1 h-px bg-white/10' />
            <span className='text-xs text-white/40'>or</span>
            <div className='flex-1 h-px bg-white/10' />
          </div>
          <button
            type='button'
            onClick={handleGoogleSignIn}
            className='flex w-full items-center justify-center gap-2 h-12 rounded-full bg-white/5 border border-white/10 text-white text-sm font-semibold'
          >
            <Image src='/icons/Google.png' alt='' width={18} height={18} className='shrink-0' />
            Google
          </button>
        </div>
      </form>

      <p className='text-xs text-white/40 text-center'>
        Noch kein Account?{' '}
        <span className='text-[#D47AFF] font-semibold cursor-pointer' onClick={onGoToSignUp}>
          Sign Up
        </span>
      </p>
    </div>
  )
}
