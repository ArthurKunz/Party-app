'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Spinner from '@/components/shared/Spinner'
import WarningBanner from '@/components/shared/WarningBanner'
import { alertError } from '@/lib/utils'
import { usePasswordValidation } from '@/features/auth/hooks/usePasswordValidation'
import SettingsPage, {
  cardClass,
  rowClass,
  rowInputClass,
  rowLabelClass,
  RowDivider,
  saveButtonClass,
} from './components/SettingsPage'

export default function EditPasswordScreen() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const confirmRef = useRef<HTMLInputElement>(null)
  // Same strength check the signup flow uses.
  const { passwordWarning, isPasswordValid } = usePasswordValidation(password)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
    })
  }, [router])

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
  const canSave = password.length > 0 && confirm.length > 0 && !mismatch

  const handleSave = async () => {
    if (!isPasswordValid) {
      alertError(passwordWarning || 'Dieses Passwort ist zu schwach.')
      return
    }
    if (password !== confirm) {
      alertError('Die beiden Passwörter stimmen nicht überein.')
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) {
      alertError('Dein Passwort konnte nicht geändert werden.', error.message)
      return
    }
    router.push('/profile')
  }

  return (
    <SettingsPage title='Passwort'>
      <div className={cardClass}>
        <div className={rowClass}>
          <label htmlFor='new-password' className={rowLabelClass}>neues Passwort</label>
          <input
            id='new-password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handlePasswordKeyDown}
            autoComplete='new-password'
            enterKeyHint='next'
            placeholder='••••••••'
            className={rowInputClass}
          />
        </div>

        <RowDivider />

        <div className={rowClass}>
          <label htmlFor='confirm-password' className={rowLabelClass}>Passwort wiederholen</label>
          <input
            ref={confirmRef}
            id='confirm-password'
            type='password'
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            autoComplete='new-password'
            enterKeyHint='done'
            placeholder='••••••••'
            className={rowInputClass}
          />
        </div>
      </div>

      {/* Same warning surface as the party pages' "nearly full" notice. */}
      {warning && <WarningBanner message={warning} />}

      <button type='button' onClick={handleSave} disabled={!canSave || saving} className={saveButtonClass}>
        {saving ? <Spinner /> : 'speichern'}
      </button>
    </SettingsPage>
  )
}
