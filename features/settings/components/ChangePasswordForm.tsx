'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
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
import { usePasswordValidation } from '@/features/auth/hooks/usePasswordValidation'

interface ChangePasswordFormProps {
  onSuccess?: () => void
}

// The last step of the reset flow, reached from the link in the email. It is the same
// sheet as every other auth and onboarding step, and the same two-row shape and live
// warnings as the profile's Passwort screen.
export default function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const confirmRef = useRef<HTMLInputElement>(null)
  const { passwordWarning, isPasswordValid } = usePasswordValidation(password)

  const handlePasswordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (password.trim()) confirmRef.current?.focus()
  }

  // Both warnings are live rather than waiting for the save: a mismatch beats a
  // weak-password hint, since it is the one that blocks the button.
  const mismatch = confirm.length > 0 && password !== confirm
  const warning = mismatch
    ? 'Passwörter stimmen nicht überein'
    : password.length > 0 && passwordWarning
      ? passwordWarning
      : null
  const canSave = password.length > 0 && confirm.length > 0 && !mismatch && isPasswordValid

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) {
      alertError('Dein Passwort konnte nicht geändert werden.', error.message)
      return
    }
    if (onSuccess) onSuccess()
    else router.push('/parties')
  }

  return (
    <SheetLayout title='Passwort' onClose={() => router.push('/login')} appear>
      <div className={sheetCardClass}>
        <div className={sheetRowClass}>
          <label htmlFor='new-password' className={sheetRowLabelClass}>neues Passwort</label>
          <input
            id='new-password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handlePasswordKeyDown}
            autoComplete='new-password'
            enterKeyHint='next'
            placeholder='••••••••'
            className={sheetRowInputClass}
          />
        </div>

        <SheetRowDivider />

        <div className={sheetRowClass}>
          <label htmlFor='confirm-password' className={sheetRowLabelClass}>Passwort wiederholen</label>
          <input
            ref={confirmRef}
            id='confirm-password'
            type='password'
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoComplete='new-password'
            enterKeyHint='done'
            placeholder='••••••••'
            className={sheetRowInputClass}
          />
        </div>
      </div>

      {warning && <WarningBanner message={warning} />}

      <button type='button' onClick={handleSave} disabled={!canSave || saving} className={sheetButtonClass}>
        {saving ? <Spinner /> : 'speichern'}
      </button>
    </SheetLayout>
  )
}
