'use client'

import { useState } from 'react'
import type { BirthdateFormProps } from '../types/onboarding.types'

export default function BirthdateForm({ onSuccess }: BirthdateFormProps) {
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  const handleSubmit = () => {
    const birthday = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    onSuccess(birthday)
  }

  return (
    <div className='w-full flex flex-col gap-8'>
      <h1 className='text-3xl text-center font-bold text-headline'>Wie alt bist du?</h1>

      <div className='flex flex-col gap-2'>
        <label className='text-sm text-label'>Geburtstag</label>
        <div className='flex gap-2'>
          <input
            type='text'
            inputMode='numeric'
            maxLength={2}
            placeholder='Tag'
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className='w-full px-4 h-12 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder text-center'
          />
          <input
            type='text'
            inputMode='numeric'
            maxLength={2}
            placeholder='Monat'
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className='w-full px-4 h-12 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder text-center'
          />
          <input
            type='text'
            inputMode='numeric'
            maxLength={4}
            placeholder='Jahr'
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className='w-full px-4 h-12 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder text-center'
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
