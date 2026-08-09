'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PartyPopper, Plus, User } from 'lucide-react'

const ITEMS = [
  { href: '/parties', label: 'Meine Partys', Icon: PartyPopper },
  { href: '/create-party', label: 'Party erstellen', Icon: Plus },
  { href: '/profile', label: 'Mein Profil', Icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Hide on detail pages (e.g. /parties/[id]) that carry their own bottom actions
  if (/^\/parties\/.+/.test(pathname)) return null
  // Hide on profile sub-pages (e.g. /profile/picture) that carry their own back button
  if (/^\/profile\/.+/.test(pathname)) return null
  // Hide during the create-party flow, which has its own bottom progress bar
  if (pathname === '/create-party') return null

  const activeIndex = ITEMS.findIndex((item) => item.href === pathname)

  return (
    <nav className='bottom-safe-nav fixed left-1/2 z-30 -translate-x-1/2'>
      <div className='relative flex h-12.5 items-center rounded-full bg-secondary p-1 backdrop-blur-xl'>
        {/* The highlight capsule slides between items instead of jumping per item */}
        {activeIndex >= 0 && (
          <span
            aria-hidden
            className='absolute bottom-1 left-1 top-1 w-18 rounded-full bg-tertiary backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]'
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
        )}

        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`group relative z-10 flex h-full w-18 items-center justify-center transition-colors duration-200 ${
                active ? 'text-label-large' : 'text-subheading'
              }`}
            >
              {/* Two spans so the press scale and the pop never fight over transform */}
              <span className='transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] group-active:scale-90'>
                {/* The key remounts the icon when it becomes active, which replays the pop */}
                <span key={active ? 'active' : 'idle'} className={active ? 'block animate-nav-icon-pop' : 'block'}>
                  <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
