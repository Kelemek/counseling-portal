import { authServer } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CounselorDashboard() {
  const user = await authServer.getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'counselor' && user.role !== 'admin') {
    redirect('/unauthorized')
  }

  const supabase = await createClient()

  // Get statistics
  const { count: assignedFormsCount } = await supabase
    .from('form_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('counselor_id', user.id)
    .in('status', ['pending', 'active'])

  const { count: activeCounseeleesCount } = await supabase
    .from('counselee_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_counselor_id', user.id)
    .eq('assignment_status', 'active')

  const { count: pendingHomeworkCount } = await supabase
    .from('homework')
    .select('*', { count: 'exact', head: true })
    .eq('counselor_id', user.id)
    .in('status', ['assigned', 'in_progress'])

  const { count: unreadMessagesCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('counselor_id', user.id)
    .is('read_at', null)
    .neq('sender_id', user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Counselor Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Welcome, {user.fullName || 'Counselor'}!
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Manage your counselees and assignments
              </p>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  href="/counselor/forms"
                  className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400"
                >
                  <span className="block text-sm font-medium text-gray-900">
                    View Assigned Forms
                  </span>
                </Link>

                <Link
                  href="/counselor/counselees"
                  className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400"
                >
                  <span className="block text-sm font-medium text-gray-900">
                    Manage Counselees
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
