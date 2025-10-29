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
  let formattedFields: Array<{ label: string; value: any }> = [];
  
  try {
    // Use the correct field names from schema: 'parsed' and 'data'
    if (submission.data && typeof submission.data === 'object') {
      const rawData = submission.data as any;
      
      // JotForm webhook wraps the actual form data in a 'rawRequest' field
      let formData = rawData;
      if (rawData.rawRequest) {
        try {
          formData = typeof rawData.rawRequest === 'string' 
            ? JSON.parse(rawData.rawRequest) 
            : rawData.rawRequest;
        } catch (e) {
          console.error('Failed to parse rawRequest:', e);
          formData = rawData.rawRequest;
        }
      }
      
      console.log('Form data keys:', Object.keys(formData).slice(0, 20));
      
      // JotForm sends data with question IDs as keys (q1_typeField, q2_name, etc.)
      // Each value can be a simple string/number or an object with more details
      formattedFields = Object.entries(formData)
        .filter(([key]) => key.startsWith('q'))
        .map(([key, value]) => {
          // Extract a readable label from the key or value
          let label = key.replace(/^q\d+_/, '').replace(/_/g, ' ');
          let displayValue: any = value;
          
          // If value is an object, it might have prettyFormat, text, or cfname properties
          if (typeof value === 'object' && value !== null) {
            const obj = value as any;
            
            // Try to get the question label
            if (obj.text) {
              label = String(obj.text);
            } else if (obj.cfname) {
              label = String(obj.cfname).replace(/_/g, ' ');
            } else if (obj.name) {
              label = String(obj.name).replace(/_/g, ' ');
            }
            
            // Try to get the answer value
            if (obj.prettyFormat) {
              displayValue = obj.prettyFormat;
            } else if (obj.answer) {
              displayValue = obj.answer;
            } else if (obj.value) {
              displayValue = obj.value;
            } else {
              // If it has first/last name structure
              if (obj.first || obj.last) {
                displayValue = [obj.first, obj.last].filter(Boolean).join(' ');
              }
              // If it has address components
              else if (obj.addr_line1 || obj.city || obj.state) {
                displayValue = [obj.addr_line1, obj.addr_line2, obj.city, obj.state, obj.postal].filter(Boolean).join(', ');
              }
              // Otherwise keep as is
            }
          }
          
          // Capitalize the label
          label = label
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          
          return { label, value: displayValue };
        })
        .filter(field => field.value !== null && field.value !== undefined && field.value !== '');
        
      console.log('Formatted fields count:', formattedFields.length);
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
              {formattedFields.length === 0 ? (
                <p className="text-sm text-gray-500">No form data available</p>
              ) : (
                formattedFields.map((field, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <dt className="text-sm font-semibold text-gray-700 mb-1 capitalize">
                      {field.label}
                    </dt>
                    <dd className="text-sm text-gray-900 bg-white">
                      {typeof field.value === 'object' && field.value !== null
                        ? JSON.stringify(field.value, null, 2)
                        : String(field.value || '-')}
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
