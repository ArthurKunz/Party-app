'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Event description clamped to 3 lines. If it overflows, a '… Mehr anzeigen'
 * button sits at the end of the third line; expanded, a 'Weniger anzeigen'
 * button sits below the full text. Expanding animates the height between the
 * two measured pixel values.
 */
export default function EventDescription({ text }: { text: string }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null)
  const [fullHeight, setFullHeight] = useState(0)

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    // Only measurable while clamped — scrollHeight is the unclamped height.
    setOverflowing(el.scrollHeight > el.clientHeight + 1)
    setCollapsedHeight(el.clientHeight)
  }, [text])

  // Once measured, the box's max-height does the clipping instead of the clamp,
  // so the same three lines stay visible but the height can be animated.
  const clamped = collapsedHeight === null
  const maxHeight = !overflowing ? undefined : expanded ? fullHeight : (collapsedHeight ?? undefined)

  const expand = () => {
    if (boxRef.current) setFullHeight(boxRef.current.scrollHeight)
    setExpanded(true)
  }

  return (
    <div className='relative w-full flex flex-col'>
      <div
        ref={boxRef}
        style={{ maxHeight }}
        className='overflow-hidden transition-[max-height] duration-300 ease-out motion-reduce:transition-none'
      >
        <p
          ref={textRef}
          className={`text-body text-body-1 whitespace-pre-line ${clamped ? 'line-clamp-3' : ''}`}
        >
          {text}
        </p>
      </div>
      {/* Sits outside the animated box so it stays on line 3 while the box grows.
          top = collapsed height, then pulled up by its own single line height. */}
      {overflowing && (
        <button
          type='button'
          onClick={expand}
          tabIndex={expanded ? -1 : 0}
          aria-hidden={expanded}
          style={{ top: collapsedHeight ?? 0 }}
          className={`absolute right-0 -translate-y-full flex items-center bg-main text-body-1 transition-opacity duration-200 motion-reduce:transition-none ${
            expanded ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <span className='absolute right-full h-full w-8 bg-gradient-to-r from-transparent to-main' />
          <span className='text-body'>…&nbsp;</span>
          <span className='text-link font-medium'>Mehr anzeigen</span>
        </button>
      )}
      {/* 0fr → 1fr keeps the button in sync with the text's own height animation. */}
      {overflowing && (
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
            expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className='overflow-hidden'>
            <button
              type='button'
              onClick={() => setExpanded(false)}
              tabIndex={expanded ? 0 : -1}
              aria-hidden={!expanded}
              className='mt-1 text-body-1 font-medium text-link'
            >
              Weniger anzeigen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
