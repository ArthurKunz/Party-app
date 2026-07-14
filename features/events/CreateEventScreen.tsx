'use client'

import { useState, useEffect, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { generateInviteCode } from '@/lib/utils'
import DateTimePicker from './components/DateTimePicker'
import StepProgress from './components/StepProgress'
import CreatePoolForm from './components/CreatePoolForm'
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

const BG_MAX_BYTES = 10 * 1024 * 1024

type StepId = 'name' | 'description' | 'when' | 'location' | 'guests' | 'background' | 'pools' | 'done'

const STEPS: StepId[] = ['name', 'when', 'location', 'description', 'guests', 'background', 'pools', 'done']
const QUESTION_COUNT = STEPS.length - 1

const HEADLINES: Record<StepId, string> = {
  name: 'Wie nennst du deine Party?',
  description: 'Worum geht es?',
  when: 'Wann steigt die Party?',
  location: 'Wo findet sie statt?',
  guests: 'Wie viele Gäste?',
  background: 'Hintergrundbild',
  pools: 'Umfragen hinzufügen',
  done: 'Deine Party ist bereit! 🎉',
}

export default function CreateEventScreen() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')
  const [step, setStep] = useState<StepId>('name')
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [eventId, setEventId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showPoolForm, setShowPoolForm] = useState(false)
  const [localPools, setLocalPools] = useState<Array<{ id: string; question: string; options: string[] }>>([])
  const [bgFile, setBgFile] = useState<File | null>(null)
  const [bgPreviewUrl, setBgPreviewUrl] = useState<string | null>(null)
  const [bgError, setBgError] = useState<string | null>(null)
  const [values, setValues] = useState<CreateEventFormValues>({
    title: '',
    description: '',
    day: '',
    month: '',
    year: '',
    hour: '',
    minute: '',
    location: '',
    city: '',
    max_guests: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle()
      if (!profile) {
        router.push('/onboarding')
        return
      }
      setUserId(session.user.id)
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
        return values.location.trim().length > 0 && values.city.trim().length > 0
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

    const { data, error } = await createEvent({
      host_id: userId,
      title: values.title.trim(),
      description: values.description.trim() || null,
      invite_code: code,
      event_date,
      location: `${values.location.trim()}, ${values.city.trim()}`,
      max_guests,
    })

    if (error || !data) {
      alert(error?.message ?? 'Fehler beim Erstellen')
      setCreating(false)
      return
    }

    setInviteCode(code)
    setEventId(data.id)
    setCreated(true)
    setCreating(false)
    setStep('background')
  }

  const handlePickBg = (picked: File | null) => {
    setBgError(null)
    if (!picked) return
    if (!picked.type.startsWith('image/')) {
      setBgError('Bitte ein Bild (JPG, PNG, …) auswählen.')
      return
    }
    if (picked.size > BG_MAX_BYTES) {
      setBgError('Die Datei darf höchstens 10 MB groß sein.')
      return
    }
    setBgFile(picked)
    setBgPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(picked)
    })
  }

  const handleUploadBackground = async () => {
    if (!bgFile || !eventId || !userId) {
      setStep('pools')
      return
    }
    setBgError(null)
    setUploading(true)

    const ext = bgFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg'
    const path = `${userId}/${eventId}/background.${safeExt}`

    const { error: uploadError } = await supabase.storage
      .from('event-backgrounds')
      .upload(path, bgFile, { cacheControl: '3600', upsert: true })

    if (uploadError) {
      setBgError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('event-backgrounds').getPublicUrl(path)
    await supabase.from('events').update({ background_url: urlData.publicUrl }).eq('id', eventId)

    setUploading(false)
    setStep('pools')
  }

  const handleNext = () => {
    if (step === 'guests') {
      void handleCreate()
      return
    }
    if (step === 'background') {
      void handleUploadBackground()
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
    try {
      await navigator.clipboard.writeText(shareLink)
    } catch {
      const el = document.createElement('textarea')
      el.value = shareLink
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!userId) return null

  return (
    <div className='relative w-full h-dvh overflow-hidden bg-background-main'>

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

      {step === 'pools' ? (
        <div className='relative z-10 h-full overflow-y-auto scrollbar-none px-6'>
          <div className='min-h-full flex flex-col items-center justify-center py-24'>
            <div className='w-full max-w-sm flex flex-col gap-8'>
              <span className='block text-center text-4xl font-bold text-headline'>
                {HEADLINES.pools}
              </span>
              <div className='flex flex-col gap-3'>
                {localPools.map((pool) => (
                  <div key={pool.id} className='rounded-xl bg-background-input border border-border-input px-4 py-3 flex flex-col gap-2'>
                    <span className='text-sm font-semibold text-input'>{pool.question}</span>
                    <div className='flex flex-wrap gap-1.5'>
                      {pool.options.map((opt, i) => (
                        <span key={i} className='text-xs text-subheadline bg-background-tertiary px-2.5 py-1 rounded-full'>
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {showPoolForm ? (
                  <CreatePoolForm
                    eventId={eventId!}
                    onCreated={(pool) => { setLocalPools((prev) => [...prev, pool]); setShowPoolForm(false) }}
                    onCancel={() => setShowPoolForm(false)}
                  />
                ) : (
                  <button
                    type='button'
                    onClick={() => setShowPoolForm(true)}
                    className='text-sm text-hint'
                  >
                    + Hinzufügen
                  </button>
                )}
              </div>
              {!showPoolForm && (
                <div className='flex justify-center'>
                  <button
                    type='button'
                    onClick={handleNext}
                    className='h-12 rounded-full bg-background-button text-button text-sm font-semibold px-7.5'
                  >
                    erstellen
                  </button>
                </div>
              )}
              <div className='flex justify-center'>
                <StepProgress count={QUESTION_COUNT} current={stepIndex} onSelect={handleSelectStep} />
              </div>
            </div>
          </div>
        </div>
      ) : (
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
                  placeholder='z.B. Hausparty'
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
              <div className='flex flex-col gap-3'>
                <div className='flex flex-col gap-2'>
                  <label className='text-sm text-label'>Straße & Hausnummer</label>
                  <input
                    type='text'
                    placeholder='z.B. Musterstraße 14'
                    value={values.location}
                    onChange={(e) => setField('location', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className='flex flex-col gap-2'>
                  <label className='text-sm text-label'>Stadt</label>
                  <input
                    type='text'
                    placeholder='z.B. Berlin'
                    value={values.city}
                    onChange={(e) => setField('city', e.target.value)}
                    onKeyDown={handleEnterAdvance}
                    className={inputClass}
                  />
                </div>
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

            {step === 'background' && (
              <div className='flex flex-col gap-3'>
                <label className='cursor-pointer block w-full'>
                  {bgPreviewUrl ? (
                    <div className='w-full aspect-video rounded-xl overflow-hidden bg-background-input'>
                      <img src={bgPreviewUrl} alt='Hintergrundbild' className='w-full h-full object-cover' />
                    </div>
                  ) : (
                    <div className='w-full rounded-xl border border-dashed border-border-input flex flex-col items-center gap-4 px-6 py-10'>
                      <div className='flex h-14 w-14 items-center justify-center rounded-full bg-background-tertiary'>
                        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='text-subheadline'>
                          <path d='M7 18a4.5 4.5 0 0 1-.6-8.96A5.5 5.5 0 0 1 17.4 8.02 4 4 0 0 1 17 16H16' />
                          <path d='M12 12v9' />
                          <path d='M9 15l3-3 3 3' />
                        </svg>
                      </div>
                      <div className='flex flex-col items-center gap-1 text-center'>
                        <span className='text-sm font-semibold text-label'>Datei auswählen oder hierher ziehen</span>
                        <span className='text-xs text-subheadline'>JPG, PNG bis 10 MB</span>
                      </div>
                      <span className='h-10 flex items-center justify-center rounded-full border border-border-input px-5 text-sm font-semibold text-label'>
                        Datei durchsuchen
                      </span>
                    </div>
                  )}
                  <input
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={(e) => handlePickBg(e.target.files?.[0] ?? null)}
                  />
                </label>
                {bgError && <span className='text-sm text-warning text-center' role='alert'>{bgError}</span>}
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
                  className='h-12 rounded-full bg-background-button text-button text-sm font-semibold px-7.5'
                >
                  Fertig
                </button>
              ) : step === 'background' ? (
                <div className='flex flex-col items-center gap-4 w-full'>
                  <button
                    type='button'
                    onClick={handleNext}
                    disabled={!bgFile || uploading}
                    className='h-12 rounded-full bg-background-button text-button text-sm font-semibold px-7.5 disabled:opacity-40'
                  >
                    {uploading ? 'Wird hochgeladen…' : 'weiter'}
                  </button>
                  <button
                    type='button'
                    onClick={() => setStep('pools')}
                    className='text-sm text-subheadline'
                  >
                    Überspringen →
                  </button>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={handleNext}
                  disabled={!canContinue || creating}
                  className='h-12 rounded-full bg-background-button text-button text-sm font-semibold px-7.5 disabled:opacity-40'
                >
                  weiter
                </button>
              )}
            </div>
          </div>

          <div className='absolute bottom-8'>
            <StepProgress count={QUESTION_COUNT} current={stepIndex} onSelect={handleSelectStep} />
          </div>
        </div>
      )}
    </div>
  )
}
