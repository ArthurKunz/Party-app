'use client'

import { useRef, useState, type TouchEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { cardClass, RowDivider, rowClass, rowLabelClass, rowValueClass } from '@/components/shared/Card'
import type { PoolDraft } from '../types/events.types'

const ACTION_WIDTH = 80
const GAP = 12
// How far the card travels when the delete button is fully out.
const SLIDE = ACTION_WIDTH + GAP
// Past this the swipe settles open rather than springing back.
const OPEN_AT = SLIDE / 2
// Under this a touch is still a tap, not a drag.
const SLOP = 8

// One drafted poll, as an overview row. Tapping it re-opens the form on that poll;
// swiping it left uncovers a delete button, the way an iOS list row does.
export default function PoolDraftCard({
  pool,
  deleting = false,
  onEdit,
  onDelete,
}: {
  pool: PoolDraft
  /** Owned by the caller, which is the one that knows the delete was accepted: the
   *  card finishes the swipe and leaves to the left while the space it held folds. */
  deleting?: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef({ x: 0, y: 0, offset: 0 })
  // Locked on the first real movement: a vertical drag has to stay a page scroll.
  const axis = useRef<'none' | 'x' | 'y'>('none')

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    start.current = { x: touch.clientX, y: touch.clientY, offset }
    axis.current = 'none'
    setDragging(true)
  }

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0]
    const dx = touch.clientX - start.current.x
    const dy = touch.clientY - start.current.y
    if (axis.current === 'none') {
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    }
    if (axis.current !== 'x') return
    setOffset(Math.min(0, Math.max(-SLIDE, start.current.offset + dx)))
  }

  const handleTouchEnd = () => {
    setDragging(false)
    setOffset(offset < -OPEN_AT ? -SLIDE : 0)
  }

  const handleClick = () => {
    // The click that ends a swipe must not open the form, and while the delete
    // button is out the whole row is a way to put it away again.
    if (axis.current === 'x') return
    if (offset !== 0) {
      setOffset(0)
      return
    }
    onEdit()
  }

  return (
    <div className='overflow-hidden'>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        // -100% is the row's own width, which is wider than the container by the
        // gap and the delete button, so the card clears the screen entirely.
        style={{ transform: deleting ? 'translateX(-100%)' : `translateX(${offset}px)` }}
        className={`flex items-stretch gap-3 ${
          dragging && !deleting ? '' : 'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]'
        }`}
      >
        <button type='button' onClick={handleClick} className={`${cardClass} shrink-0 text-left`}>
          <div className={rowClass}>
            <span className={rowLabelClass}>Frage</span>
            <span className={`ml-auto truncate ${rowValueClass}`}>{pool.question}</span>
          </div>
          {pool.options.map((option, i) => (
            <div key={i}>
              <RowDivider />
              <div className={rowClass}>
                <span className={rowLabelClass}>Option {i + 1}</span>
                <span className={`ml-auto truncate ${rowValueClass}`}>{option}</span>
              </div>
            </div>
          ))}
        </button>

        {/* Sits beside the card rather than under it: the card is translucent, so a
            button behind it would show straight through. The surface stays a full
            80px tap target even though only the icon is drawn. */}
        <button
          type='button'
          onClick={onDelete}
          aria-label='Umfrage löschen'
          className='flex w-20 shrink-0 items-center justify-center'
        >
          <Trash2 size={22} strokeWidth={2.5} className='text-warning' />
        </button>
      </div>
    </div>
  )
}
