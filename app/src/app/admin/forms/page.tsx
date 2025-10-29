import { redirect } from 'next/navigation';
import { authServer } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FileText, UserPlus, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminFormsPage() {
  const user = await authServer.getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    redirect('/unauthorized');
  }

  const supabase = await createClient();

  // Get all jotform submissions
  const { data: submissions, error } = await supabase
    .from('jotform_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
  }

  // Get all users with counselor profiles (includes admins who are also counselors)
  const { data: counselors } = await supabase
    .from('users')
    .select('id, email, role, counselor_profiles!inner(*)')
    .order('email');

  // Get existing assignments
  const { data: assignments } = await supabase
    .from('form_assignments')
    .select('intake_form_id, counselor_id, status');

  // Create a map of intake_form_id to assignment
  const assignmentMap = new Map(
    assignments?.map(a => [a.intake_form_id, a]) || []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Intake Forms
                </h1>
                <p className="text-sm text-gray-600">
                  {submissions?.length || 0} total submissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!submissions || submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No submissions yet
            </h3>
            <p className="text-gray-600">
              JotForm submissions will appear here once they are received.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => {
                  const assignment = assignmentMap.get(submission.id);
                  const assignedCounselor = counselors?.find(
                    c => c.id === assignment?.counselor_id
                  );

                  // Parse the form data to get a name or identifier
                  let submitterName = 'Unknown';
                  try {
                    const parsed = JSON.parse(submission.parsed_fields);
                    // Look for common name fields
                    const nameField = Object.entries(parsed).find(([key]) => 
                      key.toLowerCase().includes('name')
                    );
                    if (nameField) {
                      submitterName = String(nameField[1]);
                    }
                  } catch (e) {
                    // Ignore parse errors
                  }

                  return (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {submitterName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {submission.submission_id || submission.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDistanceToNow(new Date(submission.created_at), {
                            addSuffix: true,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assignment ? (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              assignment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : assignment.status === 'active'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {assignment.status}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignedCounselor ? (
                          <div className="flex items-center">
                            <UserPlus className="w-4 h-4 text-gray-400 mr-2" />
                            {assignedCounselor.email}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/forms/${submission.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </Link>
                        {!assignment && (
                          <Link
                            href={`/admin/forms/${submission.id}/assign`}
                            className="text-green-600 hover:text-green-900"
                          >
                            Assign
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
