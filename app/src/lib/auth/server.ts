// Server-side auth functions
// This file should only be imported in Server Components

import { createClient } from '@/lib/supabase/server'
import type { AuthUser, UserRole } from './types'

export const authServer = {
  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) return null

    // Get all roles for this user from user_roles table
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    // If no roles in user_roles table, fall back to old users.role column
    let roles: UserRole[] = []
    if (userRoles && userRoles.length > 0) {
      roles = userRoles.map(r => r.role as UserRole)
    } else if (profile.role) {
      // Fallback: use old role column and auto-migrate
      roles = [profile.role as UserRole]
      // Try to insert into user_roles (ignore if fails)
      try {
        await supabase.from('user_roles').insert({ user_id: user.id, role: profile.role })
      } catch { /* ignore */ }
    }

    // Also check counselor_profiles and add counselor role if exists
    const { data: counselorProfile } = await supabase
      .from('counselor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (counselorProfile && !roles.includes('counselor')) {
      roles.push('counselor')
      // Try to insert counselor role
      try {
        await supabase.from('user_roles').insert({ user_id: user.id, role: 'counselor' })
      } catch { /* ignore */ }
    }

    return {
      id: user.id,
      email: user.email!,
      fullName: profile.full_name || undefined,
      roles,  // Now returns array of roles
      isActive: profile.is_active,
      metadata: profile.metadata || {},
    }
  },

  async requireAuth(): Promise<AuthUser> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }
    return user
  },

  async requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
    const user = await this.requireAuth()
    // Check if user has ANY of the allowed roles
    const hasRole = user.roles.some((role: UserRole) => allowedRoles.includes(role))
    if (!hasRole) {
      throw new Error('Forbidden')
    }
    return user
  },

  // Helper to check if user has specific role
  async hasRole(role: UserRole): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user?.roles.includes(role) || false
  },
}
