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
    <div className='w-full flex flex-col items-center gap-15'>
      <div className='w-full h-full flex flex-col items-center gap-2.5'>
        <h1 className='text-4xl font-bold text-light-heading'>Verifizierung</h1>
        <span className='text-center text-sm text-light-subheading'>Wir haben ein 6 stelligen Code an <span className='text-brand text-sm font-semibold '>{email}</span> geschickt</span>
      </div>
      <div className='w-full flex justify-between gap-2.5'>
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
            className='w-full text-light-input text-center text-xs px-3 h-12 bg-input-bg border border-input-border rounded-md text-sm text-light focus:outline-none placeholder:text-xs placeholder:text-light-placeholder'
          />
        ))}
      </div>
      <button 
      className='flex w-full items-center justify-center gap-2 rounded-full bg-button-bg py-3 text-sm font-semibold'
      onClick={handleVerify}
      >
        Verify
      </button>
    </div>
  )
}

{/* 
    <form onSubmit={handleVerify} className='flex w-full flex-col gap-4'>
      <h2 className='text-lg font-bold'>Check your email</h2>
      <p className='text-sm text-gray-500'>
        We sent a code to <strong>{email}</strong>
      </p>
      <div className='w-full flex justify-between gap-2.5'>
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
            className='w-full text-light-input text-xs px-3 h-12 bg-input-bg border border-input-border rounded-md text-sm text-light focus:outline-none placeholder:text-xs placeholder:text-light-placeholder'
          />
        ))}
      </div>
      <button type='submit' className='bg-green-500 text-white p-2 rounded'>
        Verify
      </button>
    </form>
*/}
