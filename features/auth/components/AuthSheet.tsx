'use client'

import { useState } from 'react'
import { alertError } from '@/lib/utils'
import SheetLayout from '@/components/shared/SheetLayout'
import Spinner from '@/components/shared/Spinner'
import { signInWithGoogle } from '../services/auth.service'

// lucide dropped brand marks, so the provider logo is an inline path.
const GoogleIcon = (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
    <path d='M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z' />
  </svg>
)

type Props = {
  onCreateAccount: () => void
  onSignIn: () => void
  // Where to return after the OAuth round-trip (an invite link, usually).
  next?: string | null
  description?: string
  // Slides the sheet up from the bottom edge on mount.
  appear?: boolean
}

export default function AuthSheet({
  onCreateAccount,
  onSignIn,
  next,
  description,
  appear = false,
}: Props) {
  const [pending, setPending] = useState(false)

  const handleGoogle = async () => {
    setPending(true)
    const { error } = await signInWithGoogle(next)
    // On success the browser leaves for Google, so we only get here on failure.
    if (error) {
      setPending(false)
      alertError('Anmeldung fehlgeschlagen. Bitte versuche es erneut.', error.message)
    }
  }

  return (
    <SheetLayout appear={appear}>
      <div className='flex flex-col gap-1.5 text-center'>
        <span className='text-heading-3 font-semibold text-sheet-heading'>Sign up oder login</span>
        {description && <span className='text-subheading-1 text-sheet-body'>{description}</span>}
      </div>

      <div className='flex flex-col gap-1.5'>
        <button
          type='button'
          onClick={onCreateAccount}
          className='h-14 w-full rounded-full bg-button-primary text-button font-semibold text-sheet transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'
        >
          Erstelle ein Account
        </button>

        <button
          type='button'
          onClick={onSignIn}
          className='h-14 w-full rounded-full bg-button-secondary text-button font-semibold text-sheet-heading transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'
        >
          Bei Account Anmelden
        </button>

        <button
          type='button'
          onClick={handleGoogle}
          disabled={pending}
          className='h-14 w-full flex items-center justify-center gap-2 rounded-full bg-button-secondary text-button font-semibold text-sheet-heading transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 disabled:text-sheet-body'
        >
          {/* The wait here is a redirect to Google, which is exactly the kind of
              shapeless pause the spinner exists for. */}
          {pending ? <Spinner /> : <>{GoogleIcon}Google</>}
        </button>
      </div>
    </SheetLayout>
  )
}
