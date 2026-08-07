import { useMemo, useRef, useState } from 'react'
import { OTP_LENGTH } from '../constants/auth.constants'

// `onComplete` fires from the event that fills the last box — typing the final digit
// or pasting the whole code — and is handed the finished code, because the state it
// comes from has not rendered yet. It is deliberately NOT an effect watching `code`:
// this repo's React 19 lint forbids setState inside an effect body, and submitting
// from the event is the more direct expression of "the answer is complete" anyway.
export function useOtpInput(length: number = OTP_LENGTH, onComplete?: (code: string) => void) {
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length }, () => ''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const code = useMemo(() => digits.join(''), [digits])

  const commit = (next: string[]) => {
    setDigits(next)
    const joined = next.join('')
    if (joined.length === length) onComplete?.(joined)
  }

  const handleChange = (value: string, index: number) => {
    if (!/^\d$/.test(value)) return
    const next = [...digits]
    next[index] = value
    commit(next)
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

    const next = [...digits]
    pasted.split('').forEach((char, i) => {
      next[i] = char
    })
    commit(next)

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
