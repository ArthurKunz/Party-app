'use client'

import { useState } from 'react'
import SheetLayout, { sheetButtonClass } from '@/components/shared/SheetLayout'
import Spinner from '@/components/shared/Spinner'
import WarningBanner from '@/components/shared/WarningBanner'
import { alertError } from '@/lib/utils'
import type { VerifyProps } from '../types/auth.types'
import { OTP_LENGTH } from '../constants/auth.constants'
import { useOtpInput } from '../hooks/useOtpInput'
import { resendSignupOtp, verifySignupOtp } from '../services/auth.service'
import { authBannerMessage } from '../services/auth-errors'

export default function VerifyOtpForm({ email, onSuccess, onClose }: VerifyProps) {
  const [saving, setSaving] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

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
    setWarning(null)
    const { error } = await verifySignupOtp(email, value)
    if (error) {
      setSaving(false)
      // Emptying the boxes both readies the next attempt and stops the auto-submit
      // from firing again on the same wrong digits.
      setDigits(Array.from({ length: OTP_LENGTH }, () => ''))
      inputRefs.current[0]?.focus()
      const banner = authBannerMessage(error)
      if (banner) {
        setWarning(banner)
        return
      }
      alertError('Der Code konnte nicht geprüft werden.', error.message)
      return
    }
    onSuccess()
  }

  // Stays clickable after a successful send: a second mail is exactly what someone
  // whose first one never arrived wants, and the send rate limit — which comes back
  // as its own banner — is the thing that says when to stop, not this button.
  const handleResend = async () => {
    if (resending) return
    setResending(true)
    setWarning(null)
    const { error } = await resendSignupOtp(email)
    setResending(false)
    if (error) {
      setResent(false)
      const banner = authBannerMessage(error)
      if (banner) {
        setWarning(banner)
        return
      }
      alertError('Die Email konnte nicht gesendet werden.', error.message)
      return
    }
    setResent(true)
  }

  return (
    <SheetLayout title='Verifizierung' subtitle='Schau in dein Postfach' onClose={onClose}>
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

      {warning && <WarningBanner message={warning} />}

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

      {resent && !warning && (
        <span className='text-center text-subheading-1 text-sheet-body'>
          Wir haben dir einen neuen Code geschickt.
        </span>
      )}

      {/* Same quiet secondary action as 'Password vergessen?' on the login sheet. */}
      <button
        type='button'
        onClick={handleResend}
        disabled={resending}
        className='self-center px-1 text-subheading-1 text-sheet-body disabled:opacity-60'
      >
        {resending ? 'Wird gesendet …' : 'Code erneut senden'}
      </button>
    </SheetLayout>
  )
}
