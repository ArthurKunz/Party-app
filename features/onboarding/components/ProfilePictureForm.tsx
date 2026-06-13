'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
interface ProfilePictureProps {
  onSuccess: (avatarUrl: string) => void
  onGoBack: () => void
}
import { MAX_BYTES, BUCKET } from '../constants/onboarding.constants'
import { getSession } from '../services/onboarding.service'

export default function ProfilePictureForm ({ onSuccess }: ProfilePictureProps) {
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

    const handleContinue = async () => {
        setError(null)
        if (!file) {
            setError('Bitte ein Profilbild auswählen.')
            return
        }

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
        onSuccess(urlData.publicUrl)
    }

    return (
        <div className='flex flex-col items-center gap-15 max-w-sm'>
            <div className='w-full h-full flex flex-col items-center gap-2.5'>
                <span className='block text-4xl font-bold text-light-heading'>Profil erstellen</span>
                <span className='block text-center text-sm text-light-subheading'>Lade ein Bild hoch um dein <span className='text-brand text-sm font-semibold'>Profilbild</span> zu erstellen</span>
            </div>

            <div 
            className='border border-input-border relative w-40 h-40 rounded-full bg-cover bg-center bg-no-repeat flex items-center justify-center cursor-pointer'
            style={{ backgroundImage: previewUrl ? `url(${previewUrl})` : 'url(/images/noProfilPicture.jpg)' }}
            >
                <input
                    type='file'
                    accept='image/*'
                    className='w-full h-full opacity-0'
                    onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />
                <div className='absolute bottom-[5%] right-[5%] border border-primary border-2 w-9 h-9 bg-brand rounded-full'>

                </div>
            </div>

            {error && <span className='text-sm text-red-600' role='alert'>{error}</span>}

            <div className='w-full flex flex-col gap-2'>
                <button
                    type='button'
                    className='flex w-full items-center justify-center gap-2 rounded-full bg-button-bg py-3 text-sm font-semibold'
                    disabled={uploading || !file}
                    onClick={() => void handleContinue()}
                >
                    {uploading ? 'Wird hochgeladen…' : 'Weiter'}
                </button>
            </div>
        </div>
    )
}
