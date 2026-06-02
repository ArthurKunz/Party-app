import { useMemo, useRef, useState } from 'react'
import { OTP_LENGTH } from '../constants/auth.constants'

export function useOtpInput(length: number = OTP_LENGTH) {
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length }, () => ''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const code = useMemo(() => digits.join(''), [digits])

  const handleChange = (value: string, index: number) => {
    if (!/^\d$/.test(value)) return
    setDigits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    if (index < length - 1) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key !== 'Backspace') return
    setDigits((prev) => {
      const next = [...prev]
      if (next[index] !== '') {
        next[index] = ''
        return next
      }
      if (index > 0) {
        next[index - 1] = ''
        queueMicrotask(() => inputRefs.current[index - 1]?.focus())
      }
      return next
    })
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return

    setDigits((prev) => {
      const next = [...prev]
      pasted.split('').forEach((char, i) => {
        next[i] = char
      })
      return next
    })

    const focusIndex = Math.min(pasted.length, length) - 1
    if (focusIndex >= 0) inputRefs.current[focusIndex]?.focus()
  }

  return {
    digits,
    setDigits,
    inputRefs,
    code,
    handleChange,
    handleKeyDown,
    handlePaste,
  }
}

