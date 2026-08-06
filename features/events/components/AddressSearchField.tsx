'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import Spinner from '@/components/shared/Spinner'
import { cardClass, RowDivider } from '@/components/shared/Card'

// Photon, komoot's search over the same OpenStreetMap data: free, no key, and — the
// reason it is here rather than Nominatim — built for type-ahead. Nominatim matches
// whole addresses, so a lone 'B' or a half-typed street finds nothing, and its usage
// policy asks not to be used for autocomplete at all.
const PHOTON = 'https://photon.komoot.io/api/'
const DEBOUNCE_MS = 400
// Photon has no country filter, so the search is boxed to roughly DACH and the
// stragglers from across the borders are dropped below.
const DACH_BBOX = '5.8,45.7,17.2,55.1'
const COUNTRIES = ['DE', 'AT', 'CH']
const MAX_RESULTS = 6

export type AddressResult = { id: string; street: string; city: string; label: string }

type PhotonFeature = {
  properties: {
    osm_type?: string
    osm_id?: number
    countrycode?: string
    name?: string
    street?: string
    housenumber?: string
    postcode?: string
    city?: string
    state?: string
    country?: string
  }
}

function toResult(feature: PhotonFeature): AddressResult {
  const p = feature.properties
  const address = [p.street, p.housenumber].filter(Boolean).join(' ')
  // Two hits can share a label (the same street in two postcodes), so the OSM id is
  // what keeps the React keys apart.
  const label = [...new Set([p.name, address, p.postcode, p.city, p.country].filter(Boolean))].join(', ')
  return {
    id: p.osm_id ? `${p.osm_type ?? ''}${p.osm_id}` : label,
    // A named place (a club, a park, a whole city) carries no street of its own, so
    // its name becomes the address instead of dropping the hit.
    street: address || p.name || '',
    city: p.city ?? p.state ?? '',
    label,
  }
}

export default function AddressSearchField({
  value,
  onChange,
  onSelect,
}: {
  value: string
  onChange: (address: string) => void
  onSelect: (result: AddressResult) => void
}) {
  const [results, setResults] = useState<AddressResult[]>([])
  const [loading, setLoading] = useState(false)
  // The list belongs to the act of typing: it is only up while the field has focus.
  const [open, setOpen] = useState(false)
  // Picking a suggestion writes it into `value`, which would immediately look like
  // a new search term and re-open the list underneath the answer.
  const skipNextSearch = useRef(false)
  // Leaving the field closes the list, but a tap on a suggestion blurs the input
  // before it fires its click — so the close waits a moment for that click.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  // The list reads bottom-up, so it opens at its BOTTOM: the best match sits whole
  // and tappable right above the field, and it is the worst one that gets cut off
  // at the top edge for scrolling up to.
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [results, open, loading])

  useEffect(() => {
    const term = value.trim()
    if (skipNextSearch.current) {
      skipNextSearch.current = false
      return
    }
    // AbortController rather than a stale-response check: a slow early request must
    // not overwrite the results of a later one.
    const controller = new AbortController()

    // Everything runs from the timer, never straight from the effect body: a
    // synchronous setState here is a cascading render (and a lint error).
    const timer = setTimeout(async () => {
      if (!term) {
        setResults([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        // Over-fetched because the country filter below runs here, not on the server.
        const url = `${PHOTON}?q=${encodeURIComponent(term)}&limit=15&lang=de&bbox=${DACH_BBOX}`
        const response = await fetch(url, { signal: controller.signal })
        const { features }: { features: PhotonFeature[] } = await response.json()
        setResults(
          features
            .filter((f) => !f.properties.countrycode || COUNTRIES.includes(f.properties.countrycode))
            .map(toResult)
            .slice(0, MAX_RESULTS),
        )
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
  }, [value])

  const handlePick = (result: AddressResult) => {
    clearTimeout(closeTimer.current)
    skipNextSearch.current = true
    setResults([])
    setOpen(false)
    onSelect(result)
  }

  return (
    <>
      {/* The list sits above the field, so it is read from the bottom up: the best
          match is the row closest to what was typed. */}
      {open && loading && (
        <div className='flex justify-center py-6 text-label-large'>
          <Spinner />
        </div>
      )}

      {open && !loading && results.length > 0 && (
        <div ref={listRef} className={`${cardClass} max-h-[45dvh] overflow-y-auto scrollbar-none`}>
          {[...results].reverse().map((result, i) => (
            <div key={result.id}>
              {i > 0 && <RowDivider />}
              <button
                type='button'
                onClick={() => handlePick(result)}
                className='flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 active:bg-white/10'
              >
                <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary backdrop-blur-xl'>
                  <MapPin size={18} strokeWidth={2.5} className='text-label-large' />
                </span>
                <span className='flex min-w-0 flex-col gap-0.5'>
                  <span className='truncate text-button text-label-large'>{result.street}</span>
                  <span className='line-clamp-1 text-label-2 text-subheading'>{result.label}</span>
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {open && !loading && value.trim().length > 0 && results.length === 0 && (
        <span className='block px-4 text-center text-label-1 text-subheading'>
          Keine Adresse gefunden
        </span>
      )}

      {/* No label on this row: the magnifier and the placeholder say what it is. */}
      <label className={`${cardClass} flex h-12.5 items-center gap-3 px-4`}>
        <Search size={18} strokeWidth={2.5} className='shrink-0 text-subheading' />
        <input
          type='text'
          value={value}
          onChange={(e) => {
            setOpen(true)
            onChange(e.target.value)
          }}
          onFocus={() => {
            clearTimeout(closeTimer.current)
            setOpen(true)
          }}
          onBlur={() => {
            closeTimer.current = setTimeout(() => setOpen(false), 150)
          }}
          placeholder='Adresse'
          enterKeyHint='search'
          className='min-w-0 flex-1 bg-transparent text-button text-subheading outline-none'
        />
        {value && (
          <button
            type='button'
            onClick={() => onChange('')}
            aria-label='Eingabe löschen'
            className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tertiary backdrop-blur-xl'
          >
            <X size={13} strokeWidth={3} className='text-label-large' />
          </button>
        )}
      </label>
    </>
  )
}
