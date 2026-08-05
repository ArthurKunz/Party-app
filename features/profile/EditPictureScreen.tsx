'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import { getMyProfile, updateProfileAvatar, type Profile } from './services/profile.service'
import SettingsPage, { cardClass, rowClass, rowLabelClass, rowValueClass, saveButtonClass } from './components/SettingsPage'

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

  return (
    <SettingsPage title='Profilbild'>
      {/* The picked (or current) picture sits above the row, centred like the mockups
          keep their subject above the controls. */}
      <label className='mb-2 flex cursor-pointer justify-center'>
        <div
          className='flex h-40 w-40 items-center justify-center overflow-hidden rounded-full text-heading-1 text-heading'
          style={{ backgroundColor: previewUrl || profile?.avatar_url ? 'transparent' : (profile?.avatar_color ?? '#A336FF') }}
        >
          {previewUrl ? (
            <img src={previewUrl} alt='' className='h-full w-full object-cover' />
          ) : profile?.avatar_url ? (
            <img src={profile.avatar_url} alt='' className='h-full w-full object-cover' />
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

      <div className={cardClass}>
        <label className={`${rowClass} cursor-pointer`}>
          <span className={rowLabelClass}>Bild</span>
          <span className={`ml-auto truncate ${rowValueClass}`}>
            {file ? file.name : 'auswählen'}
          </span>
          <input
            type='file'
            accept='image/*'
            className='hidden'
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {error && <span className='px-4 text-label-2 text-warning' role='alert'>{error}</span>}

      <button type='button' onClick={handleSave} disabled={!file || uploading} className={saveButtonClass}>
        {uploading ? 'speichert …' : 'speichern'}
      </button>
    </SettingsPage>
  )
}
