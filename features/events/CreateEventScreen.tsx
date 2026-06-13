'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { generateInviteCode } from '@/lib/utils'
import { createEvent } from './services/events.service'
import CreateEventForm from './components/CreateEventForm'
import type { CreateEventFormValues } from './types/events.types'

const CIRCLES = [
  { color: '#161BFA', radius: 700 },
  { color: '#5684FF', radius: 630 },
  { color: '#AE4FFF', radius: 560 },
  { color: '#A336FF', radius: 490 },
  { color: '#D47AFF', radius: 420 },
  { color: '#E224A1', radius: 350 },
  { color: '#FF0090', radius: 280 },
]

export default function CreateEventScreen() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else setUserId(session.user.id)
    })
  }, [router])

  const handleSubmit = async (values: CreateEventFormValues) => {
    if (!userId) return
    setLoading(true)

    const invite_code = generateInviteCode()
    const event_date = `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:00`
    const max_guests = values.max_guests ? parseInt(values.max_guests, 10) : null

    const { error } = await createEvent({
      host_id: userId,
      title: values.title.trim(),
      description: values.description.trim() || null,
      invite_code,
      event_date,
      location: values.location.trim(),
      max_guests,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    router.push(`/parties`)
  }

  if (!userId) return null

  return (
    <div className='relative w-screen h-screen overflow-hidden bg-background-main'>
      <div className='absolute inset-0 overflow-hidden'>
        {CIRCLES.flatMap(({ color, radius }) => {
          const size = radius * 2
          const bottom = -(200 + radius)
          return [
            <div
              key={`L-${color}`}
              className='absolute rounded-full'
              style={{ backgroundColor: color, width: size, height: size, bottom, left: -radius }}
            />,
            <div
              key={`R-${color}`}
              className='absolute rounded-full'
              style={{ backgroundColor: color, width: size, height: size, bottom, right: -radius }}
            />,
          ]
        })}
      </div>

      <div className='absolute inset-0 bg-background-main/10 backdrop-blur-[80px]' />

      <div className='relative z-10 w-full h-full overflow-y-auto'>
        <div className='flex min-h-full items-center justify-center px-6 py-12'>
          <div className='w-full max-w-sm'>
            <CreateEventForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}
