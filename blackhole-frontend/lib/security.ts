/**
 * Security Primitives for SSPL-III Compliance
 * 
 * Implements:
 * - JWT token handling
 * - Nonce generation for anti-replay protection
 * - HMAC-SHA256 request signing
 */

/**
 * Get JWT token from environment variable
 * In production, this should be obtained from a secure login flow
 */
export function getJWT(): string | null {
  if (typeof window === 'undefined') {
    // Server-side: use process.env
    return process.env.NEXT_PUBLIC_JWT_TOKEN || null
  }
  
  // Client-side: use environment variable (set at build time)
  // For development, can also check localStorage as fallback
  const envToken = process.env.NEXT_PUBLIC_JWT_TOKEN
  if (envToken) {
    return envToken
  }
  
  // Fallback: check localStorage (for development/testing)
  try {
    const storedToken = localStorage.getItem('jwt_token')
    if (storedToken) {
      return storedToken
    }
  } catch (error) {
    console.warn('Failed to read JWT from localStorage:', error)
  }
  
  return null
}

/**
 * Generate a unique nonce for each request
 * Nonces prevent replay attacks by ensuring each request is unique
 */
export function generateNonce(): string {
  // Generate a cryptographically random nonce
  // Format: timestamp + random string
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  const extraRandom = Math.random().toString(36).substring(2, 15)
  
  return `${timestamp}-${randomPart}-${extraRandom}`
}

/**
 * Get HMAC secret from environment variable
 */
function getHMACSecret(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_HMAC_SECRET || ''
  }
  
  const secret = process.env.NEXT_PUBLIC_HMAC_SECRET
  if (!secret) {
    console.warn('HMAC_SECRET not found in environment variables')
    return ''
  }
  
  return secret
}

/**
 * Sign a request using HMAC-SHA256
 * 
 * @param method - HTTP method (GET, POST, etc.)
 * @param url - Request URL (path + query string)
 * @param body - Request body (stringified JSON)
 * @param nonce - Nonce for this request
 * @param timestamp - Request timestamp (optional, defaults to current time)
 * @returns HMAC-SHA256 signature as hex string
 */
export async function signRequest(
  method: string,
  url: string,
  body: string = '',
  nonce: string,
  timestamp?: number
): Promise<string> {
  const secret = getHMACSecret()
  
  if (!secret) {
    console.warn('Cannot sign request: HMAC_SECRET not configured')
    return ''
  }
  
  const requestTimestamp = timestamp || Date.now()
  
  // Create the string to sign
  // Format: method|url|body|nonce|timestamp
  const stringToSign = `${method.toUpperCase()}|${url}|${body}|${nonce}|${requestTimestamp}`
  
  try {
    // Use Web Crypto API for HMAC-SHA256
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(stringToSign)
    
    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: 'HMAC',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    )
    
    // Sign the message
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signature))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return hashHex
  } catch (error) {
    console.error('Failed to sign request:', error)
    return ''
  }
}

/**
 * Create security headers for API requests
 * 
 * @param method - HTTP method
 * @param url - Request URL
 * @param body - Request body (will be stringified if object)
 * @returns Object with security headers
 */
export async function createSecurityHeaders(
  method: string,
  url: string,
  body?: any
): Promise<{
  'Authorization'?: string
  'X-Client-Nonce': string
  'X-Signature': string
  'X-Timestamp': string
}> {
  const jwt = getJWT()
  const nonce = generateNonce()
  const timestamp = Date.now()
  
  // Stringify body if it's an object
  const bodyString = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : ''
  
  // Generate signature
  const signature = await signRequest(method, url, bodyString, nonce, timestamp)
  
  const headers: {
    'Authorization'?: string
    'X-Client-Nonce': string
    'X-Signature': string
    'X-Timestamp': string
  } = {
    'X-Client-Nonce': nonce,
    'X-Signature': signature,
    'X-Timestamp': timestamp.toString(),
  }
  
  // Add JWT if available
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`
  }
  
  return headers
}

/**
 * Handle authentication errors (401/403)
 * Triggers UI components (modal, toast) and clears invalid tokens
 */
export function handleAuthError(status: number, response?: Response): void {
  if (typeof window === 'undefined') {
    // Server-side: just log
    if (status === 401) {
      console.error('Authentication failed: Invalid or expired JWT token')
    } else if (status === 403) {
      console.error('Authorization failed: Insufficient permissions')
    }
    return
  }

  if (status === 401) {
    console.error('Authentication failed: Invalid or expired JWT token')
    
    // Clear stored token
    try {
      localStorage.removeItem('jwt_token')
    } catch (e) {
      // Ignore localStorage errors
    }

    // Dispatch custom event to trigger UI
    const event = new CustomEvent('authError', {
      detail: {
        type: '401',
        message: 'Your session has expired. Please log in again.'
      }
    })
    window.dispatchEvent(event)

    // Also show toast notification
    const toastEvent = new CustomEvent('authToast', {
      detail: {
        message: 'Authentication failed: Please log in again',
        type: 'error'
      }
    })
    window.dispatchEvent(toastEvent)

  } else if (status === 403) {
    console.error('Authorization failed: Insufficient permissions')

    // Dispatch custom event to trigger UI
    const event = new CustomEvent('authError', {
      detail: {
        type: '403',
        message: 'You do not have permission to access this resource.'
      }
    })
    window.dispatchEvent(event)

    // Also show toast notification
    const toastEvent = new CustomEvent('authToast', {
      detail: {
        message: 'Access denied: Insufficient permissions',
        type: 'warning'
      }
    })
    window.dispatchEvent(toastEvent)
  }
}

