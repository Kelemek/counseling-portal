'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient, type AuthUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial user
    authClient.getCurrentUser().then((user) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const user = await authClient.getCurrentUser()
          setUser(user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    await authClient.signIn({ email, password })
    const user = await authClient.getCurrentUser()
    setUser(user)
    return user
  }

  const signOut = async () => {
    await authClient.signOut()
    setUser(null)
    router.push('/login')
  }

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.roles.includes('admin') ?? false,
    isCounselor: (user?.roles.includes('counselor') || user?.roles.includes('admin')) ?? false,
    isCounselee: user?.roles.includes('counselee') ?? false,
  }
}
