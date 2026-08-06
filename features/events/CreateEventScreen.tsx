'use client'

import { useState, useEffect, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ImagePlus, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import Spinner from '@/components/shared/Spinner'
import { generateInviteCode, getOrigin } from '@/lib/utils'
import AddressSearchField from './components/AddressSearchField'
import EventDateSheet from './components/EventDateSheet'
import EventTimeSheet from './components/EventTimeSheet'
import StepProgress from './components/StepProgress'
import CreateStepLayout from './components/CreateStepLayout'
import FloatingEmojis from './components/FloatingEmojis'
import { cardClass, primaryButtonClass, RowDivider, rowClass, rowInputClass, rowLabelClass, rowValueClass } from '@/components/shared/Card'
import PoolDraftForm from './components/PoolDraftForm'
import PoolDraftCard from './components/PoolDraftCard'
import Switch from '@/components/shared/Switch'
import WarningBanner from '@/components/shared/WarningBanner'
import { createEvent } from './services/events.service'
import { createPool, addPoolOption } from './services/pools.service'
import type { CreateEventFormValues, PoolDraft } from './types/events.types'

const inputClass =
  'w-full px-4 h-14 bg-secondary backdrop-blur-xl border border-border-input rounded-xl text-heading text-sm focus:outline-none placeholder:text-label-small'

const BG_MAX_BYTES = 10 * 1024 * 1024

// The title is `text-heading-1` (35px semibold) on the event page and must not wrap:
// roughly 18px per character across 343px of content leaves about 19, so 20.
const TITLE_MAX = 20
const DESCRIPTION_MAX = 500
const GUESTS_MAX = 500
const POOLS_MAX = 5

// Ready-made party backgrounds from /public: picking one writes its path straight
// into events.background_url, so nothing is uploaded.
const BG_PRESETS = Array.from({ length: 8 }, (_, i) => `/backgrounds/bg-${i + 1}.jpg`)

type StepId = 'name' | 'description' | 'date' | 'time' | 'location' | 'guests' | 'background' | 'pools' | 'done'

// Background sits with the other required answers (name, date, time, location) and
// ahead of the optional ones, since it is the only later step that cannot be skipped.
const STEPS: StepId[] = ['name', 'date', 'time', 'location', 'background', 'description', 'guests', 'pools', 'done']
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
  const [editingPool, setEditingPool] = useState<PoolDraft | null>(null)
  const [localPools, setLocalPools] = useState<PoolDraft[]>([])
  const [bgPreset, setBgPreset] = useState<string | null>(null)
  const [locationPicked, setLocationPicked] = useState(false)
  const [hasEndTime, setHasEndTime] = useState(false)
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
        return Boolean(
          values.hour && values.minute && (!hasEndTime || (values.end_hour && values.end_minute)),
        )
      case 'location':
        // Typed text is never enough: the answer has to be a picked suggestion, so
        // every event ends up on an address a guest can actually be sent to.
        return locationPicked && values.location.trim().length > 0
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
    setBgPreset(null)
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
    // The end time is optional, so the column simply stays null without one.
    let ends_at: string | null = null
    if (values.end_hour) {
      // An end earlier than the start means the party runs past midnight.
      const start = new Date(event_date)
      const end = new Date(event_date)
      end.setHours(Number(values.end_hour), Number(values.end_minute), 0, 0)
      if (end <= start) end.setDate(end.getDate() + 1)
      ends_at = end.toISOString()
    }
    const max_guests = values.max_guests ? parseInt(values.max_guests, 10) : null

    const { data, error } = await createEvent({
      host_id: userId,
      title: values.title.trim(),
      description: values.description.trim() || null,
      invite_code: code,
      event_date,
      ends_at,
      // The city only exists when a suggestion was picked; a hand-typed address
      // must not end up stored with a dangling comma.
      location: [values.location.trim(), values.city.trim()].filter(Boolean).join(', '),
      max_guests,
    })

    if (error || !data) {
      alert(error?.message ?? 'Fehler beim Erstellen')
      setCreating(false)
      return
    }

    const newEventId = data.id

    if (bgPreset) {
      await supabase.from('events').update({ background_url: bgPreset }).eq('id', newEventId)
    } else if (bgFile) {
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
        allow_multiple: pool.allow_multiple,
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
  const formattedDate = values.day
    ? new Date(Number(values.year), Number(values.month) - 1, Number(values.day)).toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

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

  // The wheel opens on a default, and that default is what the user sees — so it
  // counts as the answer straight away. Closing without scrolling keeps it instead
  // of falling back to the placeholder.
  const openDateSheet = () => {
    setDate(dateValue)
    setDateSheetOpen(true)
  }
  const openTimeSheet = (which: 'start' | 'end') => {
    setTime(which, timeValue(which))
    setTimeSheet(which)
  }

  const toggleEndTime = (next: boolean) => {
    setHasEndTime(next)
    // Switching it back off must not leave a stale end time behind for handleFinish.
    if (!next) setValues((v) => ({ ...v, end_hour: '', end_minute: '' }))
  }

  // Only the step's own content is swapped — the background below it is rendered
  // once, outside this, so the emojis carry on drifting from wherever they are
  // instead of respawning at the bottom on every step and on the finish screen.
  const renderStep = () => {
  if (step === 'pools') {
    if (showPoolForm) {
      return (
        <PoolDraftForm
          draft={editingPool ?? undefined}
          onCancel={() => {
            setShowPoolForm(false)
            setEditingPool(null)
          }}
          onAdd={(draft) => {
            // The form hands back the id it was opened on, so an edit replaces its
            // poll in place and a new one lands at the end.
            setLocalPools((prev) =>
              prev.some((p) => p.id === draft.id)
                ? prev.map((p) => (p.id === draft.id ? draft : p))
                : [...prev, draft],
            )
            setShowPoolForm(false)
            setEditingPool(null)
          }}
        />
      )
    }

    return (
      <CreateStepLayout
        headline={HEADLINES.pools}
        onCancel={() => router.push('/parties')}
        onSkip={() => void handleFinish()}
        onPrimary={handleNext}
        busy={creating}
        // Grows with every poll added, so a pinned bar would end up sitting on the
        // list it belongs to.
        pinnedControls={false}
        stepCount={QUESTION_COUNT}
        currentStep={stepIndex}
        onSelectStep={handleSelectStep}
      >
        {/* Everything added so far, as an overview: tap to edit, swipe to delete. */}
        {localPools.map((pool) => (
          <PoolDraftCard
            key={pool.id}
            pool={pool}
            onEdit={() => {
              setEditingPool(pool)
              setShowPoolForm(true)
            }}
            onDelete={() => setLocalPools((prev) => prev.filter((p) => p.id !== pool.id))}
          />
        ))}

        {/* At the cap the row is replaced by the reason, rather than left there
            looking tappable. */}
        {localPools.length >= POOLS_MAX ? (
          <WarningBanner message={`Maximal ${POOLS_MAX} Umfragen`} />
        ) : (
          <div className={cardClass}>
            <button type='button' onClick={() => setShowPoolForm(true)} className={rowClass}>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-success'>
                <Plus size={16} strokeWidth={3} className='text-white' />
              </span>
              <span className='text-button text-label-large'>Umfrage hinzufügen</span>
            </button>
          </div>
        )}
      </CreateStepLayout>
    )
  }

  if (step === 'background') {
    return (
      <CreateStepLayout
        headline={HEADLINES.background}
        onCancel={() => router.push('/parties')}
        onPrimary={handleNext}
        primaryDisabled={!bgFile && !bgPreset}
        // Long enough that a pinned bar would cover the wallpapers it is asking
        // about: here the button waits at the end of the page instead.
        pinnedControls={false}
        stepCount={QUESTION_COUNT}
        currentStep={stepIndex}
        onSelectStep={handleSelectStep}
      >
        <label className='block w-full cursor-pointer'>
          <div className='flex aspect-[2/1] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[25px] bg-secondary backdrop-blur-xl'>
            {bgPreviewUrl ? (
              <img src={bgPreviewUrl} alt='' className='h-full w-full object-cover' />
            ) : (
              <>
                <div className='flex h-12.5 w-12.5 items-center justify-center rounded-full bg-tertiary backdrop-blur-xl'>
                  <ImagePlus size={22} strokeWidth={2} className='text-heading' />
                </div>
                <div className='flex flex-col items-center gap-0.5 px-6 text-center'>
                  <span className='text-button text-label-large'>Eigenes Bild hochladen</span>
                  <span className='text-label-2 text-subheading'>JPG oder PNG, bis 10 MB</span>
                </div>
              </>
            )}
          </div>
          <input type='file' accept='image/*' className='hidden' onChange={(e) => handlePickBg(e.target.files?.[0] ?? null)} />
        </label>

        {bgError && <span className='px-4 text-label-2 text-warning'>{bgError}</span>}

        <div className='grid grid-cols-2 gap-3'>
          {BG_PRESETS.map((url, i) => (
            <button
              key={url}
              type='button'
              onClick={() => {
                setBgPreset(url)
                setBgFile(null)
                setBgPreviewUrl((prev) => {
                  if (prev) URL.revokeObjectURL(prev)
                  return null
                })
              }}
              className='flex flex-col items-center gap-2'
            >
              <img
                src={url}
                alt={`Hintergrund ${i + 1}`}
                className='aspect-[3/2] w-full rounded-[18px] object-cover transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'
              />
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-xl transition-colors duration-200 ${
                  bgPreset === url ? 'bg-link' : 'border border-white/30'
                }`}
              >
                {bgPreset === url && <Check size={14} strokeWidth={3} className='text-white' />}
              </span>
            </button>
          ))}
        </div>
      </CreateStepLayout>
    )
  }

  if (step === 'location') {
    return (
      <CreateStepLayout
        headline={HEADLINES.location}
        onCancel={() => router.push('/parties')}
        onPrimary={handleNext}
        primaryDisabled={!canContinue}
        stepCount={QUESTION_COUNT}
        currentStep={stepIndex}
        onSelectStep={handleSelectStep}
      >
        <AddressSearchField
          value={values.location}
          // Typing by hand invalidates the city — and the pick — that the last
          // suggestion brought with it.
          onChange={(address) => {
            setLocationPicked(false)
            setValues((v) => ({ ...v, location: address, city: '' }))
          }}
          onSelect={(result) => {
            setLocationPicked(true)
            setValues((v) => ({ ...v, location: result.street, city: result.city }))
          }}
        />
      </CreateStepLayout>
    )
  }

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
              {/* The whole row is the tap target; the input is only here so the
                  value and placeholder read exactly like the Name step's. */}
              <button type='button' onClick={openDateSheet} className={rowClass}>
                <span className={rowLabelClass}>Datum</span>
                <input
                  type='text'
                  readOnly
                  tabIndex={-1}
                  value={formattedDate}
                  placeholder='auswählen'
                  className={`${rowInputClass} pointer-events-none`}
                />
              </button>
            </div>
          ) : (
            <>
              <div className={cardClass}>
                {/* Same shape as the Datum row: the row is the tap target, the input
                    only carries the Name step's value and placeholder colours. */}
                <button type='button' onClick={() => openTimeSheet('start')} className={rowClass}>
                  <span className={rowLabelClass}>beginnt um…</span>
                  <input
                    type='text'
                    readOnly
                    tabIndex={-1}
                    value={values.hour ? `${values.hour}:${values.minute}` : ''}
                    placeholder='auswählen'
                    className={`${rowInputClass} pointer-events-none`}
                  />
                </button>
                {hasEndTime && (
                  <>
                    <RowDivider />
                    <button type='button' onClick={() => openTimeSheet('end')} className={rowClass}>
                      <span className={rowLabelClass}>endet um…</span>
                      <input
                        type='text'
                        readOnly
                        tabIndex={-1}
                        value={values.end_hour ? `${values.end_hour}:${values.end_minute}` : ''}
                        placeholder='auswählen'
                        className={`${rowInputClass} pointer-events-none`}
                      />
                    </button>
                  </>
                )}
              </div>

              <Switch label='Endzeitpunkt hinzufügen' checked={hasEndTime} onChange={toggleEndTime} />
            </>
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
          <>
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
                  maxLength={TITLE_MAX}
                  className={rowInputClass}
                />
              </div>
            </div>
            {values.title.length >= TITLE_MAX && (
              <WarningBanner message={`Maximal ${TITLE_MAX} Zeichen`} />
            )}
          </>
        )}

        {step === 'description' && (
          <>
            <div className={`${cardClass} p-4`}>
              <textarea
                value={values.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder='Details'
                rows={4}
                maxLength={DESCRIPTION_MAX}
                className='w-full resize-none bg-transparent text-button text-subheading outline-none'
              />
            </div>
            {values.description.length >= DESCRIPTION_MAX && (
              <WarningBanner message={`Maximal ${DESCRIPTION_MAX} Zeichen`} />
            )}
          </>
        )}

        {step === 'guests' && (
          <>
            <div className={cardClass}>
              <div className={rowClass}>
                <span className={rowLabelClass}>Max. Gäste</span>
                <input
                  type='text'
                  inputMode='numeric'
                  value={values.max_guests}
                  // Typing past the cap clamps to it rather than being swallowed, so
                  // the number on screen is always the one that will be saved.
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setField('max_guests', Number(digits) > GUESTS_MAX ? String(GUESTS_MAX) : digits)
                  }}
                  onKeyDown={handleEnterAdvance}
                  placeholder='50'
                  enterKeyHint='next'
                  className={rowInputClass}
                />
              </div>
            </div>
            {Number(values.max_guests) >= GUESTS_MAX && (
              <WarningBanner message={`Maximal ${GUESTS_MAX} Gäste`} />
            )}
          </>
        )}
      </CreateStepLayout>
    )
  }

  // Every question has its own branch above, so what is left is the finish screen.
  return (
    <div className='relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 pb-safe-rsvp'>
      <span className='text-center text-heading-2 font-bold text-heading'>{HEADLINES.done}</span>

      <div className='mt-7.5 w-full'>
        <div className={cardClass}>
          <div className={rowClass}>
            <span className={rowLabelClass}>Einladungslink</span>
            <span className={`ml-auto truncate ${rowValueClass}`}>{shareLink}</span>
          </div>
        </div>

        <button type='button' onClick={handleCopy} className={`${primaryButtonClass} mt-3`}>
          {copied ? 'kopiert' : 'Link kopieren'}
        </button>

        <button
          type='button'
          onClick={() => router.push('/parties')}
          className='mt-3 flex h-12.5 w-full items-center justify-center rounded-[25px] bg-secondary backdrop-blur-xl text-button font-semibold text-label-large transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'
        >
          Fertig
        </button>
      </div>
    </div>
  )
  }

  return (
    <div className='relative w-full min-h-dvh bg-main'>
      <FloatingEmojis active />
      {renderStep()}
    </div>
  )
}
