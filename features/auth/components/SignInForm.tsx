'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import SheetLayout, {
  sheetButtonClass,
  sheetCardClass,
  sheetRowClass,
  sheetRowInputClass,
  sheetRowLabelClass,
  SheetRowDivider,
} from '@/components/shared/SheetLayout'
import Spinner from '@/components/shared/Spinner'
import WarningBanner from '@/components/shared/WarningBanner'
import { alertError } from '@/lib/utils'
import type { SignInProps } from '../types/auth.types'
import { sendResetPasswordEmail, signInWithPassword } from '../services/auth.service'
import { authBannerMessage } from '../services/auth-errors'

type SignInStep = 'signin' | 'forgot' | 'forgot-sent'

export default function SignInForm({ onSuccess, onClose }: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<SignInStep>('signin')
  const [resetEmail, setResetEmail] = useState('')
  const [saving, setSaving] = useState(false)
  // What the server said last time, held until the user changes something.
  const [warning, setWarning] = useState<string | null>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const handleSignIn = async () => {
    if (!email.trim() || !password || saving) return
    setSaving(true)
    const { error } = await signInWithPassword(email, password)
    setSaving(false)
    if (error) {
      const banner = authBannerMessage(error)
      if (banner) {
        setWarning(banner)
        return
      }
      alertError('Anmeldung fehlgeschlagen.', error.message)
      return
    }
    onSuccess()
  }

  const handleEmailKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (email.trim()) passwordRef.current?.focus()
  }

  const handleForgotPassword = async () => {
    if (!resetEmail.trim() || saving) return
    setSaving(true)
    const { error } = await sendResetPasswordEmail(resetEmail)
    setSaving(false)
    if (error) {
      const banner = authBannerMessage(error)
      if (banner) {
        setWarning(banner)
        return
      }
      alertError('Die Email konnte nicht gesendet werden.', error.message)
      return
    }
    setStep('forgot-sent')
  }

  if (step === 'forgot') {
    return (
      <SheetLayout title='Passwort' onClose={() => setStep('signin')}>
        <div className={sheetCardClass}>
          <label className={sheetRowClass}>
            <span className={sheetRowLabelClass}>Email</span>
            <input
              type='email'
              autoComplete='email'
              placeholder='max.mustermann@gmail.com'
              className={sheetRowInputClass}
              value={resetEmail}
              onChange={(e) => {
                setResetEmail(e.target.value)
                setWarning(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
            />
          </label>
        </div>

        {warning && <WarningBanner message={warning} />}

        <button
          type='button'
          onClick={handleForgotPassword}
          disabled={!resetEmail.trim() || saving}
          className={sheetButtonClass}
        >
          {saving ? <Spinner /> : 'weiter'}
        </button>
      </SheetLayout>
    )
  }

  if (step === 'forgot-sent') {
    return (
      <SheetLayout title='Passwort' onClose={onClose}>
        <span className='text-center text-subheading-1 text-sheet-body'>
          Wir haben einen Link an <span className='font-semibold text-sheet-heading'>{resetEmail}</span> gesendet.
          Öffne ihn, um dir ein neues Passwort zu setzen.
        </span>

        <button type='button' onClick={onClose} className={sheetButtonClass}>
          fertig
        </button>
      </SheetLayout>
    )
  }

  return (
    <SheetLayout title='Login' onClose={onClose}>
      <div className='flex flex-col gap-3'>
        <div className={sheetCardClass}>
          <label className={sheetRowClass}>
            <span className={sheetRowLabelClass}>Email</span>
            <input
              type='email'
              autoComplete='email'
              placeholder='max.mustermann@gmail.com'
              className={sheetRowInputClass}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setWarning(null)
              }}
              onKeyDown={handleEmailKeyDown}
            />
          </label>

          <SheetRowDivider />

          <label className={sheetRowClass}>
            <span className={sheetRowLabelClass}>Password</span>
            <input
              ref={passwordRef}
              type='password'
              autoComplete='current-password'
              placeholder='••••••••'
              className={sheetRowInputClass}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setWarning(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
            />
          </label>
        </div>

        <button
          type='button'
          onClick={() => setStep('forgot')}
          className='self-start px-1 text-subheading-1 text-sheet-body'
        >
          Password vergessen?
        </button>
      </div>

      {warning && <WarningBanner message={warning} />}

      <button
        type='button'
        onClick={handleSignIn}
        disabled={!email.trim() || !password || saving}
        className={sheetButtonClass}
      >
        {saving ? <Spinner /> : 'weiter'}
      </button>
    </SheetLayout>
  )
}
