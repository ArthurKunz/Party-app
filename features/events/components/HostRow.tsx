'use client'

import { getInitials } from '@/lib/utils'
import type { EventHost } from '../types/events.types'

export default function HostRow({ host }: { host: EventHost | null }) {
  const name = [host?.firstname, host?.lastname].filter(Boolean).join(' ') || 'Unbekannt'
  return (
    <div className='mt-3 flex items-center justify-center gap-2'>
      <div className='flex h-7 w-7 items-center justify-center rounded-full bg-background-profilpicture text-xs font-semibold text-body'>
        {getInitials(host?.firstname ?? null, host?.lastname ?? null)}
      </div>
      <span className='text-sm text-headline'>{name}</span>
    </div>
  )
}
