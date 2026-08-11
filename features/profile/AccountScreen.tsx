'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { LogOut, Trash2 } from 'lucide-react'
import { alertError } from '@/lib/utils'
import Spinner from '@/components/shared/Spinner'
import SettingsPage, { saveButtonClass } from './components/SettingsPage'

export default function AccountScreen() {
  const router = useRouter()
  // Which of the two is running, so only that button spins and neither can be
  // pressed while the other works.
  const [pending, setPending] = useState<'signout' | 'delete' | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
    })
  }, [router])

  const handleSignOut = async () => {
    setPending('signout')
    await supabase.auth.signOut()
    router.push('/login')
  }

  // delete_self is a SECURITY DEFINER RPC: it removes the profile row and the auth
  // user, so the sign-out afterwards only clears the local session.
  const handleDeleteAccount = async () => {
    if (!confirm('Account wirklich löschen? Alle deine Partys und Antworten gehen verloren.')) return
    setPending('delete')
    const { error } = await supabase.rpc('delete_self')
    if (error) {
      setPending(null)
      alertError('Dein Account konnte nicht gelöscht werden.', error.message)
      return
    }
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <SettingsPage title='Account'>
      {/* Two standalone white pills rather than rows in one card: these are actions,
          not settings, and the destructive one should not sit inside the same box. */}
      <button
        type='button'
        onClick={handleSignOut}
        disabled={pending !== null}
        className={`${saveButtonClass} flex items-center justify-center gap-2`}
      >
        {pending === 'signout' ? <Spinner /> : <><LogOut size={20} strokeWidth={2.5} />Abmelden</>}
      </button>

      <button
        type='button'
        onClick={handleDeleteAccount}
        disabled={pending !== null}
        className={`${saveButtonClass} flex items-center justify-center gap-2 text-warning`}
      >
        {pending === 'delete' ? <Spinner /> : <><Trash2 size={20} strokeWidth={2.5} />Account löschen</>}
      </button>
    </SettingsPage>
  )
}
