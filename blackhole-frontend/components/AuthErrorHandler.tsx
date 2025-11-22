'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthErrorModal from './AuthErrorModal'
import AuthToast from './AuthToast'

interface AuthErrorDetail {
  type: '401' | '403'
  message: string
}

interface AuthToastDetail {
  message: string
  type: 'error' | 'warning' | 'info' | 'success'
}

export default function AuthErrorHandler() {
  const router = useRouter()
  const [authError, setAuthError] = useState<AuthErrorDetail | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'error' | 'warning' | 'info' | 'success'>('error')
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    // Listen for auth error events
    const handleAuthError = (event: CustomEvent<AuthErrorDetail>) => {
      setAuthError({
        type: event.detail.type,
        message: event.detail.message
      })
    }

    // Listen for toast events
    const handleAuthToast = (event: CustomEvent<AuthToastDetail>) => {
      setToastMessage(event.detail.message)
      setToastType(event.detail.type)
      setShowToast(true)
    }

    window.addEventListener('authError', handleAuthError as EventListener)
    window.addEventListener('authToast', handleAuthToast as EventListener)

    return () => {
      window.removeEventListener('authError', handleAuthError as EventListener)
      window.removeEventListener('authToast', handleAuthToast as EventListener)
    }
  }, [])

  const handleCloseModal = () => {
    setAuthError(null)
  }

  const handleRetry = () => {
    // Reload the page to retry
    window.location.reload()
  }

  const handleCloseToast = () => {
    setShowToast(false)
    setToastMessage(null)
  }

  return (
    <>
      <AuthErrorModal
        isOpen={!!authError}
        errorType={authError?.type || null}
        onClose={handleCloseModal}
        onRetry={handleRetry}
      />
      <AuthToast
        message={toastMessage || ''}
        type={toastType}
        isVisible={showToast}
        onClose={handleCloseToast}
      />
    </>
  )
}

