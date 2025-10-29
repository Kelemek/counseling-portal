import { NextResponse } from 'next/server';
import { authServer } from '@/lib/auth/server';
import { hasRole } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const user = await authServer.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    if (!hasRole(user, 'admin')) {
      return NextResponse.json({ error: 'Only admins can create counselor profiles for themselves' }, { status: 403 });
    }

    const supabase = await createClient();

    // Check if counselor profile already exists
    const { data: existing } = await supabase
      .from('counselor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ 
        message: 'Counselor profile already exists',
        counselor_profile_id: existing.id 
      });
    }

    // Create counselor profile
    const { data: profile, error } = await supabase
      .from('counselor_profiles')
      .insert({
        user_id: user.id,
        specialties: ['General Counseling', 'Crisis Intervention'],
        bio: 'Admin account serving as counselor for testing and oversight',
        max_counselees: 50,
        is_accepting_new: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating counselor profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Counselor profile created successfully',
      counselor_profile: profile,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
