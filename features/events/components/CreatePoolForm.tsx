'use client'

import { useState } from 'react'
import type { PoolDraft } from '../types/events.types'

type Props = {
  onCreated: (pool: PoolDraft) => void
  onCancel: () => void
}

const inputClass =
  'w-full px-4 h-14 bg-secondary border border-border-input rounded-xl text-heading text-sm focus:outline-none placeholder:text-label-small'

export default function CreatePoolForm({ onCreated, onCancel }: Props) {
  const [question, setQuestion] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(['', ''])

  const validOptions = options.filter((o) => o.trim())
  const canSubmit = question.trim().length > 0 && validOptions.length >= 2

  const updateOption = (index: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)))

  const handleSubmit = () => {
    if (!canSubmit) return
    onCreated({
      id: crypto.randomUUID(),
      question: question.trim(),
      description: description.trim() || null,
      options: validOptions.map((o) => o.trim()),
    })
  }

  return (
    <div className='rounded-2xl border border-border bg-secondary p-5 flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold uppercase tracking-wide text-label-small'>Frage *</label>
        <input
          type='text'
          placeholder='z.B. Bringst du etwas mit?'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold uppercase tracking-wide text-label-small'>
          Beschreibung (optional)
        </label>
        <textarea
          placeholder='z.B. Sag uns kurz, was du mitbringst.'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className='w-full px-4 py-3 bg-secondary border border-border-input rounded-xl text-heading text-sm focus:outline-none placeholder:text-label-small resize-none'
        />
      </div>

      <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold uppercase tracking-wide text-label-small'>
          Optionen (min. 2)
        </label>
        {options.map((opt, i) => (
          <div key={i} className='flex gap-2'>
            <input
              type='text'
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              className='flex-1 px-4 h-11 bg-secondary border border-border-input rounded-xl text-heading text-sm focus:outline-none placeholder:text-label-small'
            />
            {options.length > 2 && (
              <button
                type='button'
                onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
                className='h-11 w-11 flex items-center justify-center rounded-xl border border-border-input bg-secondary text-label-small shrink-0'
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type='button'
          onClick={() => setOptions((prev) => [...prev, ''])}
          className='h-11 rounded-xl border border-border-input bg-secondary text-sm text-label-small'
        >
          + Option hinzufügen
        </button>
      </div>

      <div className='flex gap-2 pt-1'>
        <button
          type='button'
          onClick={onCancel}
          className='flex-1 h-11 rounded-full border border-border-input bg-secondary text-sm text-label-small'
        >
          Abbrechen
        </button>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={!canSubmit}
          className='flex-1 h-11 rounded-full bg-tertiary text-button text-sm font-semibold text-heading disabled:opacity-40'
        >
          Erstellen
        </button>
      </div>
    </div>
  )
}
