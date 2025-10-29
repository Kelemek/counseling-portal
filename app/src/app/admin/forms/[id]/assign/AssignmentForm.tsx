'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Counselor = {
  id: string;
  email: string;
  counselor_profiles: any;
};

export default function AssignmentForm({
  formId,
  counselors,
}: {
  formId: string;
  counselors: Counselor[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    counselor_id: '',
    notes: '',
    due_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/assign-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intake_form_id: formId,
          counselor_id: formData.counselor_id,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign form');
      }

      // Redirect to the form detail page
      router.push(`/admin/forms/${formId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="counselor"
          className="block text-sm font-medium text-gray-700"
        >
          Select Counselor *
        </label>
        <select
          id="counselor"
          required
          value={formData.counselor_id}
          onChange={(e) =>
            setFormData({ ...formData, counselor_id: e.target.value })
          }
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
        >
          <option value="" className="text-gray-500">Choose a counselor...</option>
          {counselors.map((counselor) => {
            const profile = Array.isArray(counselor.counselor_profiles)
              ? counselor.counselor_profiles[0]
              : counselor.counselor_profiles;
            
            return (
              <option key={counselor.id} value={counselor.id} className="text-gray-900">
                {counselor.email}
                {profile?.specialties && profile.specialties.length > 0 &&
                  ` - ${profile.specialties.join(', ')}`}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label
          htmlFor="due_date"
          className="block text-sm font-medium text-gray-700"
        >
          Due Date (Optional)
        </label>
        <input
          type="date"
          id="due_date"
          value={formData.due_date}
          onChange={(e) =>
            setFormData({ ...formData, due_date: e.target.value })
          }
          className="mt-1 block w-full text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          placeholder="Add any notes or instructions for the counselor..."
          className="mt-1 block w-full text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Assigning...' : 'Assign Form'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
