'use client'

import { useRouter } from 'next/navigation'
import SettingsPage from './components/SettingsPage'

// Both legal pages are the same page with different words, so the text is a prop.
// Everything here is placeholder copy meant to be replaced with the real document.
//
// No session check: these two are the only screens in the app that have to render
// for someone WITHOUT an account. An Impressum has to be reachable without signing
// in, and the page a guest reads before agreeing to anything cannot sit behind the
// agreement — so /impressum and /datenschutz live at the app root rather than under
// /profile, and proxy.ts lets both through unauthenticated.
export default function LegalTextScreen({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  const router = useRouter()

  // The page is reached from three directions — the profile's 'Rechtliches' list, a
  // link on the auth screen, and a typed URL — and only the visitor's own history
  // knows which. Going back one step lands correctly in all three; a fixed href
  // would send a signed-out reader to /profile and bounce them into the login.
  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push('/')
  }

  return (
    <SettingsPage title={title} onBack={goBack} fill>
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
