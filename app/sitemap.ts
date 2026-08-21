import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

// Nur die vier Seiten, die überhaupt in einen Suchindex gehören. Alles andere ist
// entweder hinter dem Login oder eine Einladung — und die soll man finden, indem
// jemand einem den Link gibt, nicht über eine Suchmaschine.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  const updated = new Date('2026-08-21')

  return [
    { url: `${base}/login`, lastModified: updated, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/impressum`, lastModified: updated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/datenschutz`, lastModified: updated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/nutzungsbedingungen`, lastModified: updated, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
