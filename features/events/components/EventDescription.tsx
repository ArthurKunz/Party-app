'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Event description clamped to 3 lines. If it overflows, a '… Mehr anzeigen'
 * button sits at the end of the third line; expanded, a 'Weniger anzeigen'
 * button sits below the full text.
 */
export default function EventDescription({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Only measurable while clamped — scrollHeight is the unclamped height.
    setOverflowing(el.scrollHeight > el.clientHeight + 1)
  }, [text])

  return (
    <div className='w-full flex flex-col gap-1'>
      <div className='relative'>
        <p
          ref={ref}
          className={`text-body text-body-1 whitespace-pre-line ${expanded ? '' : 'line-clamp-3'}`}
        >
          {text}
        </p>
        {!expanded && overflowing && (
          <button
            type='button'
            onClick={() => setExpanded(true)}
            className='absolute bottom-0 right-0 flex items-center bg-main text-body-1'
          >
            <span className='absolute right-full h-full w-8 bg-gradient-to-r from-transparent to-main' />
            <span className='text-body'>…&nbsp;</span>
            <span className='text-link font-medium'>Mehr anzeigen</span>
          </button>
        )}
      </div>
      {expanded && (
        <button
          type='button'
          onClick={() => setExpanded(false)}
          className='self-start text-body-1 font-medium text-link'
        >
          Weniger anzeigen
        </button>
      )}
    </div>
  )
}
