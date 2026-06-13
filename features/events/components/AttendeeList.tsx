'use client'

import { calculateAge, getInitials } from '@/lib/utils'
import type { Attendee } from '../types/events.types'

export default function AttendeeList({ attendees }: { attendees: Attendee[] }) {
  return (
    <div>
      <h2 className='text-xs font-semibold uppercase tracking-wide text-white/50'>
        Teilnehmer ({attendees.length})
      </h2>
      <div className='mt-2 flex flex-col gap-2'>
        {attendees.length === 0 ? (
          <p className='py-4 text-center text-sm text-white/40'>Noch keine Zusagen.</p>
        ) : (
          attendees.map((a) => (
            <div key={a.user_id} className='flex items-center gap-3 rounded-xl bg-white/5 p-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white'>
                {getInitials(a.firstname, a.lastname)}
              </div>
              <div className='min-w-0'>
                <p className='truncate text-sm font-medium text-white'>
                  {[a.firstname, a.lastname].filter(Boolean).join(' ') || 'Unbekannt'}
                </p>
                {a.birthday && <p className='text-xs text-white/50'>{calculateAge(a.birthday)} Jahre</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
