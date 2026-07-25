'use client'

import type { ReactNode } from 'react'

export default function EventBackground({ children }: { children: ReactNode }) {
  return (
    <div className='relative w-screen min-h-screen overflow-hidden bg-background-main'>
      <div className='relative z-10 mx-auto w-full max-w-md px-6 py-10'>{children}</div>
    </div>
  )
}
