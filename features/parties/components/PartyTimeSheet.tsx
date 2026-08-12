'use client'

import { useRef } from 'react'
import WheelSheet from '@/components/shared/WheelSheet'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
// Five-minute steps: nobody starts a party at 23:07.
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

export type PartyTime = { hour: number; minute: number }

export default function PartyTimeSheet({
  value,
  onChange,
  onClose,
}: {
  value: PartyTime
  onChange: (next: PartyTime) => void
  onClose: () => void
}) {
  // The time this sheet opened with — see PartyDateSheet.
  const opened = useRef(value)

  return (
    <WheelSheet
      onCancel={() => onChange(opened.current)}
      onClose={onClose}
      columns={[
        {
          labels: HOURS,
          index: value.hour,
          onChange: (i) => onChange({ ...value, hour: i }),
        },
        {
          labels: MINUTES,
          index: Math.round(value.minute / 5) % 12,
          onChange: (i) => onChange({ ...value, minute: i * 5 }),
        },
      ]}
    />
  )
}
