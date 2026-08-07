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
import type { NameFormProps } from '../types/onboarding.types'

export default function PersonalDataForm({ onSuccess, onClose }: NameFormProps) {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const lastnameRef = useRef<HTMLInputElement>(null)

  const canContinue = firstname.trim().length > 0 && lastname.trim().length > 0

  const handleFirstnameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (firstname.trim()) lastnameRef.current?.focus()
  }

  return (
    <SheetLayout title='Name' onClose={onClose} appear>
      <div className={sheetCardClass}>
        <label className={sheetRowClass}>
          <span className={sheetRowLabelClass}>Vorname</span>
          <input
            type='text'
            autoComplete='given-name'
            placeholder='Vorname'
            className={sheetRowInputClass}
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            onKeyDown={handleFirstnameKeyDown}
          />
        </label>

        <SheetRowDivider />

        <label className={sheetRowClass}>
          <span className={sheetRowLabelClass}>Nachname</span>
          <input
            ref={lastnameRef}
            type='text'
            autoComplete='family-name'
            placeholder='Nachname'
            className={sheetRowInputClass}
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && canContinue && onSuccess(firstname, lastname)}
          />
        </label>
      </div>

      <button
        type='button'
        onClick={() => onSuccess(firstname, lastname)}
        disabled={!canContinue}
        className={sheetButtonClass}
      >
        weiter
      </button>
    </SheetLayout>
  )
}
