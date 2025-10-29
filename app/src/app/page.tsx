import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Counseling Portal
          </h1>
          <p className="text-gray-600">
            Welcome to our church counseling ministry
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Quick Access
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <Link
              href="/admin"
              className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-xs font-medium text-gray-700">Admin</div>
            </Link>
            <Link
              href="/counselor"
              className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-xs font-medium text-gray-700">Counselor</div>
            </Link>
            <Link
              href="/counselee"
              className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-xs font-medium text-gray-700">Counselee</div>
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Need help? Contact your church administrator</p>
        </div>
      </div>
    </div>
  )
}
