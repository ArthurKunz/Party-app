'use client'

import { calculateAge } from '@/lib/utils'
import Avatar from '@/components/shared/Avatar'
import type { Attendee } from '../types/parties.types'

const STATUS_CONFIG = {
  going: { label: 'zugesagt', icon: '✅', color: 'bg-success/50' },
  maybe: { label: 'vielleicht', icon: '🤔', color: 'bg-maybe/50' },
  not_going: { label: 'abgesagt', icon: '❌', color: 'bg-warning/50' },
} as const

export default function AttendeeList({ attendees }: { attendees: Attendee[] }) {
  if (attendees.length === 0) {
    return <span className='block py-4 text-center text-label-2 text-label-small'>Noch keine Zusagen.</span>
  }

  return (
    <div className='flex flex-col'>
      {attendees.map((a, i) => {
        const status = STATUS_CONFIG[a.status]
        return (
          <div key={a.user_id}>
            <div className='flex items-center gap-3 py-3'>
              <Avatar size={50} url={a.avatar_url} color={a.avatar_color} firstname={a.firstname} lastname={a.lastname} />
              <div className='min-w-0 flex-1'>
                <span className='block truncate text-label-1 font-md text-heading'>
                  {[a.firstname, a.lastname].filter(Boolean).join(' ') || 'Unbekannt'}
                </span>
                {a.birthday && (
                  <span className='block text-label-2 text-label-small'>{calculateAge(a.birthday)} Jahre alt</span>
                )}
              </div>
              <span className={`flex items-center gap-1.5 rounded-full h-7.5 px-2.5 text-label-2 text-heading ${status.color}`}>
                <span>{status.icon}</span>
                {status.label}
              </span>
            </div>
            {i < attendees.length - 1 && (
              <div className='flex items-center gap-3'>
                <div className='w-12.5 shrink-0' />
                <div className='h-0.25 flex-1 bg-[#161616] rounded-full' />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
