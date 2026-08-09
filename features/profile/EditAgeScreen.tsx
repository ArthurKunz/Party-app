'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Spinner from '@/components/shared/Spinner'
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog'
import { alertError } from '@/lib/utils'
import { getMyProfile, updateProfileBirthday } from './services/profile.service'
import BirthdayPicker from './components/BirthdayPicker'
import SettingsPage, {
  cardClass,
  rowClass,
  rowLabelClass,
  rowValueClass,
  saveButtonClass,
} from './components/SettingsPage'

// Someone turning 18 this year is the middle of the app's audience, so the wheel
// opens there when no birthday is stored yet.
const DEFAULT_BIRTH_YEAR = new Date().getFullYear() - 18

export default function EditAgeScreen() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [day, setDay] = useState(1)
  const [month, setMonth] = useState(0)
  const [year, setYear] = useState(DEFAULT_BIRTH_YEAR)
  const [storedBirthday, setStoredBirthday] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      const profile = await getMyProfile(session.user.id)
      setUserId(session.user.id)
      if (profile?.birthday) {
        setStoredBirthday(profile.birthday)
        const [y, m, d] = profile.birthday.split('-').map(Number)
        setYear(y)
        setMonth(m - 1)
        setDay(d)
      }
      setLoading(false)
    })
  }, [router])

  // The sheet covers the page, so the document must not scroll behind it.
  useEffect(() => {
    if (!pickerOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [pickerOpen])

  const pad = (value: number) => String(value).padStart(2, '0')
  const formatted = `${pad(day)}.${pad(month + 1)}.${year}`
  const iso = `${year}-${pad(month + 1)}-${pad(day)}`
  // Nothing to save while the wheel still shows what is already stored.
  const changed = iso !== storedBirthday

  // 'changed' is this screen's canSave: the button is disabled without it.
  const [askLeave, setAskLeave] = useState(false)

  const handleBack = () => {
    if (changed) {
      setAskLeave(true)
      return
    }
    router.push('/profile')
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await updateProfileBirthday(userId, iso)
    setSaving(false)
    if (error) {
      alertError('Dein Geburtstag konnte nicht gespeichert werden.', error.message)
      return
    }
    router.push('/profile')
  }

  return (
    <>
      <SettingsPage title='Alter' onBack={handleBack}>
        {loading ? (
          <div className='h-12.5 w-full rounded-[25px] skeleton' />
        ) : (
          <div className={cardClass}>
            <button type='button' onClick={() => setPickerOpen(true)} className={rowClass}>
              <span className={rowLabelClass}>Geburtstag</span>
              <span className={`ml-auto ${rowValueClass}`}>{formatted}</span>
            </button>
          </div>
        )}

        <button type='button' onClick={handleSave} disabled={loading || !changed || saving} className={saveButtonClass}>
          {saving ? <Spinner /> : 'speichern'}
        </button>

        {askLeave && (
          <UnsavedChangesDialog
            saving={saving}
            onSave={handleSave}
            onDiscard={() => router.push('/profile')}
            onCancel={() => setAskLeave(false)}
          />
        )}
      </SettingsPage>

      {pickerOpen && (
        <BirthdayPicker
          day={day}
          month={month}
          year={year}
          onChange={(next) => {
            setDay(next.day)
            setMonth(next.month)
            setYear(next.year)
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  )
}
