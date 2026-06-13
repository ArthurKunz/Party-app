'use client'

import { useState } from 'react'
import Selectbox from '@/components/shared/Selectbox'
import type { CreateEventFormProps, CreateEventFormValues } from '../types/events.types'

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: String(i + 1),
}))

const MONTH_OPTIONS = [
  { value: '01', label: 'Januar' },
  { value: '02', label: 'Februar' },
  { value: '03', label: 'März' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Dezember' },
]

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 3 }, (_, i) => ({
  value: String(currentYear + i),
  label: String(currentYear + i),
}))

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i).padStart(2, '0'),
  label: String(i).padStart(2, '0'),
}))

const MINUTE_OPTIONS = ['00', '15', '30', '45'].map((m) => ({ value: m, label: m }))

export default function CreateEventForm({ onSubmit, loading }: CreateEventFormProps) {
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

  const set = (field: keyof CreateEventFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [field]: e.target.value }))

  const setSelect = (field: keyof CreateEventFormValues) => (value: string) =>
    setValues((v) => ({ ...v, [field]: value }))

  const isValid =
    values.title.trim() &&
    values.day &&
    values.month &&
    values.year &&
    values.hour &&
    values.minute &&
    values.location.trim()

  const inputClass =
    'w-full px-4 h-12 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'

  return (
    <div className='w-full flex flex-col gap-8'>
      <h1 className='text-3xl text-center font-bold text-headline'>Party erstellen</h1>

      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Name der Party</label>
          <input
            type='text'
            placeholder='z.B. Sommerfest 2026'
            value={values.title}
            onChange={set('title')}
            className={inputClass}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Beschreibung (optional)</label>
          <textarea
            placeholder='Was erwartet die Gäste?'
            value={values.description}
            onChange={set('description')}
            rows={3}
            className='w-full px-4 py-3 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder resize-none'
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Datum</label>
          <div className='flex gap-2'>
            <Selectbox
              options={DAY_OPTIONS}
              value={values.day}
              onValueChange={setSelect('day')}
              placeholder='Tag'
              aria-label='Tag'
              center
            />
            <Selectbox
              options={MONTH_OPTIONS}
              value={values.month}
              onValueChange={setSelect('month')}
              placeholder='Monat'
              aria-label='Monat'
            />
            <Selectbox
              options={YEAR_OPTIONS}
              value={values.year}
              onValueChange={setSelect('year')}
              placeholder='Jahr'
              aria-label='Jahr'
              center
            />
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Uhrzeit</label>
          <div className='flex gap-2'>
            <Selectbox
              options={HOUR_OPTIONS}
              value={values.hour}
              onValueChange={setSelect('hour')}
              placeholder='Std.'
              aria-label='Stunde'
              center
            />
            <Selectbox
              options={MINUTE_OPTIONS}
              value={values.minute}
              onValueChange={setSelect('minute')}
              placeholder='Min.'
              aria-label='Minute'
              center
            />
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Ort</label>
          <input
            type='text'
            placeholder='Adresse oder Ortsname'
            value={values.location}
            onChange={set('location')}
            className={inputClass}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Max. Gäste (optional)</label>
          <input
            type='number'
            placeholder='z.B. 30'
            min={1}
            value={values.max_guests}
            onChange={set('max_guests')}
            className={inputClass}
          />
        </div>
      </div>

      <button
        onClick={() => onSubmit(values)}
        disabled={!isValid || loading}
        className='w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold disabled:opacity-40'
      >
        {loading ? 'Erstellen …' : 'Party erstellen'}
      </button>
    </div>
  )
}
