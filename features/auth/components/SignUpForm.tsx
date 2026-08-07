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

export default function SignUpForm({ onSuccess, onClose }: SignUpProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const { passwordWarning, isPasswordValid } = usePasswordValidation(password)
  const passwordRef = useRef<HTMLInputElement>(null)

  // The banner only appears once there is something to complain about — it names the
  // first unmet rule of the four (8 characters, a capital, a digit, a symbol).
  const showPasswordWarning = password.length > 0 && !isPasswordValid
  const canContinue = email.trim().length > 0 && isPasswordValid

  const handleEmailKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (email.trim()) passwordRef.current?.focus()
  }

  const handleSignUp = async () => {
    if (!canContinue || saving) return
    setSaving(true)
    const { error } = await signUpWithEmail(email, password)
    setSaving(false)
    if (error) {
      alertError('Dein Account konnte nicht erstellt werden.', error.message)
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
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
          />
        </label>
      </div>

      {showPasswordWarning && <WarningBanner message={passwordWarning} />}

      <button type='button' onClick={handleSignUp} disabled={!canContinue || saving} className={sheetButtonClass}>
        {saving ? <Spinner /> : 'weiter'}
      </button>
    </SheetLayout>
  )
}
