import { supabase } from '@/lib/supabase/client'
import { AUTH_CALLBACK_PATH } from '../constants/auth.constants'

function getOrigin() {
  return typeof window === 'undefined' ? '' : window.location.origin
}

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: getOrigin() },
  })
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export async function signUpWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: getOrigin() },
  })
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

