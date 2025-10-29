import { redirect } from 'next/navigation';
import { authServer } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AssignmentForm from './AssignmentForm';

export default async function AssignFormPage({
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

  // Check if already assigned
  const { data: existingAssignment } = await supabase
    .from('form_assignments')
    .select('id')
    .eq('intake_form_id', id)
    .single();

  if (existingAssignment) {
    redirect(`/admin/forms/${id}`);
  }

  // Get all users with counselor profiles (includes admins who are also counselors)
  const { data: counselors, error: counselorsError } = await supabase
    .from('users')
    .select('id, email, role, counselor_profiles!inner(*)')
    .order('email');

  if (counselorsError) {
    console.error('Error fetching counselors:', counselorsError);
  }

  // Parse form fields for display
  let parsedFields: Record<string, any> = {};
  try {
    parsedFields = JSON.parse(submission.parsed_fields);
  } catch (e) {
    console.error('Error parsing fields:', e);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/forms/${id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Assign to Counselor
              </h1>
              <p className="text-sm text-gray-600">
                Select a counselor for this intake form
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Submission Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Form Preview
            </h2>
            <div className="space-y-2">
              {Object.entries(parsedFields).slice(0, 3).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="text-gray-600">{key}:</span>
                  <span className="ml-2 text-gray-900">
                    {typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
              {Object.entries(parsedFields).length > 3 && (
                <p className="text-sm text-gray-500 italic">
                  + {Object.entries(parsedFields).length - 3} more fields
                </p>
              )}
            </div>
          </div>

          {/* Assignment Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Assignment Details
            </h2>
            {!counselors || counselors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  No counselors available. You need to create counselor accounts first.
                </p>
                <Link
                  href="/admin/counselors/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Counselor Account
                </Link>
              </div>
            ) : (
              <AssignmentForm
                formId={id}
                counselors={counselors}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
