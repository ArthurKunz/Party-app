import { getInitials } from '@/lib/utils'

// Every avatar in the app goes through here, so a profile's stored avatar_color and
// the initials' proportions cannot drift between screens.
//
// The initials are 40% of the diameter (the iOS convention) and always semibold —
// at the 24px sizes in a voter stack, regular weight is unreadable.
const INITIALS_RATIO = 0.4

// Only for a row whose profile has not loaded yet; a real profile always has a colour.
const FALLBACK_COLOR = '#2A2A2A'

export default function Avatar({
  size,
  url,
  color,
  firstname,
  lastname,
  className = '',
}: {
  size: number
  url: string | null
  color: string | null
  firstname: string | null
  lastname: string | null
  className?: string
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white/90 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * INITIALS_RATIO),
        // Transparent behind a photo: object-cover on a rounded div does not clip
        // pixel-perfectly, so a colour would leak as a ring around the image.
        backgroundColor: url ? 'transparent' : (color ?? FALLBACK_COLOR),
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt='' className='h-full w-full object-cover' />
      ) : (
        getInitials(firstname, lastname)
      )}
    </div>
  )
}
