'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, Lock, Shield, LogIn, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AuthErrorModalProps {
  isOpen: boolean
  errorType: '401' | '403' | null
  onClose: () => void
  onRetry?: () => void
}

export default function AuthErrorModal({
  isOpen,
  errorType,
  onClose,
  onRetry
}: AuthErrorModalProps) {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !errorType) return null

  const handleLogin = () => {
    setIsRedirecting(true)
    router.push('/login')
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    }
    onClose()
  }

  const isUnauthorized = errorType === '401'
  const title = isUnauthorized ? 'Authentication Required' : 'Access Denied'
  const message = isUnauthorized
    ? 'Your session has expired or the authentication token is invalid. Please log in again to continue.'
    : 'You do not have permission to access this resource. Please contact your administrator if you believe this is an error.'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-md border border-white/10 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center space-x-3">
            {isUnauthorized ? (
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-400" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-sm text-gray-400">Error Code: {errorType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className={`w-5 h-5 mt-0.5 ${isUnauthorized ? 'text-red-400' : 'text-orange-400'}`} />
            <p className="text-gray-300 leading-relaxed">{message}</p>
          </div>

          {isUnauthorized && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-200">
                <strong>Note:</strong> Your authentication token has been cleared. You'll need to log in again to continue using the application.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col space-y-3 pt-4">
            {isUnauthorized ? (
              <>
                <button
                  onClick={handleLogin}
                  disabled={isRedirecting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRedirecting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Redirecting...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Go to Login Page</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleRetry}
                  className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Request</span>
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

