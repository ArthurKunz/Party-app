'use client'

import { useState } from 'react'
import type { PartyWithCount } from '../types/parties.types'

export default function PartyCard({
  party,
  isHost = false,
  featured = false,
}: {
  party: PartyWithCount
  isHost?: boolean
  featured?: boolean
}) {
  const hostName = [party.host_firstname, party.host_lastname].filter(Boolean).join(' ')
  // Same pattern as the detail page hero: shimmer until the image is decoded, then cross-fade.
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <div className='flex flex-col gap-2 pb-1.5 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]'>
      <div
        className={`relative overflow-hidden rounded-lg bg-secondary backdrop-blur-xl ${
          featured ? 'aspect-[2/1]' : 'aspect-square'
        }`}
      >
        {party.background_url && (
          <>
            <img
              src={party.background_url}
              alt=''
              aria-hidden='true'
              onLoad={() => setImgLoaded(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {!imgLoaded && <div className='absolute inset-0 skeleton' />}
          </>
        )}
      </div>

      <div className='flex flex-col min-w-0'>
        <span className='truncate font-md text-label-1 text-label-large'>
          {party.title}
        </span>
        {!isHost && (
          <span className='truncate text-label-2 text-label-small'>von {hostName || 'Unbekannt'}</span>
        )}
      </div>
    </div>
  )
}
