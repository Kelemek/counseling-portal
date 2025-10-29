import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authServer } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    // Verify admin user
    const user = await authServer.getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { intake_form_id, counselor_id, notes } = body;

    if (!intake_form_id || !counselor_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify the form exists
    const { data: form, error: formError } = await supabase
      .from('jotform_submissions')
      .select('id')
      .eq('id', intake_form_id)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Verify the counselor exists and has a counselor profile
    const { data: counselor, error: counselorError } = await supabase
      .from('users')
      .select('id, role, counselor_profiles!inner(id)')
      .eq('id', counselor_id)
      .single();

    if (counselorError || !counselor) {
      console.error('Counselor verification failed:', counselorError);
      return NextResponse.json(
        { error: 'Counselor not found' },
        { status: 404 }
      );
    }

    // Check if already assigned
    const { data: existing } = await supabase
      .from('form_assignments')
      .select('id')
      .eq('intake_form_id', intake_form_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Form is already assigned' },
        { status: 400 }
      );
    }

    // Create the assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('form_assignments')
      .insert({
        intake_form_id,
        counselor_id,
        assigned_by: user.id,
        status: 'pending',
        notes: notes || null,
        assigned_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (assignmentError) {
      console.error('Assignment error:', assignmentError);
      return NextResponse.json(
        { error: 'Failed to create assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, assignment });
  } catch (error) {
    console.error('Error in assign-form API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
