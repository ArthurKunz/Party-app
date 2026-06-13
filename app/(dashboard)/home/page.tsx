'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function HomePlaceholderPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDeleteAccount = async () => {
    const { error } = await supabase.rpc('delete_self')
    if (error) {
      alert(error.message)
      return
    }

    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background-main px-4'>
      <div className='max-w-md rounded-2xl border border-border bg-background-secondary p-8 text-center shadow-lg'>
        <span className='mb-3 block text-2xl font-semibold text-headline'>
          Willkommen bei Student Connect
        </span>
        <span className='mb-6 block text-sm text-subheadline'>
          Dein Account und dein Profil sind erfolgreich erstellt.
          Die nächsten Funktionen des Dashboards sind noch in Arbeit.
        </span>
        <Link
          href='/create-event'
          className='mb-3 block w-full rounded-xl bg-background-button px-4 py-2.5 text-center text-sm font-semibold text-button'
        >
          Party erstellen
        </Link>
        <button
          type='button'
          onClick={handleLogout}
          className='w-full rounded-xl bg-brand-pink px-4 py-2.5 text-sm font-semibold text-body hover:bg-brand-pink/90'
        >
          Ausloggen
        </button>
        <button
          type='button'
          onClick={handleDeleteAccount}
          className='mt-3 w-full rounded-xl border border-red-500/40 bg-transparent px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10'
        >
          Account löschen
        </button>
      </div>
    </div>
  )
}