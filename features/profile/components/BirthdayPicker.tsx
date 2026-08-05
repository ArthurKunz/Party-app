'use client'

import { useEffect, useRef } from 'react'

// iOS-style wheel: three scroll-snapping columns under one selection band. Sizes are
// fixed because the maths below (padding, scrollTop → index) depends on them.
const ITEM_HEIGHT = 36
const VISIBLE_ITEMS = 7
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS
const EDGE_PADDING = (LIST_HEIGHT - ITEM_HEIGHT) / 2

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

// 14–25 is the app's audience, with room either side.
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 31 }, (_, i) => CURRENT_YEAR - 40 + i)

const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()

// Fades the rows out towards the top and bottom edges, like the native wheel.
const EDGE_FADE = 'linear-gradient(to bottom, transparent 0%, #000 28%, #000 72%, transparent 100%)'

function Column({
  values,
  index,
  onChange,
  format,
}: {
  values: number[]
  index: number
  onChange: (index: number) => void
  format: (value: number) => string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  // True from the first scroll event until 150ms after the last one. Without it the
  // effect below would yank the list back mid-flick, because every index change it
  // causes looks exactly like one coming from outside.
  const userScrolling = useRef(false)
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Jump to the selected row when it changes from the outside (opening the sheet, or
  // a day being clamped because the month got shorter).
  useEffect(() => {
    const el = ref.current
    if (!el || userScrolling.current) return
    const target = index * ITEM_HEIGHT
    if (Math.abs(el.scrollTop - target) > 1) el.scrollTop = target
  }, [index])

  useEffect(() => () => {
    clearTimeout(settleTimer.current)
    cancelAnimationFrame(frame.current)
  }, [])

  const handleScroll = () => {
    userScrolling.current = true
    clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => { userScrolling.current = false }, 150)

    // Reading scrollTop is the whole job, so it is throttled to one read per frame.
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      const next = Math.round(el.scrollTop / ITEM_HEIGHT)
      if (next !== index && next >= 0 && next < values.length) onChange(next)
    })
  }

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className='flex-1 snap-y snap-mandatory overflow-y-scroll scrollbar-none [-webkit-overflow-scrolling:touch]'
      style={{
        height: LIST_HEIGHT,
        paddingTop: EDGE_PADDING,
        paddingBottom: EDGE_PADDING,
        maskImage: EDGE_FADE,
        WebkitMaskImage: EDGE_FADE,
      }}
    >
      {values.map((value, i) => (
        <div
          key={value}
          style={{ height: ITEM_HEIGHT }}
          className={`flex snap-center items-center justify-center text-heading-4 transition-colors duration-150 ${
            i === index ? 'text-sheet-heading' : 'text-sheet-body'
          }`}
        >
          {format(value)}
        </div>
      ))}
    </div>
  )
}

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
  const days = Array.from({ length: maxDay }, (_, i) => i + 1)

  // A month that just got shorter cannot keep the 31st.
  useEffect(() => {
    if (day > maxDay) onChange({ day: maxDay, month, year })
  }, [day, maxDay, month, year, onChange])

  return (
    <>
      <div className='fixed inset-0 z-40 bg-main/50 backdrop-blur-xs touch-none' onClick={onClose} />

      <div className='fixed inset-x-0 bottom-0 z-50 rounded-t-[2.5rem] bg-sheet px-4 pb-safe-rsvp pt-6 backdrop-blur-2xl'>
        <div className='relative flex w-full'>
          {/* Selection band sits behind the three columns, dead centre. */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 rounded-xl bg-button-secondary/80'
            style={{ height: ITEM_HEIGHT, top: EDGE_PADDING }}
          />

          <Column
            values={days}
            index={day - 1}
            onChange={(i) => onChange({ day: i + 1, month, year })}
            format={(value) => `${value}.`}
          />
          <Column
            values={MONTHS.map((_, i) => i)}
            index={month}
            onChange={(i) => onChange({ day, month: i, year })}
            format={(value) => MONTHS[value]}
          />
          <Column
            values={YEARS}
            index={YEARS.indexOf(year)}
            onChange={(i) => onChange({ day, month, year: YEARS[i] })}
            format={(value) => String(value)}
          />
        </div>
      </div>
    </>
  )
}
