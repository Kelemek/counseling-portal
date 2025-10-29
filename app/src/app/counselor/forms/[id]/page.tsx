import { redirect } from 'next/navigation';
import { authServer } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, FileText, Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default async function CounselorFormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await authServer.getCurrentUser();
  
  if (!user || user.role !== 'counselor') {
    redirect('/unauthorized');
  }

  const { id } = await params;
  const supabase = await createClient();

  // Get the assignment for this counselor
  const { data: assignment, error: assignmentError } = await supabase
    .from('form_assignments')
    .select('*, jotform_submissions(*)')
    .eq('intake_form_id', id)
    .eq('counselor_id', user.id)
    .single();

  if (assignmentError || !assignment) {
    redirect('/counselor/forms');
  }

  const submission = assignment.jotform_submissions;

  // Check if counselee account exists
  const { data: counseleeProfile } = await supabase
    .from('counselee_profiles')
    .select('*, users!counselee_profiles_user_id_fkey(email, is_active)')
    .eq('intake_form_id', id)
    .single();

  // Parse the form fields
  let parsedFields: Record<string, any> = {};
  try {
    // Try parsed_fields first, fall back to raw_request
    if (submission.parsed_fields) {
      parsedFields = JSON.parse(submission.parsed_fields);
    } else if (submission.form_fields) {
      parsedFields = typeof submission.form_fields === 'string'
        ? JSON.parse(submission.form_fields)
        : submission.form_fields;
    } else if (submission.raw_request) {
      // Extract fields from raw_request
      const rawData = typeof submission.raw_request === 'string' 
        ? JSON.parse(submission.raw_request) 
        : submission.raw_request;
      
      // JotForm sends data with question IDs as keys (q1, q2, etc.)
      // We'll extract those into a cleaner format
      parsedFields = Object.entries(rawData)
        .filter(([key]) => key.startsWith('q'))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>);
    }
  } catch (e) {
    console.error('Failed to parse form fields:', e);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/counselor/forms"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Intake Form Details
                </h1>
                <p className="text-sm text-gray-600">
                  Submission ID: {submission.submission_id || submission.id.slice(0, 8)}
                </p>
              </div>
            </div>
            
            {!counseleeProfile && (
              <Link
                href={`/counselor/forms/${id}/generate-account`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <User className="w-4 h-4 mr-2" />
                Generate Counselee Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Data */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Intake Form Responses
                </h2>
              </div>
              <div className="px-6 py-4">
                {Object.keys(parsedFields).length > 0 ? (
                  <dl className="space-y-6">
                    {Object.entries(parsedFields).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-200 pb-4 last:border-0">
                        <dt className="text-sm font-medium text-gray-700 mb-2">
                          {key}
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {typeof value === 'object'
                            ? <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            : <p className="whitespace-pre-wrap">{String(value)}</p>
                          }
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No form data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Assignment Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Assigned</p>
                    <p className="text-sm text-gray-900">
                      {format(new Date(assignment.assigned_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      assignment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : assignment.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Counselee Account */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Counselee Account
              </h3>
              {counseleeProfile ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">
                        {counseleeProfile.users?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full mt-0.5 ${
                      counseleeProfile.users?.is_active
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="text-xs text-gray-500">Account Status</p>
                      <p className="text-sm text-gray-900">
                        {counseleeProfile.users?.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  {counseleeProfile.phone_number && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">
                          {counseleeProfile.phone_number}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      href={`/counselor/counselees/${counseleeProfile.user_id}`}
                      className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Counselee Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-4">
                    No account created yet
                  </p>
                  <Link
                    href={`/counselor/forms/${id}/generate-account`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Generate Login
                  </Link>
                </div>
              )}
            </div>

            {/* Submission Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Submission Details
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Form ID:</span>
                  <span className="ml-2 text-gray-900">{submission.form_id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Submitted:</span>
                  <span className="ml-2 text-gray-900">
                    {format(new Date(submission.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                {submission.ip_address && (
                  <div>
                    <span className="text-gray-500">IP Address:</span>
                    <span className="ml-2 text-gray-900 font-mono text-xs">
                      {submission.ip_address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
