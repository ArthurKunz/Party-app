'use client'

import { useState, useRef, useEffect } from 'react'

const DAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTHS_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

const TIME_SLOTS = Array.from({ length: 96 }, (_, i) => ({
  hour: Math.floor(i / 4).toString().padStart(2, '0'),
  minute: ((i % 4) * 15).toString().padStart(2, '0'),
}))

interface DateTimePickerProps {
  day: string
  month: string
  year: string
  hour: string
  minute: string
  onChange: (field: 'day' | 'month' | 'year' | 'hour' | 'minute', value: string) => void
}

export default function DateTimePicker({ day, month, year, hour, minute, onChange }: DateTimePickerProps) {
  const today = new Date()
  const todayY = today.getFullYear()
  const todayM = today.getMonth() + 1
  const todayD = today.getDate()

  const [viewYear, setViewYear] = useState(parseInt(year) || todayY)
  const [viewMonth, setViewMonth] = useState(parseInt(month) || todayM)

  const timeRef = useRef<HTMLDivElement>(null)

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
  const firstDayOffset = (new Date(viewYear, viewMonth - 1, 1).getDay() + 6) % 7

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const isPast = (d: number) => {
    if (viewYear < todayY) return true
    if (viewYear === todayY && viewMonth < todayM) return true
    if (viewYear === todayY && viewMonth === todayM && d < todayD) return true
    return false
  }

  const isToday = (d: number) =>
    d === todayD && viewMonth === todayM && viewYear === todayY

  const isSelected = (d: number) =>
    day === String(d).padStart(2, '0') &&
    month === String(viewMonth).padStart(2, '0') &&
    year === String(viewYear)

  const handleDayClick = (d: number) => {
    if (isPast(d)) return
    onChange('day', String(d).padStart(2, '0'))
    onChange('month', String(viewMonth).padStart(2, '0'))
    onChange('year', String(viewYear))
  }

  useEffect(() => {
    if (!timeRef.current || !hour || !minute) return
    const idx = TIME_SLOTS.findIndex((s) => s.hour === hour && s.minute === minute)
    if (idx === -1) return
    timeRef.current.scrollTop = Math.max(0, idx * 44 - 88)
  }, []) // intentionally runs once on mount to scroll to selected time

  const selectedDateLabel = (() => {
    if (!day || !month || !year) return null
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      .toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
  })()

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex rounded-2xl overflow-hidden border border-border-input bg-background-secondary'>
        {/* Calendar */}
        <div className='flex-1 min-w-0 p-3 flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <button
              type='button'
              onClick={prevMonth}
              className='h-7 w-7 flex items-center justify-center rounded-lg text-subheadline hover:text-body hover:bg-background-tertiary transition-colors text-lg leading-none'
            >
              ‹
            </button>
            <span className='text-sm font-semibold text-body'>
              {MONTHS_DE[viewMonth - 1]} {viewYear}
            </span>
            <button
              type='button'
              onClick={nextMonth}
              className='h-7 w-7 flex items-center justify-center rounded-lg text-subheadline hover:text-body hover:bg-background-tertiary transition-colors text-lg leading-none'
            >
              ›
            </button>
          </div>

          <div className='grid grid-cols-7'>
            {DAYS_DE.map((d) => (
              <div key={d} className='text-center text-xs text-subheadline py-1'>
                {d}
              </div>
            ))}
          </div>

          <div className='grid grid-cols-7 gap-y-1'>
            {Array.from({ length: firstDayOffset }, (_, i) => <div key={`pad-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <button
                key={d}
                type='button'
                onClick={() => handleDayClick(d)}
                disabled={isPast(d)}
                className={[
                  'relative h-8 rounded-lg text-sm flex items-center justify-center transition-colors',
                  isSelected(d)
                    ? 'bg-background-button text-button font-semibold'
                    : isPast(d)
                    ? 'text-subheadline line-through opacity-40 cursor-not-allowed'
                    : 'text-body hover:bg-background-tertiary cursor-pointer',
                ].join(' ')}
              >
                {d}
                {isToday(d) && !isSelected(d) && (
                  <span className='absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-brand-pink' />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className='w-px bg-border-input shrink-0' />

        {/* Time picker */}
        <div
          ref={timeRef}
          className='w-20 shrink-0 p-2 flex flex-col gap-1 overflow-y-auto max-h-64 scrollbar-none'
        >
          {TIME_SLOTS.map(({ hour: h, minute: m }) => (
            <button
              key={`${h}:${m}`}
              type='button'
              onClick={() => { onChange('hour', h); onChange('minute', m) }}
              className={[
                'shrink-0 h-10 w-full rounded-xl text-sm font-medium transition-colors',
                h === hour && m === minute
                  ? 'bg-background-button text-button'
                  : 'bg-background-tertiary text-body hover:bg-background-spacer',
              ].join(' ')}
            >
              {h}:{m}
            </button>
          ))}
        </div>
      </div>

      {selectedDateLabel && hour && minute && (
        <p className='text-center text-sm text-subheadline'>
          <span className='text-body'>{selectedDateLabel}</span>
          {' um '}
          <span className='text-body font-medium'>{hour}:{minute}</span>
        </p>
      )}
    </div>
  )
}
