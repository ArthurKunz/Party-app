'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { ProfilePictureFormProps } from '../types/onboarding.types'
import { MAX_BYTES, BUCKET, pickRandomAvatarColor } from '../constants/onboarding.constants'
import { getSession } from '../services/onboarding.service'

export default function ProfilePictureForm({ onSuccess }: ProfilePictureFormProps) {
  const [avatarColor] = useState(pickRandomAvatarColor)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onPickFile = (picked: File | null) => {
    setError(null)
    if (!picked) return
    if (!picked.type.startsWith('image/')) {
      setError('Bitte ein Bild (JPG, PNG, …) auswählen.')
      return
    }
    if (picked.size > MAX_BYTES) {
      setError('Die Datei darf höchstens 5 MB groß sein.')
      return
    }
    setFile(picked)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(picked)
    })
  }

  const handleUpload = async () => {
    if (!file) return
    setError(null)
    setUploading(true)

    const { data: { session } } = await getSession()
    if (!session) {
      setUploading(false)
      setError('Du bist nicht angemeldet.')
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg'
    const path = `${session.user.id}/avatar-${Date.now()}.${safeExt}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false })

    setUploading(false)

    if (uploadError) {
      setError(uploadError.message)
      return
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
    onSuccess(urlData.publicUrl, avatarColor)
  }

  return (
    <div className='flex flex-col items-center gap-12'>
      <span className='text-3xl font-bold text-headline'>Wie siehst du aus?</span>

      <label className='cursor-pointer'>
        <div className='w-40 h-40 rounded-full overflow-hidden bg-background-tertiary'>
          <img
            src={previewUrl ?? '/images/noProfilPicture.jpg'}
            alt='Profilbild'
            className='w-full h-full object-cover'
          />
        </div>
        <input
          type='file'
          accept='image/*'
          className='hidden'
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {error && <span className='text-sm text-warning' role='alert'>{error}</span>}

      <div className='flex flex-col items-center gap-4 w-full'>
        <button
          type='button'
          className='w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold disabled:opacity-40'
          disabled={!file || uploading}
          onClick={() => void handleUpload()}
        >
          {uploading ? 'Wird hochgeladen…' : 'Weiter'}
        </button>
        <button
          type='button'
          className='text-sm text-subheadline'
          onClick={() => onSuccess(null, avatarColor)}
        >
          Überspringen →
        </button>
      </div>
    </div>
  )
}
