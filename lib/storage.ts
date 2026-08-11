import { supabase } from '@/lib/supabase/client'

// Storage knows nothing about the rows that point at it: deleting a party or nulling
// an avatar_url leaves the uploaded file in the bucket for ever. Every place that
// drops such a row has to clear its files itself, which is what this is for.

// `remove` takes explicit paths, so a folder has to be listed first — and listing
// returns prefixes alongside objects, with `id: null` marking a prefix. Backgrounds
// live two levels deep ({user}/{party}/background.ext), hence the recursion.
export async function removeStorageFolder(bucket: string, prefix: string): Promise<void> {
  const { data } = await supabase.storage.from(bucket).list(prefix)
  if (!data?.length) return

  const files = data.filter((entry) => entry.id !== null).map((entry) => `${prefix}/${entry.name}`)
  if (files.length) await supabase.storage.from(bucket).remove(files)

  for (const folder of data.filter((entry) => entry.id === null)) {
    await removeStorageFolder(bucket, `${prefix}/${folder.name}`)
  }
}

// The public URL is what the profiles row stores, so the object path has to be cut
// back out of it. Anything that is not a URL into this bucket is left alone.
export async function removeStorageFileByUrl(bucket: string, publicUrl: string | null | undefined): Promise<void> {
  const path = publicUrl?.split(`/${bucket}/`)[1]
  if (!path) return
  await supabase.storage.from(bucket).remove([path])
}
