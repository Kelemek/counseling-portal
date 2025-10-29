import { redirect } from 'next/navigation';
import { authServer } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Mail, Award } from 'lucide-react';

export default async function CounselorsPage() {
  const user = await authServer.getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    redirect('/unauthorized');
  }

  const supabase = await createClient();

  // Get all users with counselor profiles (includes admins who are also counselors)
  const { data: counselors, error } = await supabase
    .from('users')
    .select('id, email, role, created_at, counselor_profiles!inner(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching counselors:', error);
  }

  // Get assignment counts for each counselor
  const { data: assignmentCounts } = await supabase
    .from('form_assignments')
    .select('counselor_id, status');

  // Create a map of counselor_id to assignment counts
  const countsMap = new Map<string, { active: number; total: number }>();
  assignmentCounts?.forEach((assignment) => {
    const current = countsMap.get(assignment.counselor_id) || { active: 0, total: 0 };
    current.total += 1;
    if (assignment.status === 'active' || assignment.status === 'pending') {
      current.active += 1;
    }
    countsMap.set(assignment.counselor_id, current);
  });

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
                  Counselors
                </h1>
                <p className="text-sm text-gray-600">
                  {counselors?.length || 0} total counselors
                </p>
              </div>
            </div>
            <Link
              href="/admin/counselors/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Counselor
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!counselors || counselors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No counselors yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first counselor account.
            </p>
            <Link
              href="/admin/counselors/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Counselor
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {counselors.map((counselor) => {
              const counts = countsMap.get(counselor.id) || { active: 0, total: 0 };
              const profile = Array.isArray(counselor.counselor_profiles) 
                ? counselor.counselor_profiles[0] 
                : counselor.counselor_profiles;

              return (
                <div
                  key={counselor.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {profile?.full_name || 'Unnamed Counselor'}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Mail className="w-4 h-4 mr-1" />
                        {counselor.email}
                      </div>
                      {profile?.specialization && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Award className="w-4 h-4 mr-1" />
                          {profile.specialization}
                        </div>
                      )}
                    </div>
                  </div>

                  {profile?.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {profile.bio}
                    </p>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-600">Active Cases:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {counts.active}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {counts.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/admin/counselors/${counselor.id}`}
                      className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
