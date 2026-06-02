'use client'

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
    <div className='flex min-h-screen flex-col items-center justify-center bg-primary px-4'>
      <div className='max-w-md rounded-2xl border border-border bg-secondary p-8 text-center shadow-lg'>
        <h1 className='mb-3 text-2xl font-semibold text-light-heading'>
          Willkommen bei Student Connect
        </h1>
        <p className='mb-6 text-sm text-light-subheading'>
          Dein Account und dein Profil sind erfolgreich erstellt.
          Die nächsten Funktionen des Dashboards sind noch in Arbeit.
        </p>
        <button
          type='button'
          onClick={handleLogout}
          className='w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand/90'
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