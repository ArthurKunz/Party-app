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
    <div className='w-full flex flex-col items-center gap-15'>

      <div className='w-full flex flex-col items-center gap-2.5'>
        <h1 className='text-4xl font-bold text-light-heading'>Sign Up</h1>
        <span className='text-center text-sm text-light-subheading'>Erstelle jetzt ein Account und lerne <span className='text-brand text-sm font-semibold '>Leipzig</span> kennen</span>
      </div>

      <form className='w-full flex flex-col gap-12.5' onSubmit={handleSignUp} noValidate>
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
              placeholder='Erstelle ein Passwort'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full text-light-input text-xs px-3 h-12 bg-input-bg border border-input-border rounded-md text-sm text-light focus:outline-none placeholder:text-xs placeholder:text-light-placeholder'
              />
              {showPasswordWarning && (
                <p className='text-xs text-red-400' role='alert'>
                  {passwordWarning}
                </p>
              )}
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
            onClick={handleGoogleSignUp}
            className='flex w-full items-center justify-center gap-2 rounded-full bg-button-bg py-3 text-sm font-semibold'
          >
            <Image src='/icons/Google.png' alt='' width={18} height={18} className='shrink-0' />
            Google
          </button>
        </div>
      </form>
      <div className='absolute flex justify-center items-center w-full h-10 bg-primary bottom-0 left-[50%] translate-x-[-50%]'>
        <span className='text-xs text-center text-light-muted'>Du hast schon ein Account? <span className='text-brand text-sm font-semibold cursor-pointer' onClick={() => onGoToSignIn()}>Sign In</span></span>
      </div>
    </div>
  )
}
