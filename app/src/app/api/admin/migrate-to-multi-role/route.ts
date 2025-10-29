// API route to run the multi-role migration
// Access this at: /api/admin/migrate-to-multi-role

import { createClient } from '@/lib/supabase/server';
import { authServer } from '@/lib/auth/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Get current user directly from supabase (bypassing auth layer during migration)
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is admin using the OLD role column (since we're migrating)
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can run migrations' }, { status: 403 });
    }

    // Check if table exists and what data we have
    const { data: existingRoles, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    const tableExists = !checkError || checkError.code !== '42P01'; // 42P01 = undefined_table

    if (!tableExists) {
      return NextResponse.json({ 
        error: 'user_roles table does not exist',
        details: 'Please run the SQL migration first in Supabase SQL Editor',
        sql: 'See /sql/refactor-to-multi-role-system.sql'
      }, { status: 400 });
    }

    // Get all users to see what we're working with
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, full_name');

    // Step 1: Migrate existing users.role data
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id, role')
      .not('role', 'is', null);

    let migratedUsers = 0;
    const userErrors = [];
    if (existingUsers) {
      for (const u of existingUsers) {
        const { error } = await supabase
          .from('user_roles')
          .upsert({ user_id: u.id, role: u.role }, { onConflict: 'user_id,role', ignoreDuplicates: true });
        if (!error) {
          migratedUsers++;
        } else {
          userErrors.push({ user_id: u.id, role: u.role, error: error.message });
        }
      }
    }

    // Step 2: Migrate counselor_profiles
    const { data: counselorProfiles } = await supabase
      .from('counselor_profiles')
      .select('user_id');

    let migratedCounselors = 0;
    const counselorErrors = [];
    if (counselorProfiles) {
      for (const profile of counselorProfiles) {
        const { error } = await supabase
          .from('user_roles')
          .upsert({ user_id: profile.user_id, role: 'counselor' }, { onConflict: 'user_id,role', ignoreDuplicates: true });
        if (!error) {
          migratedCounselors++;
        } else {
          counselorErrors.push({ user_id: profile.user_id, error: error.message });
        }
      }
    }

    // Get final role counts
    const { data: finalRoles } = await supabase
      .from('user_roles')
      .select('role, user_id');

    const roleCounts = finalRoles?.reduce((acc, r) => {
      acc[r.role] = (acc[r.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get a sample of what's in user_roles
    const { data: sampleRoles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .limit(5);

    return NextResponse.json({ 
      success: true,
      message: migratedUsers > 0 || migratedCounselors > 0 
        ? 'Multi-role migration completed successfully'
        : 'Data already migrated - no new records added',
      migratedUsers,
      migratedCounselors,
      totalUsers: allUsers?.length || 0,
      totalRolesInDatabase: finalRoles?.length || 0,
      roleCounts,
      sampleRoles,
      errors: {
        users: userErrors,
        counselors: counselorErrors
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
