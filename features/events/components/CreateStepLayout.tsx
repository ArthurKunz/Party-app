'use client'

import { ChevronRight, X } from 'lucide-react'
import Spinner from '@/components/shared/Spinner'
import { primaryButtonClass } from '@/components/shared/Card'
import FloatingEmojis from './FloatingEmojis'
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
  stepCount: number
  currentStep: number
  onSelectStep: (index: number) => void
  children: React.ReactNode
}) {
  return (
    <div className='relative w-full h-dvh overflow-hidden bg-main'>
      <FloatingEmojis active />

      <div className='relative z-10 flex h-dvh flex-col px-4 pt-7.5 pb-safe-rsvp'>
        <div className='flex w-full items-center justify-between'>
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

        <span className='mt-7.5 text-center text-heading-2 font-bold text-heading'>{headline}</span>

        {/* The answer sits at the bottom, above the button and the dots. */}
        <div className='mt-auto flex w-full flex-col gap-3'>{children}</div>

        <button
          type='button'
          onClick={onPrimary}
          disabled={primaryDisabled || busy}
          className={`${primaryButtonClass} mt-3`}
        >
          {busy ? <Spinner /> : primaryLabel}
        </button>

        <div className='mt-6 flex justify-center'>
          <StepProgress count={stepCount} current={currentStep} onSelect={onSelectStep} />
        </div>
      </div>
    </div>
  )
}
