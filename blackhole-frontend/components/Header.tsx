'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Activity, Clock, Users, LogIn } from 'lucide-react'

interface HeaderProps {
  backendStatus: 'online' | 'offline' | 'checking'
}

export default function Header({ backendStatus }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasToken, setHasToken] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true)
    
    // Check if user has JWT token
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('jwt_token') || process.env.NEXT_PUBLIC_JWT_TOKEN
        setHasToken(!!token)
      } catch {
        setHasToken(false)
      }
    }
    checkAuth()
    // Re-check on storage changes
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-red-500'
      case 'checking': return 'bg-yellow-500 animate-pulse'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (backendStatus) {
      case 'online': return 'Backend Online'
      case 'offline': return 'Backend Offline'
      case 'checking': return 'Checking...'
      default: return 'Unknown'
    }
  }

  const navItems = [
    { href: '/', label: '🏠 Home', id: 'home' },
    { href: '/live', label: '🔴 Live Dashboard', id: 'live' },
    { href: '/feed', label: '📰 News Feed', id: 'feed' },
    { href: '/dashboard', label: '📊 Analytics', id: 'dashboard' },
    { href: '/advanced', label: '🔬 Analysis', id: 'analysis' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="glass-effect border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <div className="relative w-12 h-12 bg-black rounded-full flex items-center justify-center overflow-hidden">
              <div className="absolute w-8 h-8 bg-white rounded-full transform -translate-x-0.5"></div>
              <div className="absolute w-4 h-4 bg-black rounded-full z-10 transform -translate-x-0.5"></div>
              <div className="absolute w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform -rotate-30 animate-spin"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Blackhole Infiverse LLP</h1>
              <p className="text-sm text-gray-400">Advanced AI Pipeline</p>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`transition-colors ${
                  isActive(item.href)
                    ? 'text-purple-400 font-medium'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Status, Stats, and Login */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Backend Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
              <span className="text-sm text-gray-300">{getStatusText()}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Activity className="w-4 h-4" />
                <span>8/7 Online</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>921hrs</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>Active</span>
              </div>
            </div>

            {/* Login Button */}
            <Link
              href="/login"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                pathname === '/login'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : mounted && hasToken
                  ? 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'
                  : 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span className="text-sm font-medium">
                {mounted && hasToken ? 'Auth' : 'Login'}
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10">
            <nav className="flex flex-col space-y-4 mt-4">
              {navItems.map((item) => (
                <Link
                  key={`mobile-${item.id}`}
                  href={item.href}
                  className={`transition-colors ${
                    isActive(item.href)
                      ? 'text-purple-400 font-medium'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Login Button */}
              <Link
                href="/login"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all mt-2 ${
                  pathname === '/login'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : mounted && hasToken
                    ? 'bg-white/10 text-gray-300'
                    : 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {mounted && hasToken ? 'Authentication' : 'Login'}
                </span>
              </Link>
              
              {/* Mobile Status */}
              <div className="flex items-center space-x-2 pt-4 border-t border-white/10">
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                <span className="text-sm text-gray-300">{getStatusText()}</span>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}