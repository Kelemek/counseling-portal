'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Key, Copy, Check, AlertCircle } from 'lucide-react'

export default function GenerateCounseleeAccountPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [formId, setFormId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [credentials, setCredentials] = useState<{
    email: string
    password: string
    name: string
  } | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [counseleeData, setCounseleeData] = useState<{
    name: string
    email: string
  } | null>(null)

  const router = useRouter()

  useEffect(() => {
    params.then(({ id }) => {
      setFormId(id)
      fetchFormData(id)
    })
  }, [])

  const fetchFormData = async (id: string) => {
    try {
      // Fetch the form submission to get counselee info
      const response = await fetch(`/api/counselor/forms/${id}`)
      if (response.ok) {
        const data = await response.json()
        
        // Extract name and email from form data
        let name = 'Counselee'
        let email = ''
        
        if (data.submission?.data?.pretty) {
          const prettyText = data.submission.data.pretty as string
          const parts = prettyText.split(/,\s*(?=[A-Z])/)
          
          parts.forEach(part => {
            const [label, value] = part.split(':').map(s => s.trim())
            if (label?.toLowerCase().includes('name') && value) {
              name = value
            }
            if (label?.toLowerCase().includes('email') && value) {
              email = value
            }
          })
        }
        
        setCounseleeData({ name, email })
      }
    } catch (err) {
      console.error('Error fetching form:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!counseleeData?.email) {
      setError('No email address found in form submission')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/counselor/generate-counselee-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId,
          counseleeName: counseleeData.name,
          counseleeEmail: counseleeData.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate account')
      }

      setCredentials(data.credentials)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/counselor/forms/${formId}`}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Generate Counselee Account
              </h1>
              <p className="text-sm text-gray-600">
                Create login credentials for your counselee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!credentials ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Account Information
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                A secure account will be created with the following information from the intake form:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Name</div>
                    <div className="text-sm text-gray-900">{counseleeData?.name}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Email</div>
                    <div className="text-sm text-gray-900">{counseleeData?.email}</div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                <li>A secure random password will be generated</li>
                <li>An account will be created for the counselee</li>
                <li>You'll receive the login credentials to share with them</li>
                <li>The counselee can change their password after first login</li>
              </ul>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !counseleeData?.email}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating Account...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Generate Account & Password
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6 text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Account Created Successfully!
              </h2>
              <p className="text-sm text-gray-600">
                Share these credentials with your counselee
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Name</span>
                  </div>
                </div>
                <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {credentials.name}
                </div>
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Email/Username</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentials.email, 'email')}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    {copiedField === 'email' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {credentials.email}
                </div>
              </div>

              <div className="border border-yellow-300 bg-yellow-50 rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-yellow-700" />
                    <span className="text-sm font-medium text-yellow-900">Temporary Password</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentials.password, 'password')}
                    className="text-yellow-700 hover:text-yellow-800 text-sm flex items-center gap-1"
                  >
                    {copiedField === 'password' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="text-sm text-gray-900 font-mono bg-white p-2 rounded border border-yellow-200">
                  {credentials.password}
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  ⚠️ Make sure to save this password - it won't be shown again!
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions for Counselee</h3>
              <ol className="text-sm text-blue-700 space-y-1 ml-4 list-decimal">
                <li>Go to the login page</li>
                <li>Enter the email and password provided above</li>
                <li>You'll be prompted to change your password on first login</li>
                <li>Access your counseling portal and resources</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/counselor/forms/${formId}`}
                className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Form
              </Link>
              <Link
                href="/counselor/counselees"
                className="flex-1 text-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                View All Counselees
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
