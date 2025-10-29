// Authentication abstraction layer
// This allows us to switch auth providers in the future if needed

import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types/database.types'

export interface AuthUser {
  id: string
  email: string
  fullName?: string
  role: UserRole
  isActive: boolean
  metadata?: Record<string, any>
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpData {
  email: string
  password: string
  fullName?: string
  role?: UserRole
}

// Client-side auth functions
export const authClient = {
  async signIn({ email, password }: SignInCredentials) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  async signUp({ email, password, fullName, role = 'counselee' }: SignUpData) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = createClient()
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

  async resetPassword(email: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  },

  async updatePassword(newPassword: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
  },
}

// Server-side auth functions
export const authServer = {
  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = await createServerClient()
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
