import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/select-portal'

  if (code) {
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
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore errors in edge cases
            }
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Ensure user has at least one role using admin client
    if (data.user) {
      try {
        const adminClient = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: existingRoles } = await adminClient
          .from('user_roles')
          .select('id')
          .eq('user_id', data.user.id)
          .limit(1)

        // If no roles exist, assign default role (counselee)
        if (!existingRoles || existingRoles.length === 0) {
          await adminClient
            .from('user_roles')
            .insert([{ user_id: data.user.id, role: 'counselee' }])
            .select()
        }
      } catch (err) {
        console.error('Error setting up user roles:', err)
        // Continue anyway - user can still login
      }
    }
    
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Auth failed - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
