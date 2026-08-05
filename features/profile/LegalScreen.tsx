'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import SettingsPage, { cardClass, rowClass, rowLabelClass, rowValueClass } from './components/SettingsPage'

export default function LegalScreen() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
    })
  }, [router])

  return (
    <SettingsPage title='Rechtliches'>
      <div className={cardClass}>
        <div className={rowClass}>
          <span className={rowLabelClass}>Impressum</span>
          <span className={`ml-auto ${rowValueClass}`}>folgt</span>
        </div>
      </div>

      <div className={cardClass}>
        <div className={rowClass}>
          <span className={rowLabelClass}>Datenschutzerklärung</span>
          <span className={`ml-auto ${rowValueClass}`}>folgt</span>
        </div>
      </div>
    </SettingsPage>
  )
}
