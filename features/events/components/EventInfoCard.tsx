'use client'

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const CalendarIcon = (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='3' y='4' width='18' height='18' rx='2' />
    <line x1='3' y1='10' x2='21' y2='10' />
    <line x1='8' y1='2' x2='8' y2='6' />
    <line x1='16' y1='2' x2='16' y2='6' />
  </svg>
)

const PinIcon = (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
    <circle cx='12' cy='10' r='3' />
  </svg>
)

export default function EventInfoCard({ eventDate, location }: { eventDate: string; location: string }) {
  return (
    <div className='grid grid-cols-2 gap-3'>
      <div className='flex flex-col gap-2 rounded-2xl border border-glass bg-glass p-4 backdrop-blur-xl'>
        <span className='text-background-icon'>{CalendarIcon}</span>
        <span className='text-sm font-medium text-body'>{formatDate(eventDate)}</span>
        <span className='text-xs text-hint'>{formatTime(eventDate)} Uhr</span>
      </div>
      <div className='flex flex-col gap-2 rounded-2xl border border-glass bg-glass p-4 backdrop-blur-xl'>
        <span className='text-background-icon'>{PinIcon}</span>
        <span className='text-sm font-medium text-body line-clamp-3'>{location}</span>
      </div>
    </div>
  )
}
