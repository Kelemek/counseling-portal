import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authServer } from '@/lib/auth';

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
    const { form_id, counselor_id, notes, due_date } = body;

    if (!form_id || !counselor_id) {
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
      .eq('id', form_id)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Verify the counselor exists and has counselor role
    const { data: counselor, error: counselorError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', counselor_id)
      .eq('role', 'counselor')
      .single();

    if (counselorError || !counselor) {
      return NextResponse.json(
        { error: 'Counselor not found' },
        { status: 404 }
      );
    }

    // Check if already assigned
    const { data: existing } = await supabase
      .from('form_assignments')
      .select('id')
      .eq('form_id', form_id)
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
        form_id,
        counselor_id,
        assigned_by: user.id,
        status: 'pending',
        notes: notes || null,
        due_date: due_date || null,
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
