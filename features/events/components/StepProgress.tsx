'use client'

interface StepProgressProps {
  count: number
  current: number
  onSelect: (index: number) => void
}

export default function StepProgress({ count, current, onSelect }: StepProgressProps) {
  return (
    <div className='flex items-center justify-center gap-2'>
      {Array.from({ length: count }, (_, i) => {
        const reached = i <= current
        const clickable = i < current
        return (
          <button
            key={i}
            type='button'
            disabled={!clickable}
            onClick={() => onSelect(i)}
            aria-label={`Frage ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-6' : 'w-2'
            } ${reached ? 'bg-white' : 'bg-white/30'} ${
              clickable ? 'cursor-pointer' : 'cursor-default'
            }`}
          />
        )
      })}
    </div>
  )
}
