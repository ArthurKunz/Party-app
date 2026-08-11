import Link from 'next/link'
import { House } from 'lucide-react'
import StatusScreen, { statusButtonClass } from '@/components/shared/StatusScreen'

// The root not-found catches both notFound() from a segment and any URL the app
// has no route for.
export default function NotFound() {
  return (
    <StatusScreen
      emoji='🫥'
      title='Hier ist nichts los'
      text='Diese Seite gibt es nicht. Vielleicht wurde die Party gelöscht oder der Link stimmt nicht ganz.'
    >
      {/* '/' rather than '/parties': the root page is what decides between the
          party list, onboarding and login. */}
      <Link href='/' className={statusButtonClass}>
        <House size={20} strokeWidth={2.5} />
        zur Startseite
      </Link>
    </StatusScreen>
  )
}
