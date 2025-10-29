// Helper functions for role-based access control

import type { AuthUser, UserRole } from './types'

/**
 * Check if user has a specific role
 */
export function hasRole(user: AuthUser | null, role: UserRole): boolean {
  return user?.roles.includes(role) || false
}

/**
 * Check if user has ANY of the specified roles
 */
export function hasAnyRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user) return false
  return user.roles.some((role: UserRole) => roles.includes(role))
}

/**
 * Check if user has ALL of the specified roles
 */
export function hasAllRoles(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user) return false
  return roles.every(role => user.roles.includes(role))
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, 'admin')
}

/**
 * Check if user is counselor
 */
export function isCounselor(user: AuthUser | null): boolean {
  return hasRole(user, 'counselor')
}

/**
 * Check if user is counselee
 */
export function isCounselee(user: AuthUser | null): boolean {
  return hasRole(user, 'counselee')
}
