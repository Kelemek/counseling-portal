'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MigrationPage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [addingRole, setAddingRole] = useState(false);
  const router = useRouter();

  const runMigration = async () => {
    setStatus('running');
    setResult(null);

    try {
      const response = await fetch('/api/admin/migrate-to-multi-role', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setResult(data);
      } else {
        setStatus('error');
        setResult(data);
      }
    } catch (error) {
      setStatus('error');
      setResult({ error: 'Network error', details: error instanceof Error ? error.message : 'Unknown' });
    }
  };

  const addAdminRole = async () => {
    setAddingRole(true);
    try {
      // Get current user ID from the result or prompt
      const userId = prompt('Enter your user ID (UUID):');
      if (!userId) {
        setAddingRole(false);
        return;
      }

      const response = await fetch('/api/admin/add-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: 'admin' }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Admin role added successfully! Run migration again to see it.');
        window.location.reload();
      } else {
        alert(`Failed to add role: ${data.error}\n${data.details || ''}`);
      }
    } catch (error) {
      alert('Network error');
    } finally {
      setAddingRole(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Multi-Role System Migration
          </h1>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h2 className="font-semibold text-blue-900 mb-2">What this does:</h2>
            <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
              <li>Creates `user_roles` table for many-to-many user-role relationship</li>
              <li>Migrates existing user roles from `users.role` column</li>
              <li>Migrates counselor_profiles to user_roles</li>
              <li>Allows users to have multiple roles (admin + counselor + counselee)</li>
            </ul>
          </div>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h2 className="font-semibold text-yellow-900 mb-2">⚠️ Important:</h2>
            <p className="text-yellow-800 text-sm">
              Before running this migration, make sure you've run the SQL script in Supabase SQL Editor to create the table structure and RLS policies.
            </p>
            <p className="text-yellow-800 text-sm mt-2">
              This button only migrates the data - the table must already exist.
            </p>
          </div>

          {status === 'idle' && (
            <>
              <button
                onClick={runMigration}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 font-medium mb-3"
              >
                Run Data Migration
              </button>
              <button
                onClick={async () => {
                  const res = await fetch('/api/admin/quick-fix-roles', { method: 'POST' });
                  const data = await res.json();
                  alert(JSON.stringify(data, null, 2));
                  window.location.reload();
                }}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium"
              >
                Quick Fix: Add My Roles Now
              </button>
            </>
          )}

          {status === 'running' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Running migration...</p>
            </div>
          )}

          {status === 'success' && result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-semibold text-green-900 mb-3">✓ Migration Successful!</h3>
              <div className="text-sm text-green-800 space-y-2">
                <p><strong>Users migrated:</strong> {result.migratedUsers}</p>
                <p><strong>Counselors migrated:</strong> {result.migratedCounselors}</p>
                <p><strong>Total users in database:</strong> {result.totalUsers}</p>
                <p><strong>Total roles in user_roles table:</strong> {result.totalRolesInDatabase}</p>
                {result.roleCounts && (
                  <div className="mt-3">
                    <p className="font-semibold">Role distribution:</p>
                    <ul className="ml-4 mt-1">
                      {Object.entries(result.roleCounts).map(([role, count]) => (
                        <li key={role}>
                          {role}: {count as number}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.sampleRoles && result.sampleRoles.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold">Sample roles:</p>
                    <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.sampleRoles, null, 2)}
                    </pre>
                  </div>
                )}
                {result.message && <p className="mt-3 text-green-700 italic">{result.message}</p>}
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Return to Admin Dashboard
                </button>
                {result.totalRolesInDatabase === 0 && (
                  <button
                    onClick={addAdminRole}
                    disabled={addingRole}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {addingRole ? 'Adding...' : 'Manually Add Admin Role'}
                  </button>
                )}
              </div>
            </div>
          )}

          {status === 'error' && result && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="font-semibold text-red-900 mb-3">✗ Migration Failed</h3>
              <div className="text-sm text-red-800 space-y-2">
                <p><strong>Error:</strong> {result.error}</p>
                {result.details && <p><strong>Details:</strong> {result.details}</p>}
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="mt-4 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-3">SQL Script to Run First</h2>
          <p className="text-sm text-gray-600 mb-3">
            Copy and paste this into your Supabase SQL Editor before running the data migration:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-xs overflow-x-auto">
{`-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'counselor', 'counselee')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can manage all roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );`}
          </pre>
        </div>
      </div>
    </div>
  );
}
