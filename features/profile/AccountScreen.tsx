'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { LogOut, Trash2 } from 'lucide-react'
import { alertError } from '@/lib/utils'
import SettingsPage, { saveButtonClass } from './components/SettingsPage'

export default function AccountScreen() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
    })
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // delete_self is a SECURITY DEFINER RPC: it removes the profile row and the auth
  // user, so the sign-out afterwards only clears the local session.
  const handleDeleteAccount = async () => {
    if (!confirm('Account wirklich löschen? Alle deine Events und Antworten gehen verloren.')) return
    const { error } = await supabase.rpc('delete_self')
    if (error) {
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
        className={`${saveButtonClass} flex items-center justify-center gap-2`}
      >
        <LogOut size={20} strokeWidth={2.5} />
        Abmelden
      </button>

      <button
        type='button'
        onClick={handleDeleteAccount}
        className={`${saveButtonClass} flex items-center justify-center gap-2 text-warning`}
      >
        <Trash2 size={20} strokeWidth={2.5} />
        Account löschen
      </button>
    </SettingsPage>
  )
}
