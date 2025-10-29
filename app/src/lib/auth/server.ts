// Server-side auth functions
// This file should only be imported in Server Components

import { createClient } from '@/lib/supabase/server'
import type { AuthUser, UserRole } from './types'

export const authServer = {
  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // Get user profile with role
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) return null

    return {
      id: user.id,
      email: user.email!,
      fullName: profile.full_name || undefined,
      role: profile.role,
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
    if (!allowedRoles.includes(user.role)) {
      throw new Error('Forbidden')
    }
    return user
  },
}
