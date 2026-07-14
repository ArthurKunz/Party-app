'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import { getMyProfile, updateProfileAvatar, type Profile } from './services/profile.service'

const BackIcon = (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='19' y1='12' x2='5' y2='12' />
    <polyline points='12 19 5 12 12 5' />
  </svg>
)

const MAX_BYTES = 5 * 1024 * 1024
const BUCKET = 'avatars'

export default function EditPictureScreen() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      setUserId(session.user.id)
      setProfile(await getMyProfile(session.user.id))
      setLoading(false)
    })
  }, [router])

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

  const handleSave = async () => {
    if (!file || !userId) return
    setError(null)
    setUploading(true)

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg'
    const path = `${userId}/avatar-${Date.now()}.${safeExt}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      setUploading(false)
      setError(uploadError.message)
      return
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
    const { error: updateError } = await updateProfileAvatar(userId, urlData.publicUrl)
    setUploading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }
    router.push('/profile')
  }

  if (loading) return null

  return (
    <div className='relative w-full min-h-dvh overflow-hidden bg-background-main'>
      <div className='relative z-10 flex flex-col items-center px-6 pt-7.5 pb-12'>
        <div className='relative w-full flex items-center justify-center'>
          <button
            onClick={() => router.push('/profile')}
            aria-label='Zurück'
            className='absolute left-0 flex h-11 w-11 items-center justify-center rounded-full text-headline'
          >
            {BackIcon}
          </button>
          <span className='text-2xl font-bold text-headline'>Profilbild</span>
        </div>

        <label className='mt-10 cursor-pointer'>
          <div
            className='w-40 h-40 rounded-full overflow-hidden flex items-center justify-center text-3xl font-semibold text-headline'
            style={{ backgroundColor: previewUrl ? 'transparent' : (profile?.avatar_url ? 'transparent' : (profile?.avatar_color ?? '#A336FF')) }}
          >
            {previewUrl ? (
              <img src={previewUrl} alt='Profilbild' className='w-full h-full object-cover' />
            ) : profile?.avatar_url ? (
              <img src={profile.avatar_url} alt='Profilbild' className='w-full h-full object-cover' />
            ) : (
              getInitials(profile?.firstname ?? null, profile?.lastname ?? null)
            )}
          </div>
          <input
            type='file'
            accept='image/*'
            className='hidden'
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {error && <span className='mt-4 text-sm text-warning' role='alert'>{error}</span>}

        <button
          onClick={() => void handleSave()}
          disabled={!file || uploading}
          className='mt-10 w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold disabled:opacity-40'
        >
          {uploading ? 'Wird hochgeladen…' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}
