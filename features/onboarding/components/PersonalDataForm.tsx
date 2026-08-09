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
import WarningBanner from '@/components/shared/WarningBanner'
import { NAME_MAX } from '../constants/onboarding.constants'
import type { NameFormProps } from '../types/onboarding.types'

export default function PersonalDataForm({ onSuccess, onSwitchAccount }: NameFormProps) {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const lastnameRef = useRef<HTMLInputElement>(null)

  const canContinue = firstname.trim().length > 0 && lastname.trim().length > 0
  const atLimit = firstname.length >= NAME_MAX || lastname.length >= NAME_MAX

  const handleFirstnameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (firstname.trim()) lastnameRef.current?.focus()
  }

  // No onClose, so no chevron: there is nothing behind this step. The browser's own
  // back button already bounces off the proxy gate and returns here, and a chevron
  // that quietly signed the user out instead was the one control in the flow that did
  // something other than what it looked like.
  return (
    <SheetLayout title='Name' appear>
      <div className={sheetCardClass}>
        <label className={sheetRowClass}>
          <span className={sheetRowLabelClass}>Vorname</span>
          <input
            type='text'
            autoComplete='given-name'
            placeholder='Vorname'
            maxLength={NAME_MAX}
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
            maxLength={NAME_MAX}
            className={sheetRowInputClass}
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && canContinue && onSuccess(firstname, lastname)}
          />
        </label>
      </div>

      {atLimit && <WarningBanner message={`Maximal ${NAME_MAX} Zeichen`} />}

      <button
        type='button'
        onClick={() => onSuccess(firstname, lastname)}
        disabled={!canContinue}
        className={sheetButtonClass}
      >
        weiter
      </button>

      {/* The exit, spelled out. It only matters to someone who signed in with the
          wrong Google account — verifying an emailed code already proves that
          address is theirs — so it is quiet, like 'Password vergessen?'. */}
      <button
        type='button'
        onClick={onSwitchAccount}
        className='self-center px-1 text-subheading-1 text-sheet-body'
      >
        Mit einem anderen Konto anmelden
      </button>
    </SheetLayout>
  )
}
