'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import type { NameFormProps } from '../types/onboarding.types'

export default function PersonalDataForm({ onSuccess }: NameFormProps) {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const lastnameRef = useRef<HTMLInputElement>(null)

  const handleFirstnameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (firstname.trim()) lastnameRef.current?.focus()
  }

  const handleLastnameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (lastname.trim()) onSuccess(firstname, lastname)
  }

  return (
    <div className='w-full flex flex-col gap-8'>
      <span className='block text-center text-3xl font-bold text-heading'>Wie heißt du?</span>

      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label-small'>Vorname</label>
          <input
            type='text'
            placeholder='Vorname'
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            onKeyDown={handleFirstnameKeyDown}
            className='w-full px-4 h-14 bg-secondary border border-border-input rounded-xl text-heading text-sm focus:outline-none placeholder:text-label-small'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label-small'>Nachname</label>
          <input
            ref={lastnameRef}
            type='text'
            placeholder='Nachname'
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            onKeyDown={handleLastnameKeyDown}
            className='w-full px-4 h-14 bg-secondary border border-border-input rounded-xl text-heading text-sm focus:outline-none placeholder:text-label-small'
          />
        </div>
      </div>

      <button
        onClick={() => onSuccess(firstname, lastname)}
        disabled={!firstname.trim() || !lastname.trim()}
        className='w-full h-12 rounded-full bg-tertiary text-button text-sm font-semibold text-heading disabled:opacity-40'
      >
        Weiter
      </button>
    </div>
  )
}
