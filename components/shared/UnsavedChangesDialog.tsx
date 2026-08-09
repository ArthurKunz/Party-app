'use client'

import { useEffect } from 'react'
import Spinner from '@/components/shared/Spinner'
import { primaryButtonClass } from '@/components/shared/Card'

// The three profile edit screens all save on an explicit button, so leaving early
// silently threw the change away. This is what stands in the way — deliberately three
// choices rather than the two a native confirm() can offer, because "leave without
// saving" and "stay here" are different answers and the app already has a save it can
// run for you.
export default function UnsavedChangesDialog({
  saving = false,
  onSave,
  onDiscard,
  onCancel,
}: {
  // Held while the save behind the dialog is still running, so the sheet cannot be
  // dismissed out from under a request that is about to navigate away by itself.
  saving?: boolean
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
}) {
  // The page behind must not scroll while this is up — the same guard the wheel
  // picker and the invite page's auth gate already use.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='unsaved-title'
      className='fixed inset-0 z-50 flex items-center justify-center px-7.5'
    >
      {/* Tapping beside the panel means "not now", the same as abbrechen. */}
      <button
        type='button'
        aria-label='Abbrechen'
        onClick={onCancel}
        disabled={saving}
        className='absolute inset-0 bg-main/60 backdrop-blur-sm'
      />

      <div className='relative w-full max-w-80 flex flex-col gap-5 rounded-[25px] bg-quaternary backdrop-blur-2xl p-5 animate-fade-in-up'>
        <div className='flex flex-col gap-1.5 text-center'>
          <span id='unsaved-title' className='text-heading-4 font-semibold text-heading'>
            Nicht gespeichert
          </span>
          <span className='text-subheading-1 text-subheading'>
            Deine Änderung geht verloren, wenn du jetzt zurückgehst.
          </span>
        </div>

        <div className='flex flex-col gap-2'>
          <button type='button' onClick={onSave} disabled={saving} className={primaryButtonClass}>
            {saving ? <Spinner /> : 'speichern'}
          </button>

          {/* Same red pill as absagen on the invite page: this is the one that costs
              something, so it carries the warning colour rather than looking neutral. */}
          <button
            type='button'
            onClick={onDiscard}
            disabled={saving}
            className='flex h-12.5 w-full items-center justify-center rounded-full border border-warning/60 bg-warning/15 backdrop-blur-xl text-button font-semibold text-warning transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 disabled:opacity-50'
          >
            verwerfen
          </button>

          <button
            type='button'
            onClick={onCancel}
            disabled={saving}
            className='flex h-12.5 w-full items-center justify-center rounded-full bg-secondary backdrop-blur-xl text-button text-label-large transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 disabled:opacity-50'
          >
            abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}
