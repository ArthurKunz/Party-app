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
        <Link href='/profile/legal/impressum' className={rowClass}>
          <span className={rowLabelClass}>Impressum</span>
          <span className='ml-auto flex items-center'>{ChevronIcon}</span>
        </Link>

        <RowDivider />

        <Link href='/profile/legal/datenschutz' className={rowClass}>
          <span className={rowLabelClass}>Datenschutz</span>
          <span className='ml-auto flex items-center'>{ChevronIcon}</span>
        </Link>
      </div>
    </SettingsPage>
  )
}
