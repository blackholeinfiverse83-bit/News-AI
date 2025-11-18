'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, SkipForward, CheckCircle, Flag, MessageSquare } from 'lucide-react'
import apiService from '@/services/api'

interface FeedbackPanelProps {
  newsId: string
  currentFeedback?: {
    likes: number
    skips: number
    flags: number
  }
  onFeedbackSubmit?: (type: string) => void
}

export default function FeedbackPanel({ 
  newsId, 
  currentFeedback = { likes: 0, skips: 0, flags: 0 },
  onFeedbackSubmit 
}: FeedbackPanelProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showFlagForm, setShowFlagForm] = useState(false)
  const [flagReason, setFlagReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFeedback = async (type: 'like' | 'skip' | 'approve' | 'flag') => {
    setIsSubmitting(true)
    
    try {
      // Submit to API
      await apiService.submitFeedback(newsId, type, {
        previousFeedback: feedbackGiven,
        timestamp: new Date().toISOString()
      })

      // Update local state
      setFeedbackGiven(type)
      
      // Show toast notification
      const messages: Record<string, string> = {
        like: '👍 Thanks for the positive feedback!',
        skip: '⏭️ Skipped - We\'ll improve future recommendations',
        approve: '✅ Approved - This helps train our AI',
        flag: '🚩 Flagged - Our team will review this content'
      }
      
      setToastMessage(messages[type])
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)

      // Callback
      if (onFeedbackSubmit) {
        onFeedbackSubmit(type)
      }
    } catch (error) {
      console.error('Feedback submission error:', error)
      setToastMessage('❌ Failed to submit feedback')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFlag = async () => {
    if (!flagReason.trim()) {
      setToastMessage('⚠️ Please provide a reason for flagging')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    setIsSubmitting(true)
    
    try {
      await apiService.submitFeedback(newsId, 'flag', {
        reason: flagReason,
        timestamp: new Date().toISOString()
      })

      setFeedbackGiven('flag')
      setToastMessage('🚩 Content flagged - Thank you for reporting')
      setShowToast(true)
      setShowFlagForm(false)
      setFlagReason('')
      setTimeout(() => setShowToast(false), 3000)

      if (onFeedbackSubmit) {
        onFeedbackSubmit('flag')
      }
    } catch (error) {
      console.error('Flag submission error:', error)
      setToastMessage('❌ Failed to submit flag')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-white/20">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center mb-1">
          <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
          Feedback & Learning
        </h3>
        <p className="text-sm text-gray-400">Help improve our AI recommendations</p>
      </div>

      {/* Feedback Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Like Button */}
        <button
          onClick={() => handleFeedback('like')}
          disabled={isSubmitting || feedbackGiven === 'like'}
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
            feedbackGiven === 'like'
              ? 'border-green-400 bg-green-400/20 text-green-400'
              : 'border-white/20 bg-black/20 hover:border-green-400 hover:bg-green-400/10 text-gray-300'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <ThumbsUp className={`w-6 h-6 mb-2 ${feedbackGiven === 'like' ? 'fill-current' : ''}`} />
          <span className="text-sm font-semibold">Like</span>
          <span className="text-xs text-gray-500 mt-1">{currentFeedback.likes} votes</span>
        </button>

        {/* Skip Button */}
        <button
          onClick={() => handleFeedback('skip')}
          disabled={isSubmitting || feedbackGiven === 'skip'}
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
            feedbackGiven === 'skip'
              ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
              : 'border-white/20 bg-black/20 hover:border-yellow-400 hover:bg-yellow-400/10 text-gray-300'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <SkipForward className="w-6 h-6 mb-2" />
          <span className="text-sm font-semibold">Skip</span>
          <span className="text-xs text-gray-500 mt-1">{currentFeedback.skips} skips</span>
        </button>

        {/* Approve Button */}
        <button
          onClick={() => handleFeedback('approve')}
          disabled={isSubmitting || feedbackGiven === 'approve'}
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
            feedbackGiven === 'approve'
              ? 'border-blue-400 bg-blue-400/20 text-blue-400'
              : 'border-white/20 bg-black/20 hover:border-blue-400 hover:bg-blue-400/10 text-gray-300'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <CheckCircle className={`w-6 h-6 mb-2 ${feedbackGiven === 'approve' ? 'fill-current' : ''}`} />
          <span className="text-sm font-semibold">Approve</span>
          <span className="text-xs text-gray-500 mt-1">High quality</span>
        </button>

        {/* Flag Button */}
        <button
          onClick={() => setShowFlagForm(!showFlagForm)}
          disabled={isSubmitting || feedbackGiven === 'flag'}
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
            feedbackGiven === 'flag'
              ? 'border-red-400 bg-red-400/20 text-red-400'
              : 'border-white/20 bg-black/20 hover:border-red-400 hover:bg-red-400/10 text-gray-300'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Flag className={`w-6 h-6 mb-2 ${feedbackGiven === 'flag' ? 'fill-current' : ''}`} />
          <span className="text-sm font-semibold">Flag</span>
          <span className="text-xs text-gray-500 mt-1">{currentFeedback.flags} flags</span>
        </button>
      </div>

      {/* Flag Form */}
      {showFlagForm && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <label className="block text-sm text-white mb-2">Why are you flagging this content?</label>
          <textarea
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            placeholder="Misinformation, inappropriate content, spam, etc..."
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            rows={3}
          />
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleFlag}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Submit Flag
            </button>
            <button
              onClick={() => {
                setShowFlagForm(false)
                setFlagReason('')
              }}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* RL Info Box */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-lg">🧠</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Reinforcement Learning</h4>
            <p className="text-xs text-gray-400">
              Your feedback helps train our AI to provide better news recommendations. Each interaction improves the system's understanding of quality content.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/30 rounded px-2 py-1">
                <span className="text-gray-500">Model Version:</span>
                <span className="text-white ml-1 font-semibold">v2.3.1</span>
              </div>
              <div className="bg-black/30 rounded px-2 py-1">
                <span className="text-gray-500">Accuracy:</span>
                <span className="text-green-400 ml-1 font-semibold">94.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-gray-900 border border-white/20 rounded-lg shadow-lg px-4 py-3 flex items-center space-x-3">
            <span className="text-white text-sm">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}

