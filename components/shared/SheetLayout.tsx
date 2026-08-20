'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'

// The white bottom sheet the whole sign-up funnel lives in: the Sign up oder login
// overview, every auth step and every onboarding step render inside this one panel,
// so the user only ever sees its contents change.
//
// Everything below is the LIGHT-SURFACE twin of the kit the dark pages use — same
// 50px rows, same 25px card radius, same 45px icon circle, same easing — with the
// colours swapped for the pair the wheel sheets already established on this
// surface: `bg-button-secondary` for a container, `text-sheet-heading` for what you
// read and `text-sheet-body` for what you have not filled in yet. These surfaces are
// OPAQUE, so none of them carries backdrop-blur (a filter behind something you
// cannot see through only costs GPU) and a disabled control may fade its background.
export const sheetCardClass = 'w-full overflow-hidden rounded-[25px] bg-button-secondary'
export const sheetRowClass =
  'flex h-12.5 w-full items-center gap-3 px-4 transition-colors duration-150 active:bg-black/5'
export const sheetRowLabelClass = 'text-button text-sheet-heading shrink-0'
export const sheetRowValueClass = 'text-button text-sheet-body'
export const sheetRowInputClass = `ml-auto min-w-0 flex-1 bg-transparent text-right outline-none ${sheetRowValueClass}`

// The sheet's primary action is the black pill the overview already uses, not the
// white one the dark pages use — a white pill on a white sheet is invisible.
export const sheetButtonClass =
  'flex h-14 w-full items-center justify-center rounded-full bg-button-primary text-button font-semibold text-sheet transition-[transform,background-color,color] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 disabled:bg-button-primary/40 disabled:text-sheet/60'

// Hairline between two rows, inset so it starts under the label.
export const SheetRowDivider = () => (
  <div className='flex px-4'>
    <div className='h-[0.75px] w-full bg-sheet-heading/10' />
  </div>
)

export default function SheetLayout({
  title,
  subtitle,
  onClose,
  appear = false,
  children,
}: {
  // Omitted by the overview, which carries its own left-aligned headline instead.
  title?: string
  // One line under the title, close to it rather than a full gap-5 away.
  subtitle?: string
  onClose?: () => void
  // Slides the sheet up from the bottom edge on mount. Only the FIRST sheet a user
  // sees sets this — later steps swap their contents inside a panel that is already up.
  appear?: boolean
  children: React.ReactNode
}) {
  // There has to be a state to animate FROM, so the entrance flips a frame after mount.
  const [shown, setShown] = useState(!appear)

  useEffect(() => {
    if (!appear) return
    const frame = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(frame)
  }, [appear])

  return (
    <>
      {/* The way back belongs to the PAGE, not to the sheet: same top-left circle,
          same chevron, same 45px as every other back button in the app. The sheet
          stops at 85dvh so it can never rise underneath it, which is also why this
          sits BELOW the wheel picker's z-40 scrim: the two never overlap, and a tap
          up here while the wheel is open must close the wheel, not navigate away. */}
      {onClose && (
        <button
          type='button'
          onClick={onClose}
          aria-label='Zurück'
          className='fixed left-4 top-0 z-30 mt-7.5 flex h-11.25 w-11.25 items-center justify-center rounded-full bg-secondary backdrop-blur-xl transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'
        >
          <ChevronLeft size={24} strokeWidth={3} className='text-white' />
        </button>
      )}

      <div
        className={`fixed inset-x-0 bottom-0 z-40 flex max-h-[85dvh] flex-col gap-5 overflow-y-auto rounded-t-3xl bg-sheet px-7.5 pt-7.5 pb-10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          shown ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {title && (
          <div className='flex flex-col gap-2'>
            <span className='text-center text-heading-3 font-semibold text-sheet-heading'>{title}</span>
            {subtitle && (
              <span className='text-center text-subheading-1 text-sheet-body'>{subtitle}</span>
            )}
          </div>
        )}

        {children}
      </div>
    </>
  )
}
