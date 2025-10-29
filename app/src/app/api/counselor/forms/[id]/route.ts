import { NextRequest, NextResponse } from 'next/server'
import { authServer } from '@/lib/auth/server'
import { hasAnyRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authServer.getCurrentUser()
    
    if (!user || !hasAnyRole(user, ['counselor', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    // Get the form assignment
    const { data: assignment, error } = await supabase
      .from('form_assignments')
      .select('*, jotform_submissions(*)')
      .eq('intake_form_id', id)
      .eq('counselor_id', user.id)
      .single()

    if (error || !assignment) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    return NextResponse.json({
      assignment,
      submission: assignment.jotform_submissions,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
