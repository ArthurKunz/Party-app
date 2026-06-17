'use client'

import { useState, useEffect, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { generateInviteCode } from '@/lib/utils'
import DateTimePicker from './components/DateTimePicker'
import StepProgress from './components/StepProgress'
import { createEvent } from './services/events.service'
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

const inputClass =
  'w-full px-4 h-14 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'

type StepId = 'name' | 'description' | 'when' | 'location' | 'guests' | 'done'

const STEPS: StepId[] = ['name', 'when', 'location', 'guests', 'description', 'done']
const QUESTION_COUNT = STEPS.length - 1

const HEADLINES: Record<StepId, string> = {
  name: 'Wie nennst du deine Party?',
  description: 'Worum geht es?',
  when: 'Wann steigt die Party?',
  location: 'Wo findet sie statt?',
  guests: 'Wie viele Gäste?',
  done: 'Deine Party ist bereit! 🎉',
}

export default function CreateEventScreen() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')
  const [step, setStep] = useState<StepId>('name')
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [values, setValues] = useState<CreateEventFormValues>({
    title: '',
    description: '',
    day: '',
    month: '',
    year: '',
    hour: '',
    minute: '',
    location: '',
    max_guests: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else setUserId(session.user.id)
    })
  }, [router])

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const stepIndex = STEPS.indexOf(step)
  const shareLink = inviteCode ? `${origin}/e/${inviteCode}` : ''

  const setField = (field: keyof CreateEventFormValues, value: string) =>
    setValues((v) => ({ ...v, [field]: value }))

  const canContinue = (() => {
    switch (step) {
      case 'name':
        return values.title.trim().length > 0
      case 'when':
        return Boolean(values.day && values.month && values.year && values.hour && values.minute)
      case 'location':
        return values.location.trim().length > 0
      default:
        return true
    }
  })()

  const handleCreate = async () => {
    if (!userId || creating) return
    setCreating(true)

    const code = generateInviteCode()
    const event_date = `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:00`
    const max_guests = values.max_guests ? parseInt(values.max_guests, 10) : null

    const { error } = await createEvent({
      host_id: userId,
      title: values.title.trim(),
      description: values.description.trim() || null,
      invite_code: code,
      event_date,
      location: values.location.trim(),
      max_guests,
    })

    if (error) {
      alert(error.message)
      setCreating(false)
      return
    }

    setInviteCode(code)
    setCreated(true)
    setCreating(false)
    setStep('done')
  }

  const handleNext = () => {
    if (step === 'description') {
      handleCreate()
      return
    }
    setStep(STEPS[stepIndex + 1])
  }

  const handleSelectStep = (index: number) => {
    if (created || index >= stepIndex) return
    setStep(STEPS[index])
  }

  const handleEnterAdvance = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !canContinue) return
    e.preventDefault()
    handleNext()
  }

  const handleTextareaEnterAdvance = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    handleNext()
  }

  const handleCopy = async () => {
    if (!shareLink) return
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!userId) return null

  return (
    <div className='relative w-screen h-screen overflow-hidden bg-background-main'>
      <div className='fixed inset-0 overflow-hidden'>
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

      <div className='fixed inset-0 bg-background-main/10 backdrop-blur-[80px]' />

      <button
        type='button'
        onClick={() => router.push('/parties')}
        aria-label='Abbrechen'
        className='absolute top-6 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-glass bg-glass text-body backdrop-blur-xl transition-transform hover:scale-105'
      >
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <line x1='18' y1='6' x2='6' y2='18' />
          <line x1='6' y1='6' x2='18' y2='18' />
        </svg>
      </button>

      <div className='relative z-10 flex h-full flex-col items-center justify-center px-6'>
        <div className='w-full max-w-sm flex flex-col gap-10'>
          <span className='block text-center text-4xl font-bold text-headline'>
            {HEADLINES[step]}
          </span>

          {step === 'name' && (
            <div className='flex flex-col gap-2'>
              <label className='text-sm text-label'>Name</label>
              <input
                type='text'
                placeholder='z.B. Dachterrassen-Party'
                value={values.title}
                onChange={(e) => setField('title', e.target.value)}
                onKeyDown={handleEnterAdvance}
                className={inputClass}
              />
            </div>
          )}

          {step === 'description' && (
            <div className='flex flex-col gap-2'>
              <label className='text-sm text-label'>Beschreibung (optional)</label>
              <textarea
                placeholder='Was erwartet die Gäste?'
                value={values.description}
                onChange={(e) => setField('description', e.target.value)}
                onKeyDown={handleTextareaEnterAdvance}
                rows={3}
                className='w-full px-4 py-3 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder resize-none'
              />
            </div>
          )}

          {step === 'when' && (
            <DateTimePicker
              day={values.day}
              month={values.month}
              year={values.year}
              hour={values.hour}
              minute={values.minute}
              onChange={setField}
            />
          )}

          {step === 'location' && (
            <div className='flex flex-col gap-2'>
              <label className='text-sm text-label'>Ort</label>
              <input
                type='text'
                placeholder='Adresse oder Ortsname'
                value={values.location}
                onChange={(e) => setField('location', e.target.value)}
                onKeyDown={handleEnterAdvance}
                className={inputClass}
              />
            </div>
          )}

          {step === 'guests' && (
            <div className='flex flex-col gap-2'>
              <label className='text-sm text-label'>Max. Gäste (optional)</label>
              <input
                type='number'
                placeholder='z.B. 30'
                min={1}
                value={values.max_guests}
                onChange={(e) => setField('max_guests', e.target.value)}
                onKeyDown={handleEnterAdvance}
                className={inputClass}
              />
            </div>
          )}

          {step === 'done' && (
            <div className='flex flex-col gap-3'>
              <label className='text-sm text-label'>Einladungs-Link</label>
              <button
                type='button'
                onClick={handleCopy}
                className='w-full px-4 h-14 flex items-center justify-between gap-3 bg-background-input border border-border-input rounded-xl text-input text-sm'
              >
                <span className='truncate'>{shareLink}</span>
                <span className='shrink-0 text-subheadline'>{copied ? 'Kopiert ✓' : 'Kopieren'}</span>
              </button>
            </div>
          )}

          <div className='flex justify-center'>
            {step === 'done' ? (
              <button
                type='button'
                onClick={() => router.push('/parties')}
                className='h-12 rounded-full bg-background-button text-button text-sm font-semibold px-10'
              >
                Fertig
              </button>
            ) : (
              <button
                type='button'
                onClick={handleNext}
                disabled={!canContinue || creating}
                className='h-12 rounded-full bg-background-button text-button text-sm font-semibold px-10 disabled:opacity-40'
              >
                {step === 'description' ? (creating ? 'Erstellen …' : 'Party erstellen →') : 'weiter →'}
              </button>
            )}
          </div>
        </div>

        <div className='absolute bottom-8'>
          <StepProgress count={QUESTION_COUNT} current={stepIndex} onSelect={handleSelectStep} />
        </div>
      </div>
    </div>
  )
}
