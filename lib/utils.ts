import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Browser-native alerts only: readable German line + the raw technical detail underneath.
export function alertError(message: string, detail?: string) {
  alert(detail ? `${message}\n\n${detail}` : message)
}

// Empty string during SSR; callers only build absolute links on the client.
export function getOrigin(): string {
  return typeof window === 'undefined' ? '' : window.location.origin
}

// Where to land after auth/onboarding. Only same-site paths are accepted, so a
// crafted ?next=https://evil.example cannot turn the login flow into a redirector.
export function sanitizeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null
  return next
}

export function generateInviteCode(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  }
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

export function calculateAge(birthday: string): number {
  const birth = new Date(birthday)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export function getInitials(firstname: string | null, lastname: string | null): string {
  const first = firstname?.trim()?.[0] ?? ''
  const last = lastname?.trim()?.[0] ?? ''
  return (first + last).toUpperCase() || '?'
}

const COVER_GRADIENTS = [
  'from-brand-pink to-brand-lila',
  'from-brand-lila to-brand-blue',
  'from-brand-blue to-brand-pink',
]

// Deterministic per-party cover gradient (no party images in V1, so we fake a "cover photo").
export function partyCoverGradient(id: string): string {
  const hash = id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return COVER_GRADIENTS[hash % COVER_GRADIENTS.length]
}