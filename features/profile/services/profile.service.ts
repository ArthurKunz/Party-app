import { supabase } from '@/lib/supabase/client'

export type Profile = {
  firstname: string | null
  lastname: string | null
  birthday: string | null
}

export async function getMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('firstname, lastname, birthday')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data
}
