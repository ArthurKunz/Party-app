'use client'

import { useRef } from 'react'
import WheelSheet from '@/components/shared/WheelSheet'

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

// A party is planned ahead, not in the past, so the wheel starts at the current
// year and runs two years out.
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2]

const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()

export type PartyDate = { day: number; month: number; year: number }

export default function PartyDateSheet({
  value,
  onChange,
  onClose,
}: {
  value: PartyDate
  onChange: (next: PartyDate) => void
  onClose: () => void
}) {
  const maxDay = daysInMonth(value.month, value.year)
  const day = Math.min(value.day, maxDay)

  // The sheet is mounted only while it is open, so the first render IS the moment it
  // opened — which is the date the ✕ has to give back. Restored in ONE call: the three
  // columns each close over the same `value`, so putting them back one at a time would
  // have every call overwrite the one before it.
  const opened = useRef(value)

  return (
    <WheelSheet
      onCancel={() => onChange(opened.current)}
      onClose={onClose}
      columns={[
        {
          labels: Array.from({ length: maxDay }, (_, i) => `${i + 1}.`),
          index: day - 1,
          onChange: (i) => onChange({ ...value, day: i + 1 }),
        },
        {
          labels: MONTHS,
          index: value.month,
          // Clamped here rather than in an effect: 31 March → February must not
          // produce a 31st that no longer exists.
          onChange: (i) =>
            onChange({ ...value, month: i, day: Math.min(day, daysInMonth(i, value.year)) }),
        },
        {
          labels: YEARS.map(String),
          index: Math.max(0, YEARS.indexOf(value.year)),
          onChange: (i) =>
            onChange({ ...value, year: YEARS[i], day: Math.min(day, daysInMonth(value.month, YEARS[i])) }),
        },
      ]}
    />
  )
}
