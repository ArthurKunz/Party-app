import { supabase } from '@/lib/supabase/client'

export async function getSession () {
    return await supabase.auth.getSession()
}