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
import WarningBanner from '@/components/shared/WarningBanner'
import Spinner from '@/components/shared/Spinner'
import { alertError } from '@/lib/utils'
import type { SignUpProps } from '../types/auth.types'
import { usePasswordValidation } from '../hooks/usePasswordValidation'
import { signUpWithEmail } from '../services/auth.service'
import { authBannerMessage } from '../services/auth-errors'

export default function SignUpForm({ onSuccess, onClose }: SignUpProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  // What the server said last time, held until the user changes something.
  const [serverWarning, setServerWarning] = useState<string | null>(null)
  const { passwordWarning, isPasswordValid } = usePasswordValidation(password)
  const passwordRef = useRef<HTMLInputElement>(null)

  // The banner only appears once there is something to complain about. An address that
  // is already taken outranks the password rules: it is the one the user cannot fix by
  // typing more, and the password may well be fine already.
  const showPasswordWarning = password.length > 0 && !isPasswordValid
  const warning = serverWarning ?? (showPasswordWarning ? passwordWarning : null)
  const canContinue = email.trim().length > 0 && isPasswordValid

  const handleEmailKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (email.trim()) passwordRef.current?.focus()
  }

  const handleSignUp = async () => {
    if (!canContinue || saving) return
    setSaving(true)
    const { data, error } = await signUpWithEmail(email, password)
    setSaving(false)

    if (error) {
      const banner = authBannerMessage(error)
      if (banner) {
        setServerWarning(banner)
        return
      }
      alertError('Dein Account konnte nicht erstellt werden.', error.message)
      return
    }

    // Supabase will not say that an address is taken — that would make this form an
    // account-enumeration oracle for every user in the project. With email
    // confirmation on (mailer_autoconfirm is false here) it answers a repeat signup
    // with a DECOY user carrying an empty `identities` array and sends no session,
    // which is the documented way to spot it. Without this the flow walked on to the
    // verification step, whose code signed the user into the EXISTING account and then
    // failed on profiles_pkey at the end of onboarding.
    if (data.user?.identities?.length === 0) {
      setServerWarning('Diese Email hat schon ein Konto')
      return
    }

    onSuccess(email)
  }

  return (
    <SheetLayout title='Sign Up' onClose={onClose}>
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
              setServerWarning(null)
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
            autoComplete='new-password'
            placeholder='••••••••'
            className={sheetRowInputClass}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setServerWarning(null)
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
          />
        </label>
      </div>

      {warning && <WarningBanner message={warning} />}

      <button type='button' onClick={handleSignUp} disabled={!canContinue || saving} className={sheetButtonClass}>
        {saving ? <Spinner /> : 'weiter'}
      </button>
    </SheetLayout>
  )
}
