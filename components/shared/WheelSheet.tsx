'use client'

import { useEffect, useRef, useState } from 'react'

// iOS-style wheel in a sheet: N scroll-snapping columns under one selection band.
// Sizes are fixed because the maths below (padding, scrollTop → index) depends on
// them. Used for the birthday (day/month/year) and the event's date and times.
const ITEM_HEIGHT = 36
const VISIBLE_ITEMS = 7
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS
const EDGE_PADDING = (LIST_HEIGHT - ITEM_HEIGHT) / 2

// Fades the rows out towards the top and bottom edges, like the native wheel.
const EDGE_FADE = 'linear-gradient(to bottom, transparent 0%, #000 28%, #000 72%, transparent 100%)'

export type WheelColumn = {
  labels: string[]
  index: number
  onChange: (index: number) => void
}

function Column({ labels, index, onChange }: WheelColumn) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  // True from the first scroll event until 150ms after the last one. Without it the
  // effect below would yank the list back mid-flick, because every index change the
  // user's own scrolling causes looks exactly like one coming from outside.
  const userScrolling = useRef(false)
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

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
      if (next !== index && next >= 0 && next < labels.length) onChange(next)
    })
  }

  // Tapping a row is the second way to pick one: it scrolls that row under the
  // band, and `userScrolling` is raised first so the effect above cannot snap the
  // list there instantly and kill the animation.
  const handleTap = (i: number) => {
    const el = ref.current
    if (!el) return
    userScrolling.current = true
    clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => { userScrolling.current = false }, 150)
    el.scrollTo({ top: i * ITEM_HEIGHT, behavior: 'smooth' })
    onChange(i)
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
      {labels.map((label, i) => (
        <button
          key={label}
          type='button'
          onClick={() => handleTap(i)}
          style={{ height: ITEM_HEIGHT }}
          className={`flex w-full snap-center items-center justify-center text-heading-4 transition-colors duration-150 ${
            i === index ? 'text-sheet-heading' : 'text-sheet-body'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// Matches the duration on both transitions below: the sheet has to finish playing
// its entry backwards before the parent is told to unmount it.
const CLOSE_MS = 300

export default function WheelSheet({ columns, onClose }: { columns: WheelColumn[]; onClose: () => void }) {
  // Flipped on the frame after mount, so the sheet has a state to animate FROM.
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Opening was animated and closing was not — the parent renders this sheet
  // conditionally, so its own `onClose` unmounts it on the spot. It is intercepted
  // here instead: play the exit, then hand the close on.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const handleClose = () => {
    // A second tap while it is already leaving must not queue another close.
    if (closeTimer.current) return
    setShown(false)
    closeTimer.current = setTimeout(onClose, CLOSE_MS)
  }

  // The document must not scroll behind the sheet.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-main/50 backdrop-blur-xs touch-none transition-opacity duration-300 ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Grown by height rather than slid in with a transform: a transform on this
          element would put its backdrop-blur in its own compositing group, and the
          sheet would sit there flat and grey until the animation finished. */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          shown ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className='overflow-hidden'>
          <div className='rounded-t-3xl bg-sheet px-4 pb-safe-rsvp pt-6 backdrop-blur-2xl'>
            <div className='relative flex w-full'>
              {/* Selection band sits behind the columns, dead centre. */}
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-x-0 rounded-xl bg-button-secondary/80'
                style={{ height: ITEM_HEIGHT, top: EDGE_PADDING }}
              />
              {columns.map((column, i) => (
                <Column key={i} {...column} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
