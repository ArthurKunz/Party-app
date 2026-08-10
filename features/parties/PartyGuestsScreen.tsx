'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { alertError, calculateAge } from '@/lib/utils'
import Avatar from '@/components/shared/Avatar'
import SettingsPage from '@/features/profile/components/SettingsPage'
import { getPartyById, getPartyAttendees, deleteRsvp } from './services/parties.service'
import type { Attendee } from './types/parties.types'

const STATUS_LABEL = {
  host: { label: 'Gastgeber', icon: '👑', color: 'bg-host/50' },
  going: { label: 'zugesagt', icon: '✅', color: 'bg-success/50' },
  maybe: { label: 'vielleicht', icon: '🤔', color: 'bg-maybe/50' },
  not_going: { label: 'abgesagt', icon: '❌', color: 'bg-warning/50' },
} as const

export default function PartyGuestsScreen({
  partyId,
  fromEdit = false,
}: {
  partyId: string
  /** Set when the ?from=edit link on the edit screen was used. */
  fromEdit?: boolean
}) {
  const router = useRouter()
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return
      if (!session) {
        router.push('/login')
        return
      }
      const party = await getPartyById(partyId)
      if (cancelled) return
      if (!party || party.host_id !== session.user.id) {
        router.push(`/parties/${partyId}`)
        return
      }
      const data = await getPartyAttendees(partyId)
      if (cancelled) return
      setAttendees(data)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [partyId, router])

  const handleRemove = async (guest: Attendee) => {
    const name = [guest.firstname, guest.lastname].filter(Boolean).join(' ') || 'Diesen Gast'
    // Worth naming out loud: removing is not a ban. The invite link keeps working,
    // and there is no blocklist in the app.
    if (!confirm(`${name} aus der Party entfernen?\n\nDer Einladungslink funktioniert weiter — die Person könnte erneut zusagen.`)) return

    setRemoving(guest.user_id)
    const { error } = await deleteRsvp(partyId, guest.user_id)
    if (error) {
      setRemoving(null)
      alertError('Der Gast konnte nicht entfernt werden.', error.message)
      return
    }
    setAttendees((prev) => prev.filter((a) => a.user_id !== guest.user_id))
    setRemoving(null)
  }

  // Back retraces the way in: from the ••• menu straight to the party, from the edit
  // screen back to it. There is no guessing from history — a reload or a shared link
  // has none, and the button would then lead somewhere the visitor has never been.
  return (
    <SettingsPage
      title='Gäste'
      fill
      backHref={fromEdit ? `/parties/${partyId}/edit` : `/parties/${partyId}`}
    >
      {loading ? (
        // The guest row it stands in for: a 50px circle, two lines of text beside it
        // and the status pill on the right — same py-3 and same hairline, so the list
        // does not jump when the names land.
        <div className='flex flex-col'>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i}>
              <div className='flex items-center gap-3 py-3'>
                <div className='h-12.5 w-12.5 shrink-0 rounded-full skeleton' />
                <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
                  <div className='h-3.5 w-32 rounded-full skeleton' />
                  <div className='h-3 w-20 rounded-full skeleton' />
                </div>
                <div className='h-7.5 w-24 shrink-0 rounded-full skeleton' />
              </div>
              {i < 4 && (
                <div className='flex items-center gap-3'>
                  <div className='w-12.5 shrink-0' />
                  <div className='h-0.25 flex-1 rounded-full bg-[#161616]' />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Safe to animate, unlike the cards elsewhere in this flow: nothing in a
        // guest row carries backdrop-blur, so an animating ancestor cannot flatten it.
        <div className='flex flex-col animate-fade-in-up'>
          {attendees.map((a, i) => {
            const status = STATUS_LABEL[a.status]
            // The host has no remove button: throwing yourself out of your own party
            // is not a thing, and the row would only ever fail against RLS anyway.
            const removable = a.status !== 'host'
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

                  <span className={`flex shrink-0 items-center gap-1.5 rounded-full h-7.5 px-2.5 text-label-2 text-heading ${status.color}`}>
                    <span>{status.icon}</span>
                    {status.label}
                  </span>

                  {removable && (
                    // A minus, not a cross: ✕ already means 'abgesagt' everywhere else
                    // in this app, and a second ✕ with a different meaning would read
                    // as the guest having declined.
                    <button
                      type='button'
                      onClick={() => handleRemove(a)}
                      disabled={removing !== null}
                      aria-label={`${[a.firstname, a.lastname].filter(Boolean).join(' ')} entfernen`}
                      className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-warning/60 bg-warning/15 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-90 disabled:opacity-40'
                    >
                      <Minus size={16} strokeWidth={3} className='text-warning' />
                    </button>
                  )}
                </div>

                {i < attendees.length - 1 && (
                  <div className='flex items-center gap-3'>
                    <div className='w-12.5 shrink-0' />
                    <div className='h-0.25 flex-1 rounded-full bg-[#161616]' />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </SettingsPage>
  )
}
