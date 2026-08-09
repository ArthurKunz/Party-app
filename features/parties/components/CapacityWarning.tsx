import WarningBanner from '@/components/shared/WarningBanner'

// Fires for the last 10% of the places: 5 left of 50, 2 left of 20, and so on.
const WARN_RATIO = 0.1

// Shared with the stats row, which paints its "Max. Gäste" value red on the same
// condition — the threshold must not live in two places.
export const isNearlyFull = (going: number, maxGuests: number | null): boolean =>
  maxGuests != null && maxGuests - going <= maxGuests * WARN_RATIO

// A different question from "nearly full": the banner above warns for the last 10% of
// the places, but a seat is only actually gone once every one of them is taken. The
// host counts towards `going`, so max_guests is the whole party, host included.
export const isFull = (going: number, maxGuests: number | null): boolean =>
  maxGuests != null && going >= maxGuests

export default function CapacityWarning({ going, maxGuests }: { going: number; maxGuests: number | null }) {
  if (maxGuests == null || !isNearlyFull(going, maxGuests)) return null

  const remaining = Math.max(0, maxGuests - going)
  const message =
    remaining === 0
      ? 'Keine Plätze mehr frei.'
      : remaining === 1
        ? 'Nur noch 1 Platz frei.'
        : `Nur noch ${remaining} Plätze frei.`

  return <WarningBanner message={message} />
}
