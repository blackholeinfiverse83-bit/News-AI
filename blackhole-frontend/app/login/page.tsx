'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogIn, Lock, Key, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import Header from '@/components/Header'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [jwtToken, setJwtToken] = useState('')
  const [hmacSecret, setHmacSecret] = useState('')
  const [showJWT, setShowJWT] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking')

  const redirectTo = searchParams.get('redirect') || '/'

  useEffect(() => {
    // Check if already authenticated
    const existingToken = localStorage.getItem('jwt_token') || process.env.NEXT_PUBLIC_JWT_TOKEN
    if (existingToken) {
      // Pre-fill token if exists
      setJwtToken(existingToken)
    }

    // Check backend status
    checkBackendHealth()
  }, [])

  const checkBackendHealth = async () => {
    try {
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      setBackendStatus(response.ok ? 'online' : 'offline')
    } catch {
      setBackendStatus('offline')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate inputs
      if (!jwtToken.trim()) {
        setError('JWT Token is required')
        setIsSubmitting(false)
        return
      }

      // Store JWT token in localStorage (for development)
      localStorage.setItem('jwt_token', jwtToken)

      // Store HMAC secret if provided (note: in production, this should be handled server-side)
      if (hmacSecret.trim()) {
        // Note: We can't set env vars at runtime, but we can store in localStorage
        // The security.ts file already checks localStorage as fallback
        console.warn('HMAC Secret should be set in .env.local for production use')
      }

      setSuccess(true)

      // Wait a moment to show success message
      setTimeout(() => {
        router.push(redirectTo)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save authentication credentials')
      setIsSubmitting(false)
    }
  }

  const handleTestConnection = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const testHeaders: { [key: string]: string } = {
        'Content-Type': 'application/json'
      }

      if (jwtToken) {
        testHeaders['Authorization'] = `Bearer ${jwtToken}`
      }

      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        headers: testHeaders
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else if (response.status === 401) {
        setError('Authentication failed: Invalid JWT token')
      } else if (response.status === 403) {
        setError('Authorization failed: Insufficient permissions')
      } else {
        setError(`Connection failed: ${response.status} ${response.statusText}`)
      }
    } catch (err) {
      setError('Failed to connect to backend. Is it running?')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header backendStatus={backendStatus} />

      <main className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Authentication</h1>
            <p className="text-gray-400">
              Enter your credentials to access the News AI platform
            </p>
          </div>

          {/* Login Form */}
          <div className="glass-effect rounded-2xl p-8 border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* JWT Token Input */}
              <div>
                <label htmlFor="jwt" className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>JWT Token</span>
                    <span className="text-red-400">*</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    id="jwt"
                    type={showJWT ? 'text' : 'password'}
                    value={jwtToken}
                    onChange={(e) => setJwtToken(e.target.value)}
                    placeholder="Enter your JWT token"
                    className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowJWT(!showJWT)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Toggle JWT visibility"
                  >
                    {showJWT ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Get this from your backend administrator or set in .env.local
                </p>
              </div>

              {/* HMAC Secret Input (Optional) */}
              <div>
                <label htmlFor="hmac" className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>HMAC Secret</span>
                    <span className="text-gray-500 text-xs">(Optional)</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    id="hmac"
                    type={showSecret ? 'text' : 'password'}
                    value={hmacSecret}
                    onChange={(e) => setHmacSecret(e.target.value)}
                    placeholder="Enter HMAC secret (optional)"
                    className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Toggle secret visibility"
                  >
                    {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Should match the secret configured on backend services
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-200">Authentication saved! Redirecting...</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Save & Continue</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isSubmitting || !jwtToken}
                  className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test Connection
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full px-4 py-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Continue without authentication
                </button>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-xs text-blue-200">
                <strong>Development Mode:</strong> In production, authentication should be handled through a secure login flow. This page is for development/testing purposes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

