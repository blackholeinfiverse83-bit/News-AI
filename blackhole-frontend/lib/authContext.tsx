'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface AuthError {
  type: '401' | '403' | null
  message: string
}

interface AuthContextType {
  authError: AuthError | null
  showAuthError: (type: '401' | '403', message?: string) => void
  clearAuthError: () => void
  toastMessage: string | null
  toastType: 'error' | 'warning' | 'info' | 'success'
  showToast: (message: string, type?: 'error' | 'warning' | 'info' | 'success') => void
  hideToast: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authError, setAuthError] = useState<AuthError | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'error' | 'warning' | 'info' | 'success'>('error')

  const showAuthError = useCallback((type: '401' | '403', message?: string) => {
    setAuthError({
      type,
      message: message || (type === '401' 
        ? 'Your session has expired. Please log in again.'
        : 'You do not have permission to access this resource.')
    })
  }, [])

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  const showToast = useCallback((message: string, type: 'error' | 'warning' | 'info' | 'success' = 'error') => {
    setToastMessage(message)
    setToastType(type)
  }, [])

  const hideToast = useCallback(() => {
    setToastMessage(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        authError,
        showAuthError,
        clearAuthError,
        toastMessage,
        toastType,
        showToast,
        hideToast
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

