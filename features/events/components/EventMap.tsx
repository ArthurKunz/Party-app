'use client'

import { useState } from 'react'

export default function EventMap({ location }: { location: string }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  const src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(location)}`
  // The embed is cross-origin, so onLoad is the only signal we get that Google answered.
  const [loaded, setLoaded] = useState(false)

  return (
    <div className='relative overflow-hidden rounded-2xl border border-border h-33 w-full'>
      <iframe
        src={src}
        width='100%'
        height='100%'
        style={{ border: 0 }}
        loading='lazy'
        referrerPolicy='no-referrer-when-downgrade'
        onLoad={() => setLoaded(true)}
        className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {!loaded && <div className='absolute inset-0 skeleton' />}
    </div>
  )
}
