'use client'

import { useState } from 'react'
import SheetLayout, { sheetButtonClass } from '@/components/shared/SheetLayout'
import Spinner from '@/components/shared/Spinner'
import { alertError } from '@/lib/utils'
import type { VerifyProps } from '../types/auth.types'
import { OTP_LENGTH } from '../constants/auth.constants'
import { useOtpInput } from '../hooks/useOtpInput'
import { verifySignupOtp } from '../services/auth.service'

export default function VerifyOtpForm({ email, onSuccess, onClose }: VerifyProps) {
  const [saving, setSaving] = useState(false)

  // Six digits is the whole answer, so there is nothing left to confirm: the code is
  // verified the moment the last box is filled, without reaching for `weiter`.
  // A function DECLARATION, so it is hoisted above the hook call that references it —
  // the two are mutually dependent (the hook needs `verify`, `verify` needs the hook's
  // `setDigits`/`inputRefs`) and a const arrow cannot be read before it is declared.
  const { digits, setDigits, inputRefs, code, handleChange, handleKeyDown, handlePaste } =
    useOtpInput(OTP_LENGTH, verify)

  async function verify(value: string) {
    if (value.length !== OTP_LENGTH || saving) return
    setSaving(true)
    const { error } = await verifySignupOtp(email, value)
    if (error) {
      setSaving(false)
      // Emptying the boxes both readies the next attempt and stops the auto-submit
      // from firing again on the same wrong digits.
      setDigits(Array.from({ length: OTP_LENGTH }, () => ''))
      inputRefs.current[0]?.focus()
      alertError('Der Code stimmt nicht. Bitte prüfe ihn noch einmal.', error.message)
      return
    }
    onSuccess()
  }

  return (
    <SheetLayout title='Verifizierung' onClose={onClose}>
      <div className='flex w-full gap-2'>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type='text'
            inputMode='numeric'
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            aria-label={`Ziffer ${index + 1}`}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className='h-12.5 min-w-0 flex-1 rounded-2xl bg-button-secondary text-center text-sheet-heading outline-none'
          />
        ))}
      </div>

      {/* Kept as the fallback for what the auto-submit cannot see: a retry after a
          wrong code, or a browser that fills the boxes without firing onChange. */}
      <button
        type='button'
        onClick={() => verify(code)}
        disabled={code.length !== OTP_LENGTH || saving}
        className={sheetButtonClass}
      >
        {saving ? <Spinner /> : 'weiter'}
      </button>
    </SheetLayout>
  )
}
