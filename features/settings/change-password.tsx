'use client'

import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ChangePasswordFormProps {
  onSuccess?: () => void
}

export default function ChangePasswordPage({ onSuccess }: ChangePasswordFormProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert('Passwörter stimmen nicht überein!')
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      alert(error.message)
      return
    }

    if (onSuccess) {
      onSuccess()
    } else {
      router.push('/home')
    }
  }

  return (
    <form onSubmit={handleChangePassword} className='w-full flex flex-col gap-8'>
      <h1 className='text-3xl text-center font-bold text-headline'>Neues Passwort</h1>

      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Neues Passwort</label>
          <input
            type='password'
            placeholder='Neues Passwort'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className='w-full px-4 h-12 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-label'>Passwort bestätigen</label>
          <input
            type='password'
            placeholder='Passwort bestätigen'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className='w-full px-4 h-12 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'
          />
        </div>
      </div>

      <button
        type='submit'
        className='w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold'
      >
        Speichern
      </button>
    </form>
  )
}
