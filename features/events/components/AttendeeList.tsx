'use client'

import { calculateAge, getInitials } from '@/lib/utils'
import type { Attendee } from '../types/events.types'

export default function AttendeeList({ attendees }: { attendees: Attendee[] }) {
  return (
    <div>
      <span className='block text-xs font-semibold uppercase tracking-wide text-label'>
        Teilnehmer ({attendees.length})
      </span>
      <div className='mt-3 flex flex-col gap-2'>
        {attendees.length === 0 ? (
          <span className='block py-4 text-center text-sm text-hint'>Noch keine Zusagen.</span>
        ) : (
          attendees.map((a) => (
            <div key={a.user_id} className='flex items-center gap-3 rounded-2xl border border-glass bg-glass p-3 backdrop-blur-xl'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-profilpicture text-sm font-semibold text-body'>
                {getInitials(a.firstname, a.lastname)}
              </div>
              <div className='min-w-0'>
                <span className='block truncate text-sm font-medium text-body'>
                  {[a.firstname, a.lastname].filter(Boolean).join(' ') || 'Unbekannt'}
                </span>
                {a.birthday && <span className='block text-xs text-hint'>{calculateAge(a.birthday)} Jahre</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
