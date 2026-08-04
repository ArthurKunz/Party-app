import { TriangleAlert } from 'lucide-react'

// Fires for the last 10% of the places: 5 left of 50, 2 left of 20, and so on.
const WARN_RATIO = 0.1

// Shared with the stats row, which paints its "Max. Gäste" value red on the same
// condition — the threshold must not live in two places.
export const isNearlyFull = (going: number, maxGuests: number | null): boolean =>
  maxGuests != null && maxGuests - going <= maxGuests * WARN_RATIO

export default function CapacityWarning({ going, maxGuests }: { going: number; maxGuests: number | null }) {
  if (maxGuests == null || !isNearlyFull(going, maxGuests)) return null

  const remaining = Math.max(0, maxGuests - going)
  const message =
    remaining === 0
      ? 'Keine Plätze mehr frei.'
      : remaining === 1
        ? 'Nur noch 1 Platz frei.'
        : `Nur noch ${remaining} Plätze frei.`

  return (
    // border-border is the app's 0.75px hairline width (globals.css).
    <div className='flex w-full items-center justify-center gap-2 rounded-xl border-border border-warning/60 bg-warning/15 py-3'>
      <TriangleAlert size={18} strokeWidth={2} className='text-warning' />
      <span className='text-subheading-1 text-warning'>{message}</span>
    </div>
  )
}
