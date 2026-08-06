'use client'

import { useState } from 'react'
import { ChevronLeft, Plus, X } from 'lucide-react'
import { cardClass, primaryButtonClass, RowDivider, rowClass, rowInputClass, rowLabelClass } from '@/components/shared/Card'
import type { PoolDraft } from '../types/events.types'

const MIN_OPTIONS = 2

// One poll being written, inside the create flow. Nothing here touches Supabase —
// the finished draft is handed back and only written when the event is created.
export default function PoolDraftForm({
  onAdd,
  onCancel,
}: {
  onAdd: (draft: PoolDraft) => void
  onCancel: () => void
}) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [description, setDescription] = useState('')
  const [allowMultiple, setAllowMultiple] = useState(false)

  const filled = options.map((o) => o.trim()).filter(Boolean)
  const canAdd = question.trim().length > 0 && filled.length >= MIN_OPTIONS

  const setOption = (index: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)))

  return (
    <div className='relative w-full h-dvh overflow-hidden bg-main'>
      <div className='relative z-10 flex h-dvh flex-col px-4 pt-7.5 pb-safe-rsvp'>
        <button
          type='button'
          onClick={onCancel}
          aria-label='Zurück'
          className='flex h-11.25 w-11.25 items-center justify-center rounded-full bg-secondary backdrop-blur-xl transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'
        >
          <ChevronLeft size={24} strokeWidth={3} className='text-white' />
        </button>

        <div className='mt-auto flex w-full flex-col gap-3'>
          <div className={cardClass}>
            <div className={rowClass}>
              <span className={rowLabelClass}>Frage</span>
              <input
                type='text'
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder='Was sollen wir bestellen?'
                className={rowInputClass}
              />
            </div>

            {options.map((option, i) => (
              <div key={i}>
                <RowDivider />
                <div className={rowClass}>
                  <span className={rowLabelClass}>Option {i + 1}</span>
                  <input
                    type='text'
                    value={option}
                    onChange={(e) => setOption(i, e.target.value)}
                    placeholder={i === 0 ? 'Ja' : 'Nein'}
                    className={rowInputClass}
                  />
                  {/* Only beyond the two required options can one be removed. */}
                  {options.length > MIN_OPTIONS && (
                    <button
                      type='button'
                      onClick={() => setOptions((prev) => prev.filter((_, index) => index !== i))}
                      aria-label={`Option ${i + 1} entfernen`}
                      className='shrink-0'
                    >
                      <X size={18} strokeWidth={2.5} className='text-subheading' />
                    </button>
                  )}
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

          <div className={cardClass}>
            <button
              type='button'
              onClick={() => setAllowMultiple((v) => !v)}
              role='switch'
              aria-checked={allowMultiple}
              className={rowClass}
            >
              <span className='text-button text-label-large'>mehrere Antworten erlauben</span>
              <span
                className={`ml-auto flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors duration-200 ${
                  allowMultiple ? 'bg-success' : 'bg-tertiary'
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-sheet transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    allowMultiple ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          </div>

          <div className={`${cardClass} p-4`}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Details'
              rows={3}
              className='w-full resize-none bg-transparent text-button text-label-large outline-none placeholder:text-subheading'
            />
          </div>

          <button
            type='button'
            disabled={!canAdd}
            onClick={() =>
              onAdd({
                id: crypto.randomUUID(),
                question: question.trim(),
                description: description.trim() || null,
                options: filled,
                allow_multiple: allowMultiple,
              })
            }
            className={primaryButtonClass}
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </div>
  )
}
