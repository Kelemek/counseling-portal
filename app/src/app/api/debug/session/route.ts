import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  let userProfile = null
  let profileError = null
  if (user) {
    const { data: profile, error: err } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    userProfile = profile
    profileError = err
  }
  
  return NextResponse.json({
    hasSession: !!session,
    hasUser: !!user,
    userEmail: user?.email,
    userId: user?.id,
    userProfile,
    profileError,
    sessionError,
    userError,
  })
}
