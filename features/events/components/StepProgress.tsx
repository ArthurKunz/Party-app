'use client'

interface StepProgressProps {
  count: number
  current: number
  onSelect: (index: number) => void
}

// Dots only — no pill behind them — and every dot is tappable, so a step can be
// revisited without walking back through the flow.
export default function StepProgress({ count, current, onSelect }: StepProgressProps) {
  return (
    <div className='flex items-center justify-center gap-2'>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type='button'
          onClick={() => onSelect(i)}
          aria-label={`Frage ${i + 1}`}
          aria-current={i === current}
          className={`h-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            i === current ? 'w-6 bg-white' : 'w-2 bg-white/30 backdrop-blur-xl'
          }`}
        />
      ))}
    </div>
  )
}
