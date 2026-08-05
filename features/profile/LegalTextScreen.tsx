'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import SettingsPage from './components/SettingsPage'

// Both legal pages are the same page with different words, so the text is a prop.
// Everything here is placeholder copy meant to be replaced with the real document.
export default function LegalTextScreen({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
    })
  }, [router])

  return (
    <SettingsPage title={title} backHref='/profile/legal' fill>
      <div className='flex flex-col gap-4'>
        {paragraphs.map((paragraph, i) => (
          <p key={i} className='text-subheading-1 text-label-large'>
            {paragraph}
          </p>
        ))}
      </div>
    </SettingsPage>
  )
}
