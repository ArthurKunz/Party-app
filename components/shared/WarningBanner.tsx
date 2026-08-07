import { TriangleAlert } from 'lucide-react'

// The app's one warning surface: a red hairline box with a lucide TriangleAlert.
// Introduced for the "nearly full" notice on the party pages, shared from there.
export default function WarningBanner({ message }: { message: string }) {
  return (
    <div className='flex w-full items-center justify-center gap-2 rounded-xl border-border border-warning/60 bg-warning/15 backdrop-blur-xl px-4 py-3'>
      <TriangleAlert size={18} strokeWidth={2} className='text-warning shrink-0' />
      <span className='text-subheading-1 text-warning text-center'>{message}</span>
    </div>
  )
}
