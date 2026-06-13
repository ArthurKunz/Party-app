'use client'

import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ChangePasswordFormProps {
  onSuccess?: () => void
}

export default function ChangePasswordScreen({ onSuccess }: ChangePasswordFormProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!')
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
    <form onSubmit={handleChangePassword} className='flex flex-col gap-4'>
      <span className='block text-lg font-bold'>Change Password</span>
      <input
        type='password'
        placeholder='New Password'
        value={newPassword}
        className='p-2 border'
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <input
        type='password'
        placeholder='Confirm New Password'
        value={confirmPassword}
        className='p-2 border'
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
      <button className='bg-blue-500 text-white p-2 rounded'>Save New Password</button>
    </form>
  )
}

