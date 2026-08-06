'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import Spinner from '@/components/shared/Spinner'
import { cardClass, RowDivider } from '@/components/shared/Card'

// OpenStreetMap's geocoder: no key, no billing. Its usage policy asks for at most
// one request per second, so typing is debounced rather than fired per keystroke.
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const DEBOUNCE_MS = 400

export type AddressResult = { street: string; city: string; label: string }

type NominatimHit = {
  place_id: number
  display_name: string
  address?: {
    road?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    suburb?: string
  }
}

function toResult(hit: NominatimHit): AddressResult {
  const a = hit.address ?? {}
  const street = [a.road, a.house_number].filter(Boolean).join(' ')
  const city = a.city ?? a.town ?? a.village ?? a.municipality ?? a.suburb ?? ''
  return {
    // Falling back to the first part of display_name keeps places without a road
    // (a club, a park) usable instead of dropping them.
    street: street || hit.display_name.split(',')[0].trim(),
    city,
    label: hit.display_name,
  }
}

export default function AddressSearchSheet({
  initialQuery,
  onSelect,
  onClose,
}: {
  initialQuery: string
  onSelect: (result: AddressResult) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<AddressResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const term = query.trim()
    // AbortController rather than a stale-response check: a slow early request must
    // not overwrite the results of a later one.
    const controller = new AbortController()

    // Everything runs from the timer, never straight from the effect body: a
    // synchronous setState here is a cascading render (and a lint error).
    const timer = setTimeout(async () => {
      if (term.length < 3) {
        setResults([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const url = `${NOMINATIM}?format=jsonv2&addressdetails=1&limit=6&countrycodes=de,at,ch&q=${encodeURIComponent(term)}`
        const response = await fetch(url, { signal: controller.signal })
        const hits: NominatimHit[] = await response.json()
        setResults(hits.map(toResult))
      } catch {
        // An aborted request is the normal case here, not a failure worth reporting.
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return (
    <div className='fixed inset-0 z-50 flex flex-col bg-main/80 backdrop-blur-xl px-4 pt-7.5 pb-safe-rsvp'>
      <div className='flex w-full items-center gap-3'>
        <div className={`${cardClass} flex h-12.5 flex-1 items-center gap-3 px-4`}>
          <Search size={18} strokeWidth={2.5} className='shrink-0 text-subheading' />
          <input
            ref={inputRef}
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Hauptstraße 13'
            enterKeyHint='search'
            className='min-w-0 flex-1 bg-transparent text-button text-label-large outline-none placeholder:text-subheading'
          />
          {query && (
            <button type='button' onClick={() => setQuery('')} aria-label='Eingabe löschen'>
              <X size={18} strokeWidth={2.5} className='text-subheading' />
            </button>
          )}
        </div>

        <button
          type='button'
          onClick={onClose}
          aria-label='Schließen'
          className='flex h-12.5 w-12.5 shrink-0 items-center justify-center rounded-full bg-secondary backdrop-blur-xl transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'
        >
          <X size={22} strokeWidth={3} className='text-white' />
        </button>
      </div>

      <div className='mt-4 flex-1 overflow-y-auto scrollbar-none'>
        {loading && (
          <div className='flex justify-center py-6 text-label-large'>
            <Spinner />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className={cardClass}>
            {results.map((result, i) => (
              <div key={result.label}>
                {i > 0 && <RowDivider />}
                <button
                  type='button'
                  onClick={() => onSelect(result)}
                  className='flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors duration-150 active:bg-white/10'
                >
                  <span className='text-button text-label-large'>{result.street}</span>
                  <span className='line-clamp-1 text-label-2 text-subheading'>{result.label}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && query.trim().length >= 3 && results.length === 0 && (
          <span className='block px-4 text-center text-label-1 text-subheading'>
            Keine Adresse gefunden
          </span>
        )}
      </div>
    </div>
  )
}
