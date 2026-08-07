'use client'

import { useState } from 'react'
import SheetLayout, {
  sheetButtonClass,
  sheetCardClass,
  sheetRowClass,
  sheetRowLabelClass,
  sheetRowValueClass,
} from '@/components/shared/SheetLayout'
import BirthdayPicker from '@/features/profile/components/BirthdayPicker'
import type { BirthdateFormProps } from '../types/onboarding.types'

// The wheel opens on a plausible birthday rather than today, so nobody has to
// scroll two decades to reach their own year.
const DEFAULT_AGE = 18

const pad = (value: number) => String(value).padStart(2, '0')

export default function BirthdateForm({ onSuccess, onClose }: BirthdateFormProps) {
  const [date, setDate] = useState<{ day: number; month: number; year: number } | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  // Commit the value the wheel is about to show, so opening it and closing it
  // again keeps what was on screen instead of falling back to the placeholder.
  const openPicker = () => {
    if (!date) setDate({ day: 1, month: 0, year: new Date().getFullYear() - DEFAULT_AGE })
    setPickerOpen(true)
  }

  return (
    <>
      <SheetLayout title='Geburtstag' onClose={onClose}>
        <div className={sheetCardClass}>
          <button type='button' onClick={openPicker} className={sheetRowClass}>
            <span className={sheetRowLabelClass}>Geburtstag</span>
            <span className={`ml-auto ${sheetRowValueClass}`}>
              {date ? `${pad(date.day)}.${pad(date.month + 1)}.${date.year}` : 'auswählen'}
            </span>
          </button>
        </div>

        <button
          type='button'
          onClick={() => date && onSuccess(`${date.year}-${pad(date.month + 1)}-${pad(date.day)}`)}
          disabled={!date}
          className={sheetButtonClass}
        >
          weiter
        </button>

      </SheetLayout>

      {/* OUTSIDE the sheet on purpose. The sheet animates with a transform, and a
          transformed ancestor becomes the containing block for `position: fixed`
          descendants — inside it the wheel's full-screen scrim only covered the
          sheet itself (so tapping the page closed nothing) and the wheel was
          clipped by the sheet's own overflow. As a sibling it is fixed to the
          VIEWPORT again, so tapping anywhere outside the wheel closes it and keeps
          whatever was scrolled under the band. */}
      {pickerOpen && date && (
        <BirthdayPicker
          day={date.day}
          month={date.month}
          year={date.year}
          onChange={setDate}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  )
}
