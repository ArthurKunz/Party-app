'use client'

import type { ReactNode } from 'react'

const CIRCLES = [
  { color: '#161BFA', radius: 700 },
  { color: '#5684FF', radius: 630 },
  { color: '#AE4FFF', radius: 560 },
  { color: '#A336FF', radius: 490 },
  { color: '#D47AFF', radius: 420 },
  { color: '#E224A1', radius: 350 },
  { color: '#FF0090', radius: 280 },
]

export default function EventBackground({ children }: { children: ReactNode }) {
  return (
    <div className='relative w-screen min-h-screen overflow-hidden bg-background-main'>
      <div className='absolute inset-0 overflow-hidden'>
        {CIRCLES.flatMap(({ color, radius }) => {
          const size = radius * 2
          const bottom = -(200 + radius)
          return [
            <div key={`L-${color}`} className='absolute rounded-full' style={{ backgroundColor: color, width: size, height: size, bottom, left: -radius }} />,
            <div key={`R-${color}`} className='absolute rounded-full' style={{ backgroundColor: color, width: size, height: size, bottom, right: -radius }} />,
          ]
        })}
      </div>

      <div className='absolute inset-0 bg-background-main/10 backdrop-blur-[80px]' />

      <div className='relative z-10 mx-auto w-full max-w-md px-6 py-10'>{children}</div>
    </div>
  )
}
