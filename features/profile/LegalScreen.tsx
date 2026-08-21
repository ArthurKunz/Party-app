'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import SettingsPage, { cardClass, rowClass, rowLabelClass, RowDivider } from './components/SettingsPage'

const ChevronIcon = <ChevronRight size={20} strokeWidth={2.5} className='text-subheading' />

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
        {/* Both texts live at the app root, not under /profile: they have to render
            without a session, and proxy.ts only lets public paths through. */}
        <Link href='/impressum' className={rowClass}>
          <span className={rowLabelClass}>Impressum</span>
          <span className='ml-auto flex items-center'>{ChevronIcon}</span>
        </Link>

        <RowDivider />

        <Link href='/datenschutz' className={rowClass}>
          <span className={rowLabelClass}>Datenschutz</span>
          <span className='ml-auto flex items-center'>{ChevronIcon}</span>
        </Link>

        <RowDivider />

        <Link href='/nutzungsbedingungen' className={rowClass}>
          <span className={rowLabelClass}>Nutzungsbedingungen</span>
          <span className='ml-auto flex items-center'>{ChevronIcon}</span>
        </Link>
      </div>
    </SettingsPage>
  )
}
