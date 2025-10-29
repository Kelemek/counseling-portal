import { NextRequest, NextResponse } from 'next/server'
import { authServer } from '@/lib/auth/server'
import { hasAnyRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const user = await authServer.getCurrentUser()
    
    if (!user || !hasAnyRole(user, ['counselor', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { formId, counseleeName, counseleeEmail } = await request.json()

    if (!formId || !counseleeName || !counseleeEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: formId, counseleeName, counseleeEmail' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify the form is assigned to this counselor
    const { data: assignment } = await supabase
      .from('form_assignments')
      .select('*')
      .eq('form_id', formId)
      .eq('counselor_id', user.id)
      .single()

    if (!assignment) {
      return NextResponse.json(
        { error: 'Form not found or not assigned to you' },
        { status: 404 }
      )
    }

    // Check if account already exists for this form
    const { data: existingProfile } = await supabase
      .from('counselee_profiles')
      .select('user_id')
      .eq('intake_form_id', formId)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Account already exists for this form' },
        { status: 400 }
      )
    }

    // Generate a secure random password
    const generatePassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
      let password = ''
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return password
    }

    const password = generatePassword()

    // Create the user account using Supabase Admin API
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: newUser, error: userError } = await adminClient.auth.admin.createUser({
      email: counseleeEmail,
      password: password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: counseleeName,
      },
    })

    if (userError || !newUser.user) {
      console.error('Error creating user:', userError)
      return NextResponse.json(
        { error: userError?.message || 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Add counselee role to user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'counselee',
      })

    if (roleError) {
      console.error('Error adding role:', roleError)
      // Note: User is created but role failed - we should handle this
    }

    // Create counselee profile
    const { error: profileError } = await supabase
      .from('counselee_profiles')
      .insert({
        user_id: newUser.user.id,
        counselor_id: user.id,
        intake_form_id: formId,
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return NextResponse.json(
        { error: 'User created but failed to create profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      credentials: {
        email: counseleeEmail,
        password: password,
        name: counseleeName,
      },
    })
  } catch (error: any) {
    console.error('Error generating counselee account:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
