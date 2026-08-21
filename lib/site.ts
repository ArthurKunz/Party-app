// Die eine Stelle, an der die App weiß, unter welcher Adresse sie läuft.
//
// Gebraucht wird das überall dort, wo eine RELATIVE Adresse nicht genügt: Open-Graph-
// Vorschauen, robots.txt und sitemap.xml müssen absolute URLs nennen. Im Browser
// reicht window.location.origin (siehe getOrigin in lib/utils), auf dem Server gibt
// es kein window — deshalb dieser Weg.
//
// Drei Quellen, in dieser Reihenfolge:
//
//   1. NEXT_PUBLIC_SITE_URL — die eigene Domain, sobald sie existiert. Das ist der
//      Wert, der am Ende gesetzt sein soll; er überschreibt alles andere.
//   2. VERCEL_PROJECT_PRODUCTION_URL — setzt Vercel selbst auf die Produktionsdomain
//      des Projekts. Damit stimmen die Vorschauen schon, bevor eine eigene Domain
//      eingetragen ist, und für jede Preview-Bereitstellung sowieso.
//   3. localhost — für die Entwicklung.
//
// Bewusst keine Ausnahme, wenn nichts gesetzt ist: eine falsche absolute URL fällt
// beim Teilen sofort auf, ein abgebrochener Build wäre die schlechtere Antwort.
const FALLBACK = 'http://localhost:3000'

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')

  // Vercel liefert den Wert ohne Schema.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`

  return FALLBACK
}
