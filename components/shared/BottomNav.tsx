'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  {
    href: '/parties',
    label: 'Meine Events',
    icon: (
      <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
        <polyline points='9 22 9 12 15 12 15 22' />
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

  return (
    <nav className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50'>
      <div className='flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-xl shadow-lg'>
        <Link
          href='/parties'
          aria-label='Meine Events'
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
            pathname === '/parties' ? 'bg-white text-[#09090B]' : 'text-white/70 hover:text-white'
          }`}
        >
          {links[0].icon}
        </Link>

        <Link
          href='/create-event'
          aria-label='Event erstellen'
          className='flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#09090B] transition-transform hover:scale-105'
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
            pathname === '/profile' ? 'bg-white text-[#09090B]' : 'text-white/70 hover:text-white'
          }`}
        >
          {links[1].icon}
        </Link>
      </div>
    </nav>
  )
}
