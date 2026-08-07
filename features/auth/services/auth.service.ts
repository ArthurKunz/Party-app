import { supabase } from '@/lib/supabase/client'
import { getOrigin } from '@/lib/utils'
import { AUTH_CALLBACK_PATH } from '../constants/auth.constants'

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

// Comes back through /callback so the ?next= of an invite link survives the
// round-trip and a brand-new OAuth user (who has no profiles row yet) can be
// sent to onboarding.
export async function signInWithGoogle(next?: string | null) {
  const origin = getOrigin()
  const query = next ? `?next=${encodeURIComponent(next)}` : ''
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}${AUTH_CALLBACK_PATH}${query}` },
  })
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export async function verifySignupOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  })
}

export async function sendResetPasswordEmail(email: string) {
  const origin = getOrigin()
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: origin ? `${origin}${AUTH_CALLBACK_PATH}` : undefined,
  })
}

