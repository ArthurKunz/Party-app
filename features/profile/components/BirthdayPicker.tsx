'use client'

import { useEffect } from 'react'
import WheelSheet from '@/components/shared/WheelSheet'

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

// 14–25 is the app's audience, but the wheel has to hold anyone who can legitimately
// sign up: it used to stop at 40 years old, which shut out every older host.
const CURRENT_YEAR = new Date().getFullYear()
const MIN_AGE = 10
const MAX_AGE = 100
const YEARS = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => CURRENT_YEAR - MAX_AGE + i)

const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()

export default function BirthdayPicker({
  day,
  month,
  year,
  onChange,
  onClose,
}: {
  day: number
  month: number
  year: number
  onChange: (next: { day: number; month: number; year: number }) => void
  onClose: () => void
}) {
  const maxDay = daysInMonth(month, year)

  // A month that just got shorter cannot keep the 31st.
  useEffect(() => {
    if (day > maxDay) onChange({ day: maxDay, month, year })
  }, [day, maxDay, month, year, onChange])

  return (
    <WheelSheet
      onClose={onClose}
      columns={[
        {
          labels: Array.from({ length: maxDay }, (_, i) => `${i + 1}.`),
          index: day - 1,
          onChange: (i) => onChange({ day: i + 1, month, year }),
        },
        {
          labels: MONTHS,
          index: month,
          onChange: (i) => onChange({ day, month: i, year }),
        },
        {
          labels: YEARS.map(String),
          // A stored year outside the list would give -1 and leave the wheel sitting
          // between rows, so it falls back to the first one.
          index: Math.max(0, YEARS.indexOf(year)),
          onChange: (i) => onChange({ day, month, year: YEARS[i] }),
        },
      ]}
    />
  )
}
