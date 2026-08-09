import { supabase } from '@/lib/supabase/client'

export async function getSession () {
    return await supabase.auth.getSession()
}

// Leaving onboarding means leaving the session. The account itself survives — signing
// in again lands back here at step one, because the profiles row is still missing.
export async function signOut () {
    return await supabase.auth.signOut()
}
