'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import FloatingEmojis from '@/features/events/components/FloatingEmojis'

// Shared by every profile sub-page: emoji background, back button, centred title,
// and content pinned to the bottom of the screen with the save button under it.
export const cardClass = 'w-full rounded-[25px] bg-secondary backdrop-blur-xl overflow-hidden'
export const rowClass = 'flex h-12.5 w-full items-center gap-3 px-4'
export const rowLabelClass = 'text-button text-label-large shrink-0'
export const rowValueClass = 'text-button text-subheading'
export const rowInputClass = `ml-auto min-w-0 flex-1 bg-transparent text-right outline-none ${rowValueClass}`
export const saveButtonClass =
  'h-12.5 w-full rounded-[25px] bg-sheet backdrop-blur-xl text-button font-semibold text-sheet-heading transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 disabled:bg-sheet/40 disabled:text-sheet-heading/60'

// Hairline between two rows, inset to start under the label rather than the edge.
export const RowDivider = () => (
  <div className='flex px-4'>
    <div className='h-[0.75px] w-full bg-white/10 backdrop-blur-xl' />
  </div>
)

export default function SettingsPage({
  title,
  children,
  fill = false,
}: {
  title: string
  children: React.ReactNode
  // Most pages hold one card just above the save button, so the whole block hugs
  // the bottom. `fill` instead gives the children the rest of the screen, for a page
  // that starts at the top and pushes its own button down with mt-auto.
  fill?: boolean
}) {
  const router = useRouter()

  return (
    <div className='relative w-full h-dvh bg-main'>
      <FloatingEmojis active />

      <div className={`relative z-10 flex flex-col px-4 pt-7.5 pb-safe-rsvp ${fill ? 'min-h-dvh' : 'h-dvh'}`}>
        <div className='relative flex items-center justify-center'>
          <button
            onClick={() => router.push('/profile')}
            aria-label='Zurück'
            className='absolute left-0 flex h-11.25 w-11.25 items-center justify-center rounded-full bg-secondary backdrop-blur-xl transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'
          >
            <ChevronLeft size={24} strokeWidth={3} className='text-white' />
          </button>
          <span className='text-heading-3 font-semibold text-heading'>{title}</span>
        </div>

        <div className={`flex w-full flex-col gap-3 ${fill ? 'mt-7.5 flex-1' : 'mt-auto'}`}>{children}</div>
      </div>
    </div>
  )
}
