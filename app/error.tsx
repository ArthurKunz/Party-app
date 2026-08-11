'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RotateCw } from 'lucide-react'
import StatusScreen, { statusButtonClass } from '@/components/shared/StatusScreen'

// Error boundaries have to be client components. This one wraps everything below
// the root layout; an error IN the root layout would need global-error instead.
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  // A server error reaches the client as a generic message plus a digest, so the
  // console is the only place the digest can be read back from.
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StatusScreen
      emoji='🫠'
      title='Da ist was schiefgelaufen'
      text='Die Seite konnte nicht geladen werden. Versuch es nochmal — meistens reicht das schon.'
    >
      <button type='button' onClick={() => unstable_retry()} className={statusButtonClass}>
        <RotateCw size={20} strokeWidth={2.5} />
        nochmal versuchen
      </button>

      <Link href='/' className='text-label-2 text-subheading'>
        zur Startseite
      </Link>
    </StatusScreen>
  )
}
