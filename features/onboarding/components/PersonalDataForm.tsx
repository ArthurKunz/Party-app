'use client'

import { useState } from 'react'
import type { NameFormProps } from '../types/onboarding.types'

export default function PersonalDataForm({ onSuccess }: NameFormProps) {
  const [firstname, setFirstname] = useState('')
  const [surname, setSurname] = useState('')

  return (
    <div className='w-full flex flex-col gap-8'>
      <h1 className='text-3xl text-center font-bold text-headline'>Wie heißt du?</h1>

      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Vorname</label>
          <input
            type='text'
            placeholder='Vorname'
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            className='w-full px-4 h-12 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Nachname</label>
          <input
            type='text'
            placeholder='Nachname'
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className='w-full px-4 h-12 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'
          />
        </div>
      </div>

      <button
        onClick={() => onSuccess(firstname, surname)}
        className='w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold'
      >
        Weiter
      </button>
    </div>
  )
}
