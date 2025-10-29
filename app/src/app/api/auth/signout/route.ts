import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Get the origin from the request to ensure proper HTTPS redirect
  const origin = request.nextUrl.origin
  return NextResponse.redirect(new URL('/login', origin))
}
