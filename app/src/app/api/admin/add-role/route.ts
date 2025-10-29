import { createClient } from '@/lib/supabase/server';
import { authServer } from '@/lib/auth/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user directly from supabase
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { userId, role } = await request.json();

    // Add the role
    const { data, error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to add role', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Added role '${role}' to user`,
      data
    });

  } catch (error) {
    console.error('Add role error:', error);
    return NextResponse.json({ 
      error: 'Failed to add role', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
