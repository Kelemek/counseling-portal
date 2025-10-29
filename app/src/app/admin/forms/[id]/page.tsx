import { redirect } from 'next/navigation';
import { authServer } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, FileText, Calendar, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await authServer.getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    redirect('/unauthorized');
  }

  const { id } = await params;
  const supabase = await createClient();

  // Get the submission
  const { data: submission, error } = await supabase
    .from('jotform_submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !submission) {
    redirect('/admin/forms');
  }

  // Get assignment if exists
  const { data: assignment } = await supabase
    .from('form_assignments')
    .select('*, users!form_assignments_counselor_id_fkey(email, counselor_profiles(*))')
    .eq('intake_form_id', id)
    .single();

  // Parse the form fields
  let parsedFields: Record<string, any> = {};
  try {
    console.log('Submission data:', {
      id: submission.id,
      has_parsed: !!submission.parsed,
      has_data: !!submission.data,
      data_type: typeof submission.data,
      data_preview: submission.data ? JSON.stringify(submission.data).substring(0, 200) : 'null'
    });
    
    // Use the correct field names from schema: 'parsed' and 'data'
    if (submission.parsed && typeof submission.parsed === 'object') {
      parsedFields = submission.parsed;
    } else if (submission.data && typeof submission.data === 'object') {
      const rawData = submission.data;
      
      console.log('Raw data keys:', Object.keys(rawData));
      
      // JotForm sends data with question IDs as keys (q1, q2, etc.)
      // We'll extract those into a cleaner format
      parsedFields = Object.entries(rawData)
        .filter(([key]) => key.startsWith('q'))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>);
        
      console.log('Parsed fields count:', Object.keys(parsedFields).length);
    }
  } catch (e) {
    console.error('Error parsing fields:', e);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/forms"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Form Details
                </h1>
                <p className="text-sm text-gray-600">
                  Submission ID: {submission.submission_id || submission.id.slice(0, 8)}
                </p>
              </div>
            </div>
            {!assignment && (
              <Link
                href={`/admin/forms/${id}/assign`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Assign to Counselor
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Submission Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-sm">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-700">Submitted:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {format(new Date(submission.created_at), 'PPpp')}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <FileText className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-700">Form ID:</span>
                <span className="ml-2 font-medium text-gray-900">{submission.form_id}</span>
              </div>
            </div>
          </div>

          {/* Assignment Status Card */}
          {assignment && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Assignment Status
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Assigned to:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {assignment.users?.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Status:</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      assignment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : assignment.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {assignment.status}
                  </span>
                </div>
                {assignment.assigned_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Assigned on:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {format(new Date(assignment.assigned_at), 'PPp')}
                    </span>
                  </div>
                )}
                {assignment.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700 mb-1">Notes:</p>
                    <p className="text-sm text-gray-900">{assignment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Data Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Form Responses
            </h2>
            <div className="space-y-4">
              {Object.entries(parsedFields).length === 0 ? (
                <p className="text-sm text-gray-500">No form data available</p>
              ) : (
                Object.entries(parsedFields).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <dt className="text-sm font-semibold text-gray-700 mb-1">
                      {key}
                    </dt>
                    <dd className="text-sm text-gray-900 bg-white">
                      {typeof value === 'object'
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </dd>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Raw Data Card (Collapsible) */}
          <details className="bg-white rounded-lg shadow">
            <summary className="px-6 py-4 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 bg-white">
              View Raw Data
            </summary>
            <div className="px-6 pb-4 bg-white">
              <pre className="text-xs text-gray-900 bg-gray-50 p-4 rounded overflow-x-auto">
                {JSON.stringify(submission.data, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
