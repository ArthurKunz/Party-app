import { useMemo } from 'react'

export type PasswordCheck = {
  id: string
  label: string
  passed: boolean
}

export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { id: 'length', label: 'Mindestens 8 Zeichen', passed: password.length >= 8 },
    { id: 'uppercase', label: 'Mindestens ein Großbuchstabe', passed: /[A-Z]/.test(password) },
    { id: 'number', label: 'Mindestens eine Zahl', passed: /[0-9]/.test(password) },
    { id: 'symbol', label: 'Mindestens ein Sonderzeichen', passed: /[^A-Za-z0-9]/.test(password) },
  ]
}

export function validatePassword(password: string): string {
  const failed = getPasswordChecks(password).find((check) => !check.passed)
  return failed?.label ?? ''
}

export function usePasswordValidation(password: string) {
  const passwordWarning = useMemo(() => validatePassword(password), [password])
  const isPasswordValid = passwordWarning === ''

  return { passwordWarning, isPasswordValid }
}


