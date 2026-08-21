'use client'

import { useRouter } from 'next/navigation'
import SettingsPage from './components/SettingsPage'

// A legal document is a numbered list of sections, not a wall of paragraphs, so the
// three pages hand over their headings and the screen renders the structure.
export type LegalSection = {
  // Left out for the lead-in above the first numbered heading.
  heading?: string
  paragraphs: string[]
}

// All three legal pages are the same page with different words.
//
// No session check: these are the only screens in the app that have to render for
// someone WITHOUT an account. An Impressum has to be reachable without signing in,
// and nobody can be asked to agree to terms they must first create an account to
// read — so they live at the app root rather than under /profile, and proxy.ts lets
// them through unauthenticated.
export default function LegalTextScreen({
  title,
  sections,
  updated,
}: {
  title: string
  sections: LegalSection[]
  // The date the wording last changed. A legal text without one is hard to argue with.
  updated: string
}) {
  const router = useRouter()

  // The page is reached from four directions — the profile's 'Rechtliches' list, the
  // sign-up sheet, the footer of the auth and invite screens, and a typed URL — and
  // only the visitor's own history knows which. Going back one step lands correctly in
  // all of them; a fixed href would send a signed-out reader into the login.
  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push('/')
  }

  return (
    <SettingsPage title={title} onBack={goBack} fill>
      <div className='flex flex-col gap-6 pb-7.5'>
        <span className='text-label-2 text-label-small'>Stand: {updated}</span>

        {sections.map((section, i) => (
          <div key={i} className='flex flex-col gap-2'>
            {section.heading && (
              <span className='font-semibold text-label-1 text-heading'>{section.heading}</span>
            )}
            {section.paragraphs.map((paragraph, j) => (
              <p key={j} className='text-subheading-1 text-label-large'>
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    </SettingsPage>
  )
}
