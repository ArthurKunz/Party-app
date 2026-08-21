import type { MetadataRoute } from 'next'

// An invite code is not guessable, but it is also not a password: the moment somebody
// pastes their link into a public post, a crawler may follow it and put the party —
// address included — into a search index that outlives the party itself. Nothing
// under /e/ is meant to be found by searching, only by being handed the link.
//
// The signed-in screens are listed for the same reason, even though the proxy already
// answers a crawler with a redirect to /login: saying so costs one line and means the
// rule survives a change to the proxy.
//
// No `sitemap` entry — that needs an absolute URL, and the production domain does not
// exist yet. Add it when it does.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/e/', '/profile/', '/parties/', '/create-party', '/onboarding', '/callback'],
    },
  }
}
