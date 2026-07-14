'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Selectbox from '@/components/shared/Selectbox'
import { getMyProfile, updateProfileBirthday } from './services/profile.service'

const BackIcon = (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='19' y1='12' x2='5' y2='12' />
    <polyline points='12 19 5 12 12 5' />
  </svg>
)

const MONTH_OPTIONS = [
  { value: '01', label: 'Januar' },
  { value: '02', label: 'Februar' },
  { value: '03', label: 'März' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Dezember' },
]

const YEAR_OPTIONS = Array.from({ length: 26 }, (_, i) => {
  const year = 2012 - i
  return { value: String(year), label: String(year) }
})

function daysInMonth(month: string, year: string): number {
  if (!month || !year) return 31
  return new Date(Number(year), Number(month), 0).getDate()
}

export default function EditAgeScreen() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
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
        const [y, m, d] = profile.birthday.split('-')
        setYear(y ?? '')
        setMonth(m ?? '')
        setDay(d ?? '')
      }
      setLoading(false)
    })
  }, [router])

  const maxDay = daysInMonth(month, year)
  const dayOptions = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1) })),
    [maxDay],
  )

  const clampDay = (nextMaxDay: number) => {
    if (day && Number(day) > nextMaxDay) setDay(String(nextMaxDay).padStart(2, '0'))
  }

  const handleMonthChange = (m: string) => {
    setMonth(m)
    clampDay(daysInMonth(m, year))
  }

  const handleYearChange = (y: string) => {
    setYear(y)
    clampDay(daysInMonth(month, y))
  }

  const handleSave = async () => {
    if (!userId || !day || !month || !year) return

    setSaving(true)
    const birthday = `${year}-${month}-${day}`
    const { error } = await updateProfileBirthday(userId, birthday)
    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }
    router.push('/profile')
  }

  if (loading) return null

  const canSave = Boolean(day && month && year)

  return (
    <div className='relative w-full min-h-dvh overflow-hidden bg-background-main'>
      <div className='relative z-10 flex flex-col px-6 pt-7.5 pb-12'>
        <div className='relative flex items-center justify-center'>
          <button
            onClick={() => router.push('/profile')}
            aria-label='Zurück'
            className='absolute left-0 flex h-11 w-11 items-center justify-center rounded-full text-headline'
          >
            {BackIcon}
          </button>
          <span className='text-2xl font-bold text-headline'>Alter</span>
        </div>

        <div className='mt-10 flex flex-col gap-2'>
          <label className='text-sm text-label'>Geburtstag</label>
          <div className='flex gap-2'>
            <Selectbox
              options={dayOptions}
              value={day}
              onValueChange={setDay}
              placeholder='Tag'
              aria-label='Tag'
              center
            />
            <Selectbox
              options={MONTH_OPTIONS}
              value={month}
              onValueChange={handleMonthChange}
              placeholder='Monat'
              aria-label='Monat'
            />
            <Selectbox
              options={YEAR_OPTIONS}
              value={year}
              onValueChange={handleYearChange}
              placeholder='Jahr'
              aria-label='Jahr'
              center
            />
          </div>
        </div>

        <button
          onClick={() => void handleSave()}
          disabled={!canSave || saving}
          className='mt-10 w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold disabled:opacity-40'
        >
          {saving ? 'Speichert…' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}
