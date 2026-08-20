import { supabase } from '@/lib/supabase/client'

export type Profile = {
  firstname: string | null
  lastname: string | null
  avatar_url: string | null
  avatar_color: string
}

export async function getMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('firstname, lastname, avatar_url, avatar_color')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data
}

export async function updateProfileName(userId: string, firstname: string, lastname: string) {
  return supabase.from('profiles').update({ firstname, lastname }).eq('id', userId)
}

export async function updateProfileAvatar(userId: string, avatarUrl: string) {
  return supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId)
}

// Choosing initials means dropping the photo: the two are alternatives, and the
// avatar components fall back to initials exactly when avatar_url is null.
export async function updateProfileAvatarColor(userId: string, avatarColor: string) {
  return supabase.from('profiles').update({ avatar_url: null, avatar_color: avatarColor }).eq('id', userId)
}
