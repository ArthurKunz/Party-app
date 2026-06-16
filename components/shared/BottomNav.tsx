'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  {
    href: '/parties',
    label: 'Meine Events',
    icon: (
      <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M5.8 11.3 2 22l10.7-3.79' />
        <path d='M4 3h.01' />
        <path d='M22 8h.01' />
        <path d='M15 2h.01' />
        <path d='M22 20h.01' />
        <path d='m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10' />
        <path d='m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17' />
        <path d='m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7' />
        <path d='M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2z' />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Mein Profil',
    icon: (
      <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
        <circle cx='12' cy='7' r='4' />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Hide on detail pages (e.g. /parties/[id]) that carry their own bottom actions
  if (/^\/parties\/.+/.test(pathname)) return null
  // Hide during the create-event flow, which has its own bottom progress bar
  if (pathname === '/create-event') return null

  return (
    <nav className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50'>
      <div className='flex items-center gap-2 rounded-full border border-glass bg-glass px-3 py-2 backdrop-blur-xl shadow-lg'>
        <Link
          href='/parties'
          aria-label='Meine Events'
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
            pathname === '/parties' ? 'bg-background-button text-button' : 'text-hint hover:text-body'
          }`}
        >
          {links[0].icon}
        </Link>

        <Link
          href='/create-event'
          aria-label='Event erstellen'
          className='flex h-12 w-12 items-center justify-center rounded-full bg-background-button text-button transition-transform hover:scale-105'
        >
          <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
            <line x1='12' y1='5' x2='12' y2='19' />
            <line x1='5' y1='12' x2='19' y2='12' />
          </svg>
        </Link>

        <Link
          href='/profile'
          aria-label='Mein Profil'
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
            pathname === '/profile' ? 'bg-background-button text-button' : 'text-hint hover:text-body'
          }`}
        >
          {links[1].icon}
        </Link>
      </div>
    </nav>
  )
}
