'use client'

import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

const ChevronRightIcon = <ChevronRight size={24} strokeWidth={3} className='text-heading' />

export default function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className='w-full flex flex-col'>
      <button
        type='button'
        onClick={onToggle}
        aria-expanded={open}
        className='flex items-center gap-0.5 w-full'
      >
        <span className='text-heading-4 text-heading font-semibold'>{title}</span>
        <span className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>
          {ChevronRightIcon}
        </span>
      </button>
      {/* 0fr → 1fr animates to the content's natural height without having to measure it. */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className='overflow-hidden'>
          <div className='pt-4'>{children}</div>
        </div>
      </div>
    </div>
  )
}
