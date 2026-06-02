import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const token_hash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type')
    const code = requestUrl.searchParams.get('code')
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )

    if (token_hash && type === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'recovery' })

        if (error) alert(error.message)

        return NextResponse.redirect(
            `${requestUrl.origin}/forgot-password`
        )
    }

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) alert(error.message)
    }

    return NextResponse.redirect(`${requestUrl.origin}/home`)
}