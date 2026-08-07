import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Next 16 renamed the middleware convention to `proxy`; same behaviour, new filename.
// Note the docs call this an OPTIMISTIC check — it keeps signed-out visitors out of the
// app, but every screen still guards itself and RLS is what actually protects the data.

// Everything the app has is behind an account, with four exceptions: the auth screens
// themselves, the OAuth/recovery callback, and the public invite link — an anonymous
// visitor is meant to see the party there and be offered the sign-up sheet.
const PUBLIC_PATHS = [/^\/login(\/|$)/, /^\/forgot-password(\/|$)/, /^\/callback(\/|$)/, /^\/e\//]

export async function proxy(request: NextRequest) {
  // The response is rebuilt whenever Supabase rotates the auth cookies, so a refreshed
  // token is actually written back to the browser instead of being dropped here.
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // getUser, not getSession: this verifies the token with Supabase instead of trusting
  // whatever the cookie claims, which is the whole point of checking on the server.
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  if (!user && !PUBLIC_PATHS.some((pattern) => pattern.test(path))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    // Same-site by construction, so it needs no sanitising on the way out — the
    // reader still runs it through sanitizeNextPath.
    if (path !== '/') url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  // Everything except Next's own assets and files with an extension, so the check runs
  // on pages and route handlers but not on every image and script.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.[^/]*$).*)'],
}
