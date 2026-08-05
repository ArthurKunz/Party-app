'use client'

import { useState, useEffect, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Spinner from '@/components/shared/Spinner'
import { generateInviteCode, getOrigin } from '@/lib/utils'
import EventDateSheet from './components/EventDateSheet'
import EventTimeSheet from './components/EventTimeSheet'
import StepProgress from './components/StepProgress'
import CreateStepLayout from './components/CreateStepLayout'
import { cardClass, RowDivider, rowClass, rowInputClass, rowLabelClass, rowValueClass } from '@/components/shared/Card'
import CreatePoolForm from './components/CreatePoolForm'
import { createEvent } from './services/events.service'
import { createPool, addPoolOption } from './services/pools.service'
import type { CreateEventFormValues, PoolDraft } from './types/events.types'

const inputClass =
  'w-full px-4 h-14 bg-secondary backdrop-blur-xl border border-border-input rounded-xl text-heading text-sm focus:outline-none placeholder:text-label-small'

const BG_MAX_BYTES = 10 * 1024 * 1024

type StepId = 'name' | 'description' | 'date' | 'time' | 'location' | 'guests' | 'background' | 'pools' | 'done'

const STEPS: StepId[] = ['name', 'date', 'time', 'location', 'description', 'guests', 'background', 'pools', 'done']
const QUESTION_COUNT = STEPS.length - 1

const HEADLINES: Record<StepId, string> = {
  name: 'Wie nennst du deine Party?',
  description: 'Worum geht es?',
  date: 'An welchem Tag steigt die Party?',
  time: 'Um wie viel Uhr findet das Event statt?',
  location: 'Wo findet sie statt?',
  guests: 'Wie viele Gäste?',
  background: 'Hintergrundbild',
  pools: 'Umfragen hinzufügen',
  done: 'Deine Party ist bereit! 🎉',
}

export default function CreateEventScreen() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [step, setStep] = useState<StepId>('name')
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPoolForm, setShowPoolForm] = useState(false)
  const [localPools, setLocalPools] = useState<PoolDraft[]>([])
  const [dateSheetOpen, setDateSheetOpen] = useState(false)
  const [timeSheet, setTimeSheet] = useState<'start' | 'end' | null>(null)
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
    end_hour: '',
    end_minute: '',
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

  const stepIndex = STEPS.indexOf(step)
  const shareLink = inviteCode ? `${getOrigin()}/e/${inviteCode}` : ''

  const setField = (field: keyof CreateEventFormValues, value: string) =>
    setValues((v) => ({ ...v, [field]: value }))

  const canContinue = (() => {
    switch (step) {
      case 'name':
        return values.title.trim().length > 0
      case 'date':
        return Boolean(values.day && values.month && values.year)
      case 'time':
        return Boolean(values.hour && values.minute && values.end_hour && values.end_minute)
      case 'location':
        return values.location.trim().length > 0 && values.city.trim().length > 0
      default:
        return true
    }
  })()

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

  const handleFinish = async () => {
    if (!userId || creating) return
    setCreating(true)

    const code = generateInviteCode()
    const event_date = `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:00`
    // An end earlier than the start means the party runs past midnight.
    const start = new Date(event_date)
    const end = new Date(event_date)
    end.setHours(Number(values.end_hour), Number(values.end_minute), 0, 0)
    if (end <= start) end.setDate(end.getDate() + 1)
    const ends_at = end.toISOString()
    const max_guests = values.max_guests ? parseInt(values.max_guests, 10) : null

    const { data, error } = await createEvent({
      host_id: userId,
      title: values.title.trim(),
      description: values.description.trim() || null,
      invite_code: code,
      event_date,
      ends_at,
      location: `${values.location.trim()}, ${values.city.trim()}`,
      max_guests,
    })

    if (error || !data) {
      alert(error?.message ?? 'Fehler beim Erstellen')
      setCreating(false)
      return
    }

    const newEventId = data.id

    if (bgFile) {
      const ext = bgFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg'
      const path = `${userId}/${newEventId}/background.${safeExt}`
      const { error: uploadError } = await supabase.storage
        .from('event-backgrounds')
        .upload(path, bgFile, { cacheControl: '3600', upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('event-backgrounds').getPublicUrl(path)
        await supabase.from('events').update({ background_url: urlData.publicUrl }).eq('id', newEventId)
      }
    }

    for (const pool of localPools) {
      const { data: poolData } = await createPool({
        event_id: newEventId,
        question: pool.question,
        description: pool.description,
        type: 'options',
        allow_text_response: false,
      })
      if (poolData) {
        await Promise.all(pool.options.map((label, i) => addPoolOption(poolData.id, label, i)))
      }
    }

    setInviteCode(code)
    setCreated(true)
    setCreating(false)
    setStep('done')
  }

  const handleNext = () => {
    if (step === 'pools') {
      void handleFinish()
      return
    }
    setStep(STEPS[stepIndex + 1])
  }

  const handleSelectStep = (index: number) => {
    // Locked once the event exists; before that any question can be revisited.
    if (created) return
    setStep(STEPS[index])
  }

  const handleEnterAdvance = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !canContinue) return
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

  // Rebuilt steps go through the shared shell; the rest still use the old markup
  // below until their own stage lands.
  const skipStep = () => setStep(STEPS[stepIndex + 1])

  const pad = (n: number) => String(n).padStart(2, '0')
  const today = new Date()
  const dateValue = {
    day: Number(values.day) || today.getDate(),
    month: Number(values.month) ? Number(values.month) - 1 : today.getMonth(),
    year: Number(values.year) || today.getFullYear(),
  }
  const setDate = (next: { day: number; month: number; year: number }) =>
    setValues((v) => ({ ...v, day: pad(next.day), month: pad(next.month + 1), year: String(next.year) }))

  const timeValue = (which: 'start' | 'end') => ({
    hour: Number(which === 'start' ? values.hour : values.end_hour) || (which === 'start' ? 20 : 2),
    minute: Number(which === 'start' ? values.minute : values.end_minute) || 0,
  })
  const setTime = (which: 'start' | 'end', next: { hour: number; minute: number }) =>
    setValues((v) =>
      which === 'start'
        ? { ...v, hour: pad(next.hour), minute: pad(next.minute) }
        : { ...v, end_hour: pad(next.hour), end_minute: pad(next.minute) },
    )

  if (step === 'date' || step === 'time') {
    return (
      <>
        <CreateStepLayout
          headline={HEADLINES[step]}
          onCancel={() => router.push('/parties')}
          onPrimary={handleNext}
          primaryDisabled={!canContinue}
          stepCount={QUESTION_COUNT}
          currentStep={stepIndex}
          onSelectStep={handleSelectStep}
        >
          {step === 'date' ? (
            <div className={cardClass}>
              <button type='button' onClick={() => setDateSheetOpen(true)} className={rowClass}>
                <span className={rowLabelClass}>Datum</span>
                <span className={`ml-auto ${values.day ? 'text-button text-label-large' : rowValueClass}`}>
                  {values.day ? `${values.day}.${values.month}.${values.year}` : 'auswählen'}
                </span>
              </button>
            </div>
          ) : (
            <div className={cardClass}>
              <button type='button' onClick={() => setTimeSheet('start')} className={rowClass}>
                <span className={rowLabelClass}>beginnt um…</span>
                <span className={`ml-auto ${values.hour ? 'text-button text-label-large' : rowValueClass}`}>
                  {values.hour ? `${values.hour}:${values.minute}` : 'auswählen'}
                </span>
              </button>
              <RowDivider />
              <button type='button' onClick={() => setTimeSheet('end')} className={rowClass}>
                <span className={rowLabelClass}>endet um…</span>
                <span className={`ml-auto ${values.end_hour ? 'text-button text-label-large' : rowValueClass}`}>
                  {values.end_hour ? `${values.end_hour}:${values.end_minute}` : 'auswählen'}
                </span>
              </button>
            </div>
          )}
        </CreateStepLayout>

        {dateSheetOpen && (
          <EventDateSheet value={dateValue} onChange={setDate} onClose={() => setDateSheetOpen(false)} />
        )}
        {timeSheet && (
          <EventTimeSheet
            value={timeValue(timeSheet)}
            onChange={(next) => setTime(timeSheet, next)}
            onClose={() => setTimeSheet(null)}
          />
        )}
      </>
    )
  }

  if (step === 'name' || step === 'description' || step === 'guests') {
    return (
      <CreateStepLayout
        headline={HEADLINES[step]}
        onCancel={() => router.push('/parties')}
        onSkip={step === 'name' ? undefined : skipStep}
        onPrimary={handleNext}
        primaryDisabled={!canContinue}
        stepCount={QUESTION_COUNT}
        currentStep={stepIndex}
        onSelectStep={handleSelectStep}
      >
        {step === 'name' && (
          <div className={cardClass}>
            <div className={rowClass}>
              <span className={rowLabelClass}>Name</span>
              <input
                type='text'
                value={values.title}
                onChange={(e) => setField('title', e.target.value)}
                onKeyDown={handleEnterAdvance}
                placeholder='Sommerparty'
                enterKeyHint='next'
                className={rowInputClass}
              />
            </div>
          </div>
        )}

        {step === 'description' && (
          <div className={`${cardClass} p-4`}>
            <textarea
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder='Details'
              rows={4}
              className='w-full resize-none bg-transparent text-button text-label-large outline-none placeholder:text-subheading'
            />
          </div>
        )}

        {step === 'guests' && (
          <div className={cardClass}>
            <div className={rowClass}>
              <span className={rowLabelClass}>Max. Gäste</span>
              <input
                type='text'
                inputMode='numeric'
                value={values.max_guests}
                onChange={(e) => setField('max_guests', e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyDown={handleEnterAdvance}
                placeholder='50'
                enterKeyHint='next'
                className={rowInputClass}
              />
            </div>
          </div>
        )}
      </CreateStepLayout>
    )
  }

  return (
    <div className='relative w-full h-dvh overflow-hidden bg-main'>

      <button
        type='button'
        onClick={() => router.push('/parties')}
        aria-label='Abbrechen'
        className='absolute top-6 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-secondary backdrop-blur-xl text-heading transition-transform hover:scale-105'
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
              <span className='block text-center text-4xl font-bold text-heading'>
                {HEADLINES.pools}
              </span>
              <div className='flex flex-col gap-3'>
                {localPools.map((pool) => (
                  <div key={pool.id} className='rounded-xl bg-secondary backdrop-blur-xl border border-border-input px-4 py-3 flex flex-col gap-2'>
                    <span className='text-sm font-semibold text-heading'>{pool.question}</span>
                    <div className='flex flex-wrap gap-1.5'>
                      {pool.options.map((opt, i) => (
                        <span key={i} className='text-xs text-subheading bg-tertiary backdrop-blur-xl px-2.5 py-1 rounded-full'>
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {showPoolForm ? (
                  <CreatePoolForm
                    onCreated={(pool) => { setLocalPools((prev) => [...prev, pool]); setShowPoolForm(false) }}
                    onCancel={() => setShowPoolForm(false)}
                  />
                ) : (
                  <button
                    type='button'
                    onClick={() => setShowPoolForm(true)}
                    className='text-sm text-label-small'
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
                    disabled={creating}
                    className='flex h-12 items-center justify-center rounded-full bg-tertiary backdrop-blur-xl text-button text-sm font-semibold text-heading px-7.5 disabled:opacity-40'
                  >
                    {creating ? <Spinner /> : 'weiter'}
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
            <span className='block text-center text-4xl font-bold text-heading'>
              {HEADLINES[step]}
            </span>

            {step === 'location' && (
              <div className='flex flex-col gap-3'>
                <div className='flex flex-col gap-2'>
                  <label className='text-sm text-label-small'>Straße & Hausnummer</label>
                  <input
                    type='text'
                    placeholder='z.B. Musterstraße 14'
                    value={values.location}
                    onChange={(e) => setField('location', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className='flex flex-col gap-2'>
                  <label className='text-sm text-label-small'>Stadt</label>
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

            {step === 'background' && (
              <div className='flex flex-col gap-3'>
                <label className='cursor-pointer block w-full'>
                  {bgPreviewUrl ? (
                    <div className='w-full aspect-video rounded-xl overflow-hidden bg-secondary backdrop-blur-xl'>
                      <img src={bgPreviewUrl} alt='Hintergrundbild' className='w-full h-full object-cover' />
                    </div>
                  ) : (
                    <div className='w-full rounded-xl border border-dashed border-border-input flex flex-col items-center gap-4 px-6 py-10'>
                      <div className='flex h-14 w-14 items-center justify-center rounded-full bg-tertiary backdrop-blur-xl'>
                        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='text-subheading'>
                          <path d='M7 18a4.5 4.5 0 0 1-.6-8.96A5.5 5.5 0 0 1 17.4 8.02 4 4 0 0 1 17 16H16' />
                          <path d='M12 12v9' />
                          <path d='M9 15l3-3 3 3' />
                        </svg>
                      </div>
                      <div className='flex flex-col items-center gap-1 text-center'>
                        <span className='text-sm font-semibold text-label-small'>Datei auswählen oder hierher ziehen</span>
                        <span className='text-xs text-subheading'>JPG, PNG bis 10 MB</span>
                      </div>
                      <span className='h-10 flex items-center justify-center rounded-full border border-border-input px-5 text-sm font-semibold text-label-small'>
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
                <label className='text-sm text-label-small'>Einladungs-Link</label>
                <button
                  type='button'
                  onClick={handleCopy}
                  className='w-full px-4 h-14 flex items-center justify-between gap-3 bg-secondary backdrop-blur-xl border border-border-input rounded-xl text-heading text-sm'
                >
                  <span className='truncate'>{shareLink}</span>
                  <span className='shrink-0 text-subheading'>{copied ? 'Kopiert ✓' : 'Kopieren'}</span>
                </button>
              </div>
            )}

            <div className='flex justify-center'>
              {step === 'done' ? (
                <button
                  type='button'
                  onClick={() => router.push('/parties')}
                  className='h-12 rounded-full bg-tertiary backdrop-blur-xl text-button text-sm font-semibold text-heading px-7.5'
                >
                  Fertig
                </button>
              ) : (
                <button
                  type='button'
                  onClick={handleNext}
                  disabled={!canContinue}
                  className='h-12 rounded-full bg-tertiary backdrop-blur-xl text-button text-sm font-semibold text-heading px-7.5 disabled:opacity-40'
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
