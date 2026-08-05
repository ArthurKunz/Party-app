'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import FloatingEmojis from '@/features/events/components/FloatingEmojis'

// Shared by every profile sub-page: emoji background, back button, centred title,
// and content pinned to the bottom of the screen with the save button under it.
// The card and row styles live in components/shared/Card so the create-event flow
// uses the very same ones; they are re-exported here for the existing importers.
export {
  cardClass,
  rowClass,
  rowLabelClass,
  rowValueClass,
  rowInputClass,
  RowDivider,
} from '@/components/shared/Card'
export { primaryButtonClass as saveButtonClass } from '@/components/shared/Card'

export default function SettingsPage({
  title,
  children,
  fill = false,
  backHref = '/profile',
}: {
  title: string
  children: React.ReactNode
  // Sub-sub-pages (the legal texts) go back to their list, not all the way home.
  backHref?: string
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
            onClick={() => router.push(backHref)}
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
