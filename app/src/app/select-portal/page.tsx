'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Users, User, ArrowRight } from 'lucide-react'
import type { UserRole } from '@/lib/auth/types'

export default function SelectPortalPage() {
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function fetchUserRoles() {
      try {
        const supabase = (await import('@/lib/supabase/client')).createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        // Always fetch roles from the API to avoid RLS issues
        const response = await fetch('/api/auth/user-roles')
        if (response.ok) {
          const { roles: apiRoles } = await response.json()
          if (apiRoles && apiRoles.length > 0) {
            setRoles(apiRoles)
          } else {
            setError('No roles found for your account')
            setTimeout(() => router.push('/login'), 2000)
          }
        } else {
          setError('Failed to load your roles')
          setTimeout(() => router.push('/login'), 2000)
        }
      } catch (error) {
        console.error('Error fetching roles:', error)
        setError('Error loading roles')
        setTimeout(() => router.push('/login'), 2000)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRoles()
  }, [router])

  const handlePortalSelection = (portal: string) => {
    window.location.href = portal
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const portals = [
    {
      role: 'admin' as UserRole,
      title: 'Admin Portal',
      description: 'Manage users, counselors, and system settings',
      icon: Building2,
      path: '/admin',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
    },
    {
      role: 'counselor' as UserRole,
      title: 'Counselor Portal',
      description: 'View assignments, manage counselees, and provide guidance',
      icon: Users,
      path: '/counselor',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    },
    {
      role: 'counselee' as UserRole,
      title: 'Counselee Portal',
      description: 'Access your counseling resources and homework',
      icon: User,
      path: '/counselee',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
    },
  ]

  const availablePortals = portals.filter(portal => roles.includes(portal.role))

  // If user only has one role, auto-redirect
  if (availablePortals.length === 1) {
    handlePortalSelection(availablePortals[0].path)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome Back
          </h1>
          <p className="text-lg text-gray-600">
            Select a portal to continue
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availablePortals.map((portal) => {
            const Icon = portal.icon
            return (
              <button
                key={portal.role}
                onClick={() => handlePortalSelection(portal.path)}
                className={`group relative bg-white rounded-xl shadow-lg p-8 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${portal.color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
                
                <div className="relative">
                  <div className={`inline-flex p-4 rounded-lg bg-gradient-to-br ${portal.color} mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {portal.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    {portal.description}
                  </p>
                  
                  <div className="flex items-center text-indigo-600 font-medium group-hover:text-indigo-700">
                    <span>Enter Portal</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={async () => {
              const supabase = (await import('@/lib/supabase/client')).createClient()
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
