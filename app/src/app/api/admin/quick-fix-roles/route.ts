import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's current role from users table
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (!profile?.role) {
      return NextResponse.json({ error: 'No role found in users table' }, { status: 400 });
    }

    // Insert into user_roles
    const { data: inserted, error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: authUser.id, role: profile.role })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ 
        error: 'Failed to insert role', 
        details: insertError.message,
        code: insertError.code
      }, { status: 500 });
    }

    // Also add counselor role if they have a counselor_profile
    const { data: counselorProfile } = await supabase
      .from('counselor_profiles')
      .select('id')
      .eq('user_id', authUser.id)
      .single();

    let counselorInserted = null;
    if (counselorProfile) {
      const { data: counselorRole } = await supabase
        .from('user_roles')
        .insert({ user_id: authUser.id, role: 'counselor' })
        .select()
        .single();
      counselorInserted = counselorRole;
    }

    return NextResponse.json({ 
      success: true,
      inserted,
      counselorInserted,
      message: 'Roles added successfully'
    });

  } catch (error) {
    console.error('Quick fix error:', error);
    return NextResponse.json({ 
      error: 'Failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
