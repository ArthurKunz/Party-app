'use client'

import { calculateAge, getInitials } from '@/lib/utils'
import type { Attendee } from '../types/events.types'

export default function AttendeeList({ attendees }: { attendees: Attendee[] }) {
  return (
    <div className='flex flex-col gap-2'>
      {attendees.length === 0 ? (
        <span className='block py-4 text-center text-sm text-hint'>Noch keine Zusagen.</span>
      ) : (
        attendees.map((a) => (
          <div key={a.user_id} className='flex items-center gap-3 rounded-2xl border border-border bg-background-secondary p-3'>
            <div
              className='flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-body'
              style={{ backgroundColor: a.avatar_color ?? '#2A2A2A' }}
            >
              {a.avatar_url ? (
                <img src={a.avatar_url} alt='' className='h-full w-full object-cover' />
              ) : (
                getInitials(a.firstname, a.lastname)
              )}
            </div>
            <div className='min-w-0 flex-1'>
              <span className='block truncate text-sm font-medium text-body'>
                {[a.firstname, a.lastname].filter(Boolean).join(' ') || 'Unbekannt'}
              </span>
              {a.birthday && (
                <span className='block text-xs text-hint'>{calculateAge(a.birthday)} Jahre</span>
              )}
            </div>
            <span className={`shrink-0 text-xs ${a.status === 'going' ? 'text-success' : a.status === 'maybe' ? 'text-maybe' : 'text-warning'}`}>
              {a.status === 'going' ? 'zugesagt' : a.status === 'maybe' ? 'vielleicht' : 'abgesagt'}
            </span>
          </div>
        ))
      )}
    </div>
  )
}
