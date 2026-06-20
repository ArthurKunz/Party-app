'use client'

import { useState } from 'react'
import { createPool, addPoolOption } from '../services/pools.service'

type Props = {
  eventId: string
  onCreated: () => void
  onCancel: () => void
}

const inputClass =
  'w-full px-4 h-14 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'

export default function CreatePoolForm({ eventId, onCreated, onCancel }: Props) {
  const [question, setQuestion] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [saving, setSaving] = useState(false)

  const validOptions = options.filter((o) => o.trim())
  const canSubmit = question.trim().length > 0 && validOptions.length >= 2

  const updateOption = (index: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)))

  const handleSubmit = async () => {
    if (!canSubmit || saving) return
    setSaving(true)

    const { data, error } = await createPool({
      event_id: eventId,
      question: question.trim(),
      description: description.trim() || null,
      type: 'options',
      allow_text_response: false,
    })

    if (error || !data) {
      setSaving(false)
      return
    }

    await Promise.all(validOptions.map((label, i) => addPoolOption(data.id, label.trim(), i)))

    setSaving(false)
    onCreated()
  }

  return (
    <div className='rounded-2xl border border-border bg-background-secondary p-5 flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold uppercase tracking-wide text-label'>Frage *</label>
        <input
          type='text'
          placeholder='z.B. Bringst du etwas mit?'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold uppercase tracking-wide text-label'>
          Beschreibung (optional)
        </label>
        <textarea
          placeholder='z.B. Sag uns kurz, was du mitbringst.'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className='w-full px-4 py-3 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder resize-none'
        />
      </div>

      <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold uppercase tracking-wide text-label'>
          Optionen (min. 2)
        </label>
        {options.map((opt, i) => (
          <div key={i} className='flex gap-2'>
            <input
              type='text'
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              className='flex-1 px-4 h-11 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'
            />
            {options.length > 2 && (
              <button
                type='button'
                onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
                className='h-11 w-11 flex items-center justify-center rounded-xl border border-border-input bg-background-input text-hint shrink-0'
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type='button'
          onClick={() => setOptions((prev) => [...prev, ''])}
          className='h-11 rounded-xl border border-border-input bg-background-input text-sm text-hint'
        >
          + Option hinzufügen
        </button>
      </div>

      <div className='flex gap-2 pt-1'>
        <button
          type='button'
          onClick={onCancel}
          className='flex-1 h-11 rounded-full border border-border-input bg-background-input text-sm text-hint'
        >
          Abbrechen
        </button>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
          className='flex-1 h-11 rounded-full bg-background-button text-button text-sm font-semibold disabled:opacity-40'
        >
          {saving ? 'Erstellen …' : 'Pool erstellen'}
        </button>
      </div>
    </div>
  )
}
