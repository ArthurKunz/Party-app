'use client'

import { useState } from 'react'
import Selectbox from '@/components/shared/Selectbox'
import type { BirthdateFormProps } from '../types/onboarding.types'

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: String(i + 1),
}))

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

export default function BirthdateForm({ onSuccess }: BirthdateFormProps) {
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  const handleSubmit = () => {
    const birthday = `${year}-${month}-${day}`
    onSuccess(birthday)
  }

  return (
    <div className='w-full flex flex-col gap-8'>
      <span className='block text-center text-3xl font-bold text-headline'>Wie alt bist du?</span>

      <div className='flex flex-col gap-2'>
        <label className='text-sm text-label'>Geburtstag</label>
        <div className='flex gap-2'>
          <Selectbox
            options={DAY_OPTIONS}
            value={day}
            onValueChange={setDay}
            placeholder='Tag'
            aria-label='Tag'
            center
          />
          <Selectbox
            options={MONTH_OPTIONS}
            value={month}
            onValueChange={setMonth}
            placeholder='Monat'
            aria-label='Monat'
          />
          <Selectbox
            options={YEAR_OPTIONS}
            value={year}
            onValueChange={setYear}
            placeholder='Jahr'
            aria-label='Jahr'
            center
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className='w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold'
      >
        Fertig
      </button>
    </div>
  )
}
