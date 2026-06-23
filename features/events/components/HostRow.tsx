'use client'

import { getInitials } from '@/lib/utils'
import type { EventHost } from '../types/events.types'

export default function HostRow({ host }: { host: EventHost | null }) {
  const name = [host?.firstname, host?.lastname].filter(Boolean).join(' ') || 'Unbekannt'
  return (
    <div className='flex items-center gap-2'>
      <div
        className='flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-[9px] font-semibold text-body ring-1 ring-glass'
        style={{ backgroundColor: host?.avatar_color ?? '#2A2A2A' }}
      >
        {host?.avatar_url ? (
          <img src={host.avatar_url} alt='' className='h-full w-full object-cover' />
        ) : (
          getInitials(host?.firstname ?? null, host?.lastname ?? null)
        )}
      </div>
      <span className='text-sm text-headline'>{name}</span>
    </div>
  )
}
