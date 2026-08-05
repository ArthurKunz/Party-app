// iOS-style activity indicator for waits too short or too shapeless for a skeleton
// (a button saving, an upload running). Twelve blades around a circle, each fading
// on its own delay so the bright one appears to travel round.
//
// Colour comes from the parent's text colour (`bg-current`), so it works on the white
// pills and on the dark surfaces without a prop.
const BLADES = Array.from({ length: 12 }, (_, i) => i)

export default function Spinner({ size = 20 }: { size?: number }) {
  return (
    <span
      role='status'
      aria-label='Lädt'
      className='relative inline-block shrink-0'
      style={{ width: size, height: size }}
    >
      {BLADES.map((i) => (
        <span
          key={i}
          className='spinner-blade absolute left-1/2 top-1/2 rounded-full bg-current'
          style={{
            width: size * 0.1,
            height: size * 0.26,
            marginLeft: size * -0.05,
            marginTop: size * -0.13,
            // Rotate first, then push outwards along the blade's own axis, so all
            // twelve sit on one circle whatever the size.
            transform: `rotate(${i * 30}deg) translateY(${size * -0.32}px)`,
            animationDelay: `${(i - 12) / 12}s`,
          }}
        />
      ))}
    </span>
  )
}
