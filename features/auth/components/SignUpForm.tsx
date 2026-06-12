'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { SignUpProps } from '../types/auth.types'
import { usePasswordValidation } from '../hooks/usePasswordValidation'
import { signUpWithEmail, signUpWithGoogle } from '../services/auth.service'

const inputClass = 'w-full px-4 h-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-white/40'

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
      <div className='flex flex-col items-center gap-2'>
        <h1 className='text-3xl font-bold text-white'>Sign Up</h1>
        <span className='text-sm text-white/50 text-center'>
          Erstelle ein Account und lerne <span className='text-[#D47AFF] font-semibold'>Leipzig</span> kennen
        </span>
      </div>

      <form className='flex flex-col gap-4' onSubmit={handleSignUp} noValidate>
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
            placeholder='Erstelle ein Passwort'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          {showPasswordWarning && (
            <p className='text-xs text-red-400' role='alert'>
              {passwordWarning}
            </p>
          )}
        </div>

        <div className='flex flex-col gap-4 mt-4'>
          <button
            type='submit'
            className='w-full h-12 rounded-full bg-white text-[#09090B] text-sm font-semibold'
          >
            Sign up
          </button>
          <div className='flex items-center gap-3'>
            <div className='flex-1 h-px bg-white/10' />
            <span className='text-xs text-white/40'>or</span>
            <div className='flex-1 h-px bg-white/10' />
          </div>
          <button
            type='button'
            onClick={handleGoogleSignUp}
            className='flex w-full items-center justify-center gap-2 h-12 rounded-full bg-white/5 border border-white/10 text-white text-sm font-semibold'
          >
            <Image src='/icons/Google.png' alt='' width={18} height={18} className='shrink-0' />
            Google
          </button>
        </div>
      </form>

      <p className='text-xs text-white/40 text-center'>
        Du hast schon ein Account?{' '}
        <span className='text-[#D47AFF] font-semibold cursor-pointer' onClick={onGoToSignIn}>
          Sign In
        </span>
      </p>
    </div>
  )
}
