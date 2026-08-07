'use client'

import { ChevronRight, X } from 'lucide-react'
import Spinner from '@/components/shared/Spinner'
import { primaryButtonClass } from '@/components/shared/Card'
import StepProgress from './StepProgress'

// Every question in the create flow is this: cancel top-left, an optional skip
// top-right, the headline near the top, and the answer card, the button and the
// step dots stacked at the bottom.
export default function CreateStepLayout({
  headline,
  onCancel,
  onSkip,
  onPrimary,
  primaryLabel = 'weiter',
  primaryDisabled = false,
  busy = false,
  pinnedControls = true,
  stepCount,
  currentStep,
  onSelectStep,
  children,
}: {
  headline: string
  onCancel: () => void
  onSkip?: () => void
  onPrimary: () => void
  primaryLabel?: string
  primaryDisabled?: boolean
  busy?: boolean
  /** Off for a step long enough that a pinned bar would sit on top of its answer
   *  (the backgrounds): the button and the dots then scroll at the end of the page. */
  pinnedControls?: boolean
  stepCount: number
  currentStep: number
  onSelectStep: (index: number) => void
  children: React.ReactNode
}) {
  const controls = (
    <>
      <button
        type='button'
        onClick={onPrimary}
        disabled={primaryDisabled || busy}
        // 22px is the gap a pinned step already has: `pb-safe-step` (136px) minus the
        // strip's own height (50 button + 24 + 8 dots + 32 inset = 114). Matching it
        // keeps the button the same distance from the answer either way.
        className={`${primaryButtonClass} ${pinnedControls ? '' : 'mt-5.5'}`}
      >
        {busy ? <Spinner /> : primaryLabel}
      </button>

      <div className='mt-6 flex justify-center'>
        <StepProgress count={stepCount} current={currentStep} onSelect={onSelectStep} />
      </div>
    </>
  )

  // No background of its own: CreatePartyScreen paints it once, below every step, so
  // the floating emojis survive the switch from one question to the next.
  return (
    <div className='relative w-full min-h-dvh'>
      {/* The page itself scrolls; only the controls are pinned, and their strips are
          transparent so the answer passes behind them rather than under a black bar.
          The skip rides along with ✕ so the two cannot drift apart mid-scroll. */}
      <div className='fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-7.5'>
        <button
          type='button'
          onClick={onCancel}
          aria-label='Abbrechen'
          className='flex h-11.25 w-11.25 items-center justify-center rounded-full bg-secondary backdrop-blur-xl transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'
        >
          <X size={22} strokeWidth={3} className='text-white' />
        </button>

        {/* Only the optional questions get a skip. */}
        {onSkip && (
          <button
            type='button'
            onClick={onSkip}
            className='flex h-11.25 items-center gap-1 rounded-full bg-secondary backdrop-blur-xl px-5 text-button text-label-large transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'
          >
            skip
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* pt clears the pinned header (30px inset + its 45px button + the 30px gap
          the headline always had above it). */}
      <div
        className={`relative z-10 flex min-h-dvh flex-col px-4 pt-26.25 ${
          pinnedControls ? 'pb-safe-step' : 'pb-safe-rsvp'
        }`}
      >
        {/* The bottom margin keeps the headline clear of the answer on a step tall
            enough to have swallowed all the free space above it.
            The key re-mounts it on every step so the entry animation replays —
            this layout itself stays mounted across the whole flow, so without one
            React would only swap the text. The ANSWER below deliberately does not
            animate: its cards are `backdrop-blur-xl`, and an ancestor animating
            opacity or transform becomes their backdrop root, which would leave them
            flat and unblurred over the emojis for the animation's full duration. */}
        <span
          key={headline}
          className='mb-7.5 animate-fade-in-up text-center text-heading-2 font-bold text-heading'
        >
          {headline}
        </span>

        {/* Short steps keep their answer at the bottom; a long one simply grows the
            page and scrolls. */}
        <div className='mt-auto flex w-full flex-col gap-3'>{children}</div>

        {!pinnedControls && controls}
      </div>

      {pinnedControls && (
        <div className='fixed inset-x-0 bottom-0 z-20 px-4 pb-safe-rsvp'>{controls}</div>
      )}
    </div>
  )
}
