import FloatingEmojis from '@/features/parties/components/FloatingEmojis'

// The full-page shell behind not-found and error: the parties list's empty state,
// blown up to a whole screen. Shared because the two pages differ only in their
// emoji, their words and their buttons.
export const statusButtonClass =
  'flex h-50 items-center gap-2 rounded-full bg-sheet px-6 text-button font-semibold text-sheet-heading transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'

export default function StatusScreen({
  emoji,
  title,
  text,
  children,
}: {
  emoji: string
  title: string
  text: string
  children: React.ReactNode
}) {
  return (
    <div className='relative flex h-dvh w-full flex-col items-center justify-center gap-8 overflow-hidden bg-main'>
      <FloatingEmojis active seed />

      {/* Above the drifting emojis, which are decoration and sit at the back. */}
      <div className='relative flex flex-col items-center gap-8'>
        <span className='text-6xl'>{emoji}</span>

        <div className='flex w-75 flex-col items-center gap-1 px-4 text-center'>
          <span className='font-semibold text-heading-4 text-heading'>{title}</span>
          <span className='text-label-2 text-subheading'>{text}</span>
        </div>

        <div className='flex flex-col items-center gap-4'>{children}</div>
      </div>
    </div>
  )
}
