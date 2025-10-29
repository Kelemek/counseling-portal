// Shared auth types

import type { UserRole } from '@/lib/types/database.types'

export type { UserRole }

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
