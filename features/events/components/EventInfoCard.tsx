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

const ClockIcon = (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='9' />
    <polyline points='12 7 12 12 15 14' />
  </svg>
)

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
    <div className='flex flex-col gap-4 rounded-2xl bg-background-secondary border border-border p-5'>
      <div className='flex items-center gap-3 text-hint'>
        <span className='text-background-icon'>{ClockIcon}</span>
        <span>{formatTime(eventDate)} Uhr</span>
      </div>
      <div className='flex items-center gap-3 text-hint'>
        <span className='text-background-icon'>{CalendarIcon}</span>
        <span>{formatDate(eventDate)}</span>
      </div>
      <div className='flex items-center gap-3 text-hint'>
        <span className='text-background-icon'>{PinIcon}</span>
        <span>{location}</span>
      </div>
    </div>
  )
}
