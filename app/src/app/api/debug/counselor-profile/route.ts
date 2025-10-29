import { NextResponse } from 'next/server';
import { authServer } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await authServer.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const supabase = await createClient();

    // Check counselor profile
    const { data: counselorProfile, error: profileError } = await supabase
      .from('counselor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get form assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('form_assignments')
      .select('*')
      .eq('counselor_id', user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      counselorProfile: counselorProfile || null,
      profileError: profileError?.message || null,
      assignments: assignments || [],
      assignmentsError: assignmentsError?.message || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
