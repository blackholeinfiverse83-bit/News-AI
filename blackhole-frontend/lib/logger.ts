/**
 * Development-only logger utility
 * Logs are automatically removed in production builds
 */

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args)
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args)
  },
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args)
  },
  info: (...args: any[]) => {
    if (isDev) console.info(...args)
  },
}

