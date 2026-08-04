'use client'

import { useEffect, useState } from 'react'

// Decorative background layer: bare party emojis (no circle behind them) drifting
// from below the viewport to above it.
const EMOJIS = [
  '🎈', '🎉', '🥳', '🎂', '🎁', '🍾', '🥂', '🪩', '✨', '🎵', '🎶', '🎤', '💃', '🕺',
  '😁', '🤣', '😂', '😍', '😜', '🤪', '😲', '😉', '👥', '🥃', '🍺', '🍷', '🍻', '🍸',
  '🎸', '🎫', '🎟️', '❤️', '🔞', '🔊',
]

const MIN_SIZE = 40
const MAX_SIZE = 60
const MIN_DURATION = 20
const MAX_DURATION = 35
const SPAWN_INTERVAL = 5000

type Floater = {
  id: number
  emoji: string
  left: number
  size: number
  duration: number
  expires: number
}

// Transparent at the very top and bottom of the viewport, fully opaque in between:
// an emoji is invisible as it enters and has faded out again before it leaves.
const EDGE_FADE = 'linear-gradient(to bottom, transparent 0%, #000 14%, #000 84%, transparent 100%)'

const random = (min: number, max: number) => min + Math.random() * (max - min)

function makeFloater(id: number): Floater {
  const duration = random(MIN_DURATION, MAX_DURATION)
  return {
    id,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    left: random(-2, 96),
    size: random(MIN_SIZE, MAX_SIZE),
    duration,
    expires: Date.now() + duration * 1000,
  }
}

// `active` is the page's "content is ready" flag: nothing spawns while the skeletons
// are up, so the screen starts empty and fills from the bottom as the page settles.
export default function FloatingEmojis({ active }: { active: boolean }) {
  // Empty on the server too: everything here is random, so it can only be built
  // after mount — otherwise the markup would not match and hydration would fail.
  const [floaters, setFloaters] = useState<Floater[]>([])

  useEffect(() => {
    if (!active) return

    let nextId = 0
    const spawn = () => {
      const now = Date.now()
      // Emojis that have left the screen are dropped on the same tick, so the DOM
      // settles at a handful of nodes instead of growing without bound.
      setFloaters((prev) => [...prev.filter((f) => f.expires > now), makeFloater(nextId++)])
    }

    // The first one comes from a frame callback rather than straight from the effect
    // body, which would be a synchronous setState (cascading render, and a lint error).
    const first = requestAnimationFrame(spawn)
    const interval = setInterval(spawn, SPAWN_INTERVAL)

    return () => {
      cancelAnimationFrame(first)
      clearInterval(interval)
    }
  }, [active])

  return (
    <>
      {/* The mask fades the emojis themselves out towards both edges instead of
          laying a black gradient over them, so they also fade correctly where they
          pass behind a card, and they never pop in or out at the screen edge. */}
      <div
        aria-hidden='true'
        className='pointer-events-none fixed inset-0 z-0 overflow-hidden'
        style={{
          maskImage: EDGE_FADE,
          WebkitMaskImage: EDGE_FADE,
        }}
      >
        {floaters.map(({ id, emoji, left, size, duration }) => (
          <span
            key={id}
            className='absolute top-0 flex items-center justify-center leading-none animate-float-up'
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              animationDuration: `${duration}s`,
              // No circle behind them any more, so the emoji itself carries the size.
              fontSize: size,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Colourless veil sitting between the emojis and the page content: it blurs
          what is painted BELOW it (the emojis), while everything above — cards,
          buttons, tabs — stays sharp. */}
      <div aria-hidden='true' className='pointer-events-none fixed inset-0 z-[1] backdrop-blur-xs' />
    </>
  )
}
