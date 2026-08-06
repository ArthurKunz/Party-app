'use client'

import { cardClass, rowClass } from './Card'

// A labelled toggle as its own card row, shared so the create flow's switches
// cannot drift apart from one another.
export default function Switch({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className={cardClass}>
      <button
        type='button'
        onClick={() => onChange(!checked)}
        role='switch'
        aria-checked={checked}
        className={rowClass}
      >
        <span className='text-button text-label-large'>{label}</span>
        <span
          className={`ml-auto flex h-7 w-12 shrink-0 items-center rounded-full p-1 backdrop-blur-xl transition-colors duration-200 ${
            checked ? 'bg-success' : 'bg-tertiary'
          }`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-sheet transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </span>
      </button>
    </div>
  )
}
