'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Minus, Plus } from 'lucide-react'
import { cardClass, primaryButtonClass, RowDivider, rowClass, rowInputClass, rowLabelClass } from '@/components/shared/Card'
import Switch from '@/components/shared/Switch'
import Collapse from '@/components/shared/Collapse'
import WarningBanner from '@/components/shared/WarningBanner'
import type { PoolDraft } from '../types/events.types'

const MIN_OPTIONS = 2
const MAX_OPTIONS = 10
const DESCRIPTION_MAX = 300
const QUESTION_MAX = 60
// An option is one `truncate`d row on the event page: `text-label-1` (13px) across
// roughly 215px once the radio and a full voter stack have taken their share, which
// is about 33 characters.
const OPTION_MAX = 30
// Matches Collapse's duration: a row folds up before it is actually dropped.
const COLLAPSE_MS = 300

// The options carry an id of their own rather than being keyed by position. React
// would otherwise reuse a removed row's DOM for the row that moves up into its
// place, so the one that slid up would inherit the collapse that was meant for the
// one that left.
type Option = { id: number; value: string }
let nextOptionId = 0
const toOptions = (values: string[]): Option[] =>
  values.map((value) => ({ id: nextOptionId++, value }))

// One poll being written, inside the create flow. Nothing here touches Supabase —
// the finished draft is handed back and only written when the event is created.
// Passing `draft` opens it on an existing poll; handing back the same id is what
// makes the caller replace it instead of adding a second one.
export default function PoolDraftForm({
  draft,
  onAdd,
  onCancel,
}: {
  draft?: PoolDraft
  onAdd: (draft: PoolDraft) => void
  onCancel: () => void
}) {
  const [question, setQuestion] = useState(draft?.question ?? '')
  const [options, setOptions] = useState(() => toOptions(draft ? draft.options : ['', '']))
  const [description, setDescription] = useState(draft?.description ?? '')
  const [allowMultiple, setAllowMultiple] = useState(draft?.allow_multiple ?? false)
  // The row that is folding up, and the row that should unfold on arrival. Only the
  // freshly added one animates in — the rows the form opens with are already there.
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [addedId, setAddedId] = useState<number | null>(null)
  const removeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(removeTimer.current), [])

  const filled = options.map((o) => o.value.trim()).filter(Boolean)
  const canAdd = question.trim().length > 0 && filled.length >= MIN_OPTIONS

  const setOption = (id: number, value: string) =>
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, value } : o)))

  const addOption = () => {
    const [option] = toOptions([''])
    setOptions((prev) => [...prev, option])
    setAddedId(option.id)
  }

  // Folded away first and dropped afterwards: removing the row outright would take
  // its height with it in a single frame.
  const removeOption = (id: number) => {
    if (removingId !== null) return
    setRemovingId(id)
    removeTimer.current = setTimeout(() => {
      setOptions((prev) => prev.filter((o) => o.id !== id))
      setRemovingId(null)
    }, COLLAPSE_MS)
  }

  // The page itself scrolls — a poll with ten options is taller than the screen —
  // so only the back button is pinned, exactly like the steps of the flow.
  return (
    <div className='relative w-full min-h-dvh'>
      <div className='fixed inset-x-0 top-0 z-20 px-4 pt-7.5'>
        <button
          type='button'
          onClick={onCancel}
          aria-label='Zurück'
          className='flex h-11.25 w-11.25 items-center justify-center rounded-full bg-secondary backdrop-blur-xl transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'
        >
          <ChevronLeft size={24} strokeWidth={3} className='text-white' />
        </button>
      </div>

      <div className='relative z-10 flex min-h-dvh flex-col px-4 pt-26.25 pb-safe-rsvp'>
        {/* The form unfolds on arrival instead of simply being there. It grows by
            height rather than fading or sliding, because everything inside it is a
            `backdrop-blur-xl` card: an ancestor animating opacity or transform would
            become their backdrop root and leave the whole page flat and grey until
            it settled. Anchored at the bottom by `mt-auto`, so it rises. */}
        <Collapse open appear className='mt-auto'>
          <div className='flex w-full flex-col gap-3'>
            <div className={cardClass}>
              <div className={rowClass}>
                <span className={rowLabelClass}>Frage</span>
                <input
                  type='text'
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder='Bringst du was mit?'
                  maxLength={QUESTION_MAX}
                  className={rowInputClass}
                />
              </div>

              {options.map((option, i) => (
                <Collapse
                  key={option.id}
                  open={option.id !== removingId}
                  appear={option.id === addedId}
                >
                  <RowDivider />
                  <div className={rowClass}>
                    {/* Only beyond the two required options can one be removed — the
                        red circle mirrors the green one on 'Option hinzufügen'. */}
                    {options.length > MIN_OPTIONS && (
                      <button
                        type='button'
                        onClick={() => removeOption(option.id)}
                        aria-label={`Option ${i + 1} entfernen`}
                        className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warning'
                      >
                        <Minus size={16} strokeWidth={3} className='text-white' />
                      </button>
                    )}
                    <span className={rowLabelClass}>Option {i + 1}</span>
                    <input
                      type='text'
                      value={option.value}
                      onChange={(e) => setOption(option.id, e.target.value)}
                      placeholder={i === 0 ? 'Ja' : 'Nein'}
                      maxLength={OPTION_MAX}
                      className={rowInputClass}
                    />
                  </div>
                </Collapse>
              ))}

              {/* At the cap the row goes and the reason takes its place below the card. */}
              {options.length < MAX_OPTIONS && (
                <>
                  <RowDivider />
                  <button type='button' onClick={addOption} className={rowClass}>
                    <span className='flex h-6 w-6 items-center justify-center rounded-full bg-success'>
                      <Plus size={16} strokeWidth={3} className='text-white' />
                    </span>
                    <span className='text-button text-label-large'>Option hinzufügen</span>
                  </button>
                </>
              )}
            </div>

            {question.length >= QUESTION_MAX && (
              <WarningBanner message={`Maximal ${QUESTION_MAX} Zeichen pro Frage`} />
            )}

            {options.some((o) => o.value.length >= OPTION_MAX) && (
              <WarningBanner message={`Maximal ${OPTION_MAX} Zeichen pro Option`} />
            )}

            {options.length >= MAX_OPTIONS && (
              <WarningBanner message={`Maximal ${MAX_OPTIONS} Optionen`} />
            )}

            <Switch
              label='mehrere Antworten erlauben'
              checked={allowMultiple}
              onChange={setAllowMultiple}
            />

            <div className={`${cardClass} p-4`}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Details'
                rows={3}
                maxLength={DESCRIPTION_MAX}
                className='w-full resize-none bg-transparent text-button text-subheading outline-none'
              />
            </div>

            {description.length >= DESCRIPTION_MAX && (
              <WarningBanner message={`Maximal ${DESCRIPTION_MAX} Zeichen`} />
            )}

            <button
              type='button'
              disabled={!canAdd}
              onClick={() =>
                onAdd({
                  id: draft?.id ?? crypto.randomUUID(),
                  question: question.trim(),
                  description: description.trim() || null,
                  options: filled,
                  allow_multiple: allowMultiple,
                })
              }
              className={primaryButtonClass}
            >
              {draft ? 'Speichern' : 'Hinzufügen'}
            </button>
          </div>
        </Collapse>
      </div>
    </div>
  )
}
