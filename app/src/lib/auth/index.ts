// Authentication abstraction layer - CLIENT SIDE ONLY
// For server-side auth, import from '@/lib/auth/server'

import { createClient } from '@/lib/supabase/client'
import type { AuthUser, SignInCredentials, SignUpData, UserRole } from './types'

// Re-export types for convenience
export type { AuthUser, SignInCredentials, SignUpData, UserRole }

// Client-side auth functions
export const authClient = {
  // Magic Link sign-in (passwordless)
  async signInWithMagicLink(email: string, redirectTo?: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) throw error
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
      roles: profile.role ? [profile.role as UserRole] : [],
      isActive: profile.is_active,
      metadata: profile.metadata || {},
    }
  },

  async resetPassword(email: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
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
