import { authServer } from '@/lib/auth/server'
import { redirect } from 'next/navigation'

export default async function CounselorDashboard() {
  const user = await authServer.getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'counselor' && user.role !== 'admin') {
    redirect('/unauthorized')
  }

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
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Welcome, {user.fullName || 'Counselor'}!
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Role: {user.role === 'admin' ? 'Administrator (Counselor View)' : 'Counselor'}
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <p className="text-sm text-gray-600">
                Counselor dashboard coming soon in Phase 5...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
