'use client'

import type { VerifyProps } from '../types/auth.types'
import { useOtpInput } from '../hooks/useOtpInput'
import { verifySignupOtp } from '../services/auth.service'

export default function VerifyOtpForm({ email, onSuccess }: VerifyProps) {
  const { digits, inputRefs, code, handleChange, handleKeyDown, handlePaste } = useOtpInput()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await verifySignupOtp(email, code)
    if (error) {
      console.error('Verify error:', error)
      alert('Wrong code! ' + error.message)
      return
    }
    onSuccess()
  }

  return (
    <div className='w-full flex flex-col gap-8'>
      <div className='flex flex-col items-center gap-2'>
        <h1 className='text-3xl font-bold text-white text-center'>Verifizierung</h1>
        <span className='text-sm text-white/50 text-center'>
          Wir haben einen 6-stelligen Code an{' '}
          <span className='text-[#D47AFF] font-semibold'>{email}</span>{' '}
          geschickt
        </span>
      </div>
      <div className='w-full flex justify-between gap-2'>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type='text'
            inputMode='numeric'
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className='w-full text-center h-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/30'
          />
        ))}
      </div>
      <button
        className='w-full h-12 rounded-full bg-white text-[#09090B] text-sm font-semibold'
        onClick={handleVerify}
      >
        Verify
      </button>
    </div>
  )
}
