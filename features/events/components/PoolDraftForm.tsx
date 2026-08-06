'use client'

import { useState } from 'react'
import { ChevronLeft, Minus, Plus } from 'lucide-react'
import { cardClass, primaryButtonClass, RowDivider, rowClass, rowInputClass, rowLabelClass } from '@/components/shared/Card'
import Switch from '@/components/shared/Switch'
import type { PoolDraft } from '../types/events.types'

const MIN_OPTIONS = 2

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
  const [options, setOptions] = useState(draft ? draft.options : ['', ''])
  const [description, setDescription] = useState(draft?.description ?? '')
  const [allowMultiple, setAllowMultiple] = useState(draft?.allow_multiple ?? false)

  const filled = options.map((o) => o.trim()).filter(Boolean)
  const canAdd = question.trim().length > 0 && filled.length >= MIN_OPTIONS

  const setOption = (index: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)))

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
        <div className='mt-auto flex w-full flex-col gap-3'>
          <div className={cardClass}>
            <div className={rowClass}>
              <span className={rowLabelClass}>Frage</span>
              <input
                type='text'
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder='Bringst du was mit?'
                className={rowInputClass}
              />
            </div>

            {options.map((option, i) => (
              <div key={i}>
                <RowDivider />
                <div className={rowClass}>
                  {/* Only beyond the two required options can one be removed — the
                      red circle mirrors the green one on 'Option hinzufügen'. */}
                  {options.length > MIN_OPTIONS && (
                    <button
                      type='button'
                      onClick={() => setOptions((prev) => prev.filter((_, index) => index !== i))}
                      aria-label={`Option ${i + 1} entfernen`}
                      className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warning'
                    >
                      <Minus size={16} strokeWidth={3} className='text-white' />
                    </button>
                  )}
                  <span className={rowLabelClass}>Option {i + 1}</span>
                  <input
                    type='text'
                    value={option}
                    onChange={(e) => setOption(i, e.target.value)}
                    placeholder={i === 0 ? 'Ja' : 'Nein'}
                    className={rowInputClass}
                  />
                </div>
              </div>
            ))}

            <RowDivider />

            <button type='button' onClick={() => setOptions((prev) => [...prev, ''])} className={rowClass}>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-success'>
                <Plus size={16} strokeWidth={3} className='text-white' />
              </span>
              <span className='text-button text-label-large'>Option hinzufügen</span>
            </button>
          </div>

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
              className='w-full resize-none bg-transparent text-button text-subheading outline-none'
            />
          </div>

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
      </div>
    </div>
  )
}
