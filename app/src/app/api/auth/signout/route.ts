import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Get the origin from the request to ensure proper HTTPS redirect
  const origin = request.nextUrl.origin
  const loginUrl = new URL('/login', origin)
  
  // Use 303 See Other to force a GET redirect after POST
  return NextResponse.redirect(loginUrl, { status: 303 })
}
