'use client'

import { useEffect, useState } from 'react'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface AuthToastProps {
  message: string
  type: 'error' | 'warning' | 'info' | 'success'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function AuthToast({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000
}: AuthToastProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(onClose, 300) // Wait for animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible && !isAnimating) return null

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500/20 border-red-500/50'
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50'
      case 'info':
        return 'bg-blue-500/20 border-blue-500/50'
      case 'success':
        return 'bg-green-500/20 border-green-500/50'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div
        className={`glass-effect rounded-xl p-4 border shadow-lg flex items-center space-x-3 min-w-[300px] max-w-md ${getBgColor()}`}
      >
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

