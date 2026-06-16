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
      <span className='block text-center text-3xl font-bold text-headline'>Verifizierung</span>

      <div className='flex flex-col gap-2'>
        <label className='text-sm text-label'>Verifizierungs-code</label>
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
              className='w-full text-center h-14 bg-background-input border border-border-input rounded-xl text-input text-sm focus:outline-none placeholder:text-placeholder'
            />
          ))}
        </div>
      </div>

      <button
        className='w-full h-12 rounded-full bg-background-button text-button text-sm font-semibold'
        onClick={handleVerify}
      >
        Verify
      </button>
    </div>
  )
}
