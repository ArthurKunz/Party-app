'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Pencil, User } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { alertError, getInitials } from '@/lib/utils'
import { AVATAR_COLORS, BUCKET, MAX_BYTES } from '@/features/onboarding/constants/onboarding.constants'
import {
  getMyProfile,
  updateProfileAvatar,
  updateProfileAvatarColor,
  type Profile,
} from './services/profile.service'
import SettingsPage, { saveButtonClass } from './components/SettingsPage'

export default function EditPictureScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      const myProfile = await getMyProfile(session.user.id)
      setUserId(session.user.id)
      setProfile(myProfile)
      // Someone already using initials starts with their colour marked.
      if (myProfile && !myProfile.avatar_url) setColor(myProfile.avatar_color)
    })
  }, [router])

  const initials = getInitials(profile?.firstname ?? null, profile?.lastname ?? null)

  const onPickFile = (picked: File | null) => {
    if (!picked) return
    if (!picked.type.startsWith('image/')) {
      alertError('Bitte ein Bild auswählen (JPG, PNG, …).')
      return
    }
    if (picked.size > MAX_BYTES) {
      alertError('Die Datei darf höchstens 5 MB groß sein.')
      return
    }
    // Photo and initials are alternatives, so picking one drops the other.
    setColor(null)
    setFile(picked)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(picked)
    })
  }

  const selectColor = (value: string) => {
    setColor(value)
    setFile(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  const canSave = !!file || (!!color && (color !== profile?.avatar_color || !!profile?.avatar_url))

  const handleSave = async () => {
    if (!canSave || !userId) return
    setSaving(true)

    if (color) {
      const { error } = await updateProfileAvatarColor(userId, color as string)
      setSaving(false)
      if (error) {
        alertError('Deine Farbe konnte nicht gespeichert werden.', error.message)
        return
      }
      router.push('/profile')
      return
    }

    const ext = file!.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg'
    const path = `${userId}/avatar-${Date.now()}.${safeExt}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file!, { cacheControl: '3600', upsert: false })
    if (uploadError) {
      setSaving(false)
      alertError('Dein Bild konnte nicht hochgeladen werden.', uploadError.message)
      return
    }

    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    const { error } = await updateProfileAvatar(userId, publicUrl)
    setSaving(false)
    if (error) {
      alertError('Dein Profilbild konnte nicht gespeichert werden.', error.message)
      return
    }
    router.push('/profile')
  }

  // The big circle is a live preview of whatever is currently chosen.
  const shownPhoto = color ? null : (previewUrl ?? profile?.avatar_url ?? null)

  return (
    <SettingsPage title='Profilbild' fill>
      {/* Photo first: the circle is the file input, the pencil badge is decoration
          on top of it, and it previews whatever is currently chosen. */}
      <label className='flex cursor-pointer justify-center'>
        <div className='relative'>
          <div
            className='flex h-43.75 w-43.75 items-center justify-center overflow-hidden rounded-full bg-secondary backdrop-blur-xl text-heading-1 text-white/90'
            style={color ? { backgroundColor: color } : undefined}
          >
            {shownPhoto ? (
              <img src={shownPhoto} alt='' className='h-full w-full object-cover' />
            ) : color ? (
              initials
            ) : (
              <User size={72} strokeWidth={1.5} className='text-subheading' />
            )}
          </div>
          <span className='absolute bottom-1 right-1 flex h-11.25 w-11.25 items-center justify-center rounded-full bg-sheet'>
            <Pencil size={18} strokeWidth={2.5} className='text-sheet-heading' />
          </span>
        </div>
        <input
          type='file'
          accept='image/*'
          className='hidden'
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {/* …or initials on one of the nine party colours. */}
      <div className='mt-6 grid grid-cols-3 gap-3'>
        {AVATAR_COLORS.map((value) => (
          <button key={value} type='button' onClick={() => selectColor(value)} className='flex flex-col items-center gap-2'>
            <span
              className='flex h-22.5 w-22.5 items-center justify-center rounded-full text-heading-4 text-white/90 transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'
              style={{ backgroundColor: value }}
            >
              {initials}
            </span>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-xl transition-colors duration-200 ${
                color === value ? 'bg-link' : 'border border-white/30'
              }`}
            >
              {color === value && <Check size={14} strokeWidth={3} className='text-white' />}
            </span>
          </button>
        ))}
      </div>

      <button type='button' onClick={handleSave} disabled={!canSave || saving} className={`${saveButtonClass} mt-4`}>
        {saving ? 'speichert …' : 'speichern'}
      </button>
    </SettingsPage>
  )
}
