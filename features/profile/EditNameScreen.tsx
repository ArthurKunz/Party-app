'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Spinner from '@/components/shared/Spinner'
import WarningBanner from '@/components/shared/WarningBanner'
import { NAME_MAX } from '@/features/onboarding/constants/onboarding.constants'
import { alertError } from '@/lib/utils'
import { getMyProfile, updateProfileName } from './services/profile.service'
import SettingsPage, {
  cardClass,
  rowClass,
  rowInputClass,
  rowLabelClass,
  RowDivider,
  saveButtonClass,
} from './components/SettingsPage'

export default function EditNameScreen() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  // What is stored, kept so the fields can be cleared on focus and still restored,
  // and so an unchanged name cannot be saved.
  const [stored, setStored] = useState({ firstname: '', lastname: '' })
  const lastnameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      const profile = await getMyProfile(session.user.id)
      setUserId(session.user.id)
      setFirstname(profile?.firstname ?? '')
      setLastname(profile?.lastname ?? '')
      setStored({ firstname: profile?.firstname ?? '', lastname: profile?.lastname ?? '' })
      setLoading(false)
    })
  }, [router])

  const handleFirstnameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (firstname.trim()) lastnameRef.current?.focus()
  }

  const changed = firstname.trim() !== stored.firstname || lastname.trim() !== stored.lastname
  const canSave = firstname.trim().length > 0 && lastname.trim().length > 0 && changed
  const atLimit = firstname.length >= NAME_MAX || lastname.length >= NAME_MAX

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    const { error } = await updateProfileName(userId, firstname.trim(), lastname.trim())
    setSaving(false)
    if (error) {
      alertError('Dein Name konnte nicht gespeichert werden.', error.message)
      return
    }
    router.push('/profile')
  }

  return (
    <SettingsPage title='Name'>
      {loading ? (
        <div className='h-25 w-full rounded-[25px] skeleton' />
      ) : (
      <div className={cardClass}>
        <div className={rowClass}>
          <label htmlFor='firstname' className={rowLabelClass}>Vorname</label>
          <input
            id='firstname'
            type='text'
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            // Cleared on focus so a new name can be typed without deleting the old
            // one; the stored value stays visible as the placeholder.
            onFocus={() => setFirstname('')}
            onBlur={() => firstname.trim() === '' && setFirstname(stored.firstname)}
            onKeyDown={handleFirstnameKeyDown}
            autoComplete='given-name'
            enterKeyHint='next'
            placeholder={stored.firstname || 'Vorname'}
            maxLength={NAME_MAX}
            className={rowInputClass}
          />
        </div>

        <RowDivider />

        <div className={rowClass}>
          <label htmlFor='lastname' className={rowLabelClass}>Nachname</label>
          <input
            ref={lastnameRef}
            id='lastname'
            type='text'
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            onFocus={() => setLastname('')}
            onBlur={() => lastname.trim() === '' && setLastname(stored.lastname)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            autoComplete='family-name'
            enterKeyHint='done'
            placeholder={stored.lastname || 'Nachname'}
            maxLength={NAME_MAX}
            className={rowInputClass}
          />
        </div>
      </div>
      )}

      {atLimit && <WarningBanner message={`Maximal ${NAME_MAX} Zeichen`} />}

      <button type='button' onClick={handleSave} disabled={loading || !canSave || saving} className={saveButtonClass}>
        {saving ? <Spinner /> : 'speichern'}
      </button>
    </SettingsPage>
  )
}
