import { redirect } from 'next/navigation';
import { authServer } from '@/lib/auth/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CreateCounselorForm from './CreateCounselorForm';

export default async function NewCounselorPage() {
  const user = await authServer.getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/counselors"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Counselor
              </h1>
              <p className="text-sm text-gray-600">
                Create a new counselor account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <CreateCounselorForm />
        </div>
      </div>
    </div>
  );
}
