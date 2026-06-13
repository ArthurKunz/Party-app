'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { SignUpProps } from '../types/auth.types'
import { usePasswordValidation } from '../hooks/usePasswordValidation'
import { signUpWithEmail, signUpWithGoogle } from '../services/auth.service'

export default function SignUpForm({ onSuccess, onGoToSignIn }: SignUpProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { passwordWarning, isPasswordValid } = usePasswordValidation(password)
  const showPasswordWarning = password.length > 0 && passwordWarning !== ''

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid) return
    const { error: signUpError } = await signUpWithEmail(email, password)
    if (signUpError) {
      console.error('SignUp error:', signUpError)
      alert(signUpError.message)
      return
    }
    onSuccess(email)
  }

  const handleGoogleSignUp = async () => {
    const { error } = await signUpWithGoogle()
    if (error) {
      console.error('Google signup error:', error)
      alert(error.message)
    }
  }

  return (
    <div className='w-full flex flex-col gap-8'>
      <span className='block text-center text-3xl font-bold text-headline'>Sign Up</span>

      <form className='flex flex-col gap-4' onSubmit={handleSignUp} noValidate>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Email</label>
          <input
            type='email'
            placeholder='max.mustermann@example.com'
            className='w-full px-4 h-12 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Passwort</label>
          <input
            type='password'
            placeholder='Erstelle ein Passwort'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full px-4 h-12 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'
          />
          {showPasswordWarning && (
            <span className='text-xs text-red-400' role='alert'>
              {passwordWarning}
            </span>
          )}
        </div>

        <div className='flex flex-col gap-4 mt-4'>
          <button
            type='submit'
            className='w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold'
          >
            Sign up
          </button>
          <div className='flex items-center gap-3'>
            <div className='flex-1 h-px bg-glass' />
            <span className='text-xs text-subheadline'>or</span>
            <div className='flex-1 h-px bg-glass' />
          </div>
          <button
            type='button'
            onClick={handleGoogleSignUp}
            className='flex w-full items-center justify-center gap-2 w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold'
          >
            <Image src='/icons/Google.png' alt='' width={18} height={18} className='shrink-0' />
            Google
          </button>
        </div>
      </form>

      <span className='block text-center text-xs text-hint'>
        Du hast schon ein Account?{' '}
        <span className='text-body font-semibold cursor-pointer' onClick={onGoToSignIn}>
          Login
        </span>
      </span>
    </div>
  )
}
