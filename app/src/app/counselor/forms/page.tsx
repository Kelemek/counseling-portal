import { authServer } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CounselorFormsPage() {
  const user = await authServer.getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'counselor' && user.role !== 'admin') {
    redirect('/unauthorized')
  }

  const supabase = await createClient()

  // Get all forms assigned to this counselor
  const { data: assignments, error } = await supabase
    .from('form_assignments')
    .select(`
      *,
      intake_form:jotform_submissions(*),
      counselee:counselee_id(*)
    `)
    .eq('counselor_id', user.id)
    .order('assigned_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/counselor" className="text-xl font-semibold text-gray-900">
                Counselor Dashboard
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700">Assigned Forms</span>
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
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Assigned Intake Forms</h1>
              <p className="mt-2 text-sm text-gray-700">
                Forms that have been assigned to you for counseling
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                {!assignments || assignments.length === 0 ? (
                  <div className="bg-white shadow sm:rounded-lg p-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No forms assigned</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any intake forms assigned to you yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Counselee Name
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Status
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Assigned Date
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Submission Date
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {assignments.map((assignment: any) => (
                          <tr key={assignment.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {assignment.intake_form?.counselee_name || 'Unknown'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                                assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                assignment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {assignment.status}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(assignment.assigned_at).toLocaleDateString()}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {assignment.intake_form?.submitted_at ? 
                                new Date(assignment.intake_form.submitted_at).toLocaleDateString() : 
                                'N/A'
                              }
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <Link
                                href={`/counselor/forms/${assignment.intake_form_id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
