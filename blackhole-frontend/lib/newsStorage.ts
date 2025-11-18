/**
 * News Storage Utility
 * Handles saving and loading scraped news articles to/from localStorage
 */

export interface SavedNewsItem {
  id: string
  title: string
  description: string
  url: string
  source: string
  category: string
  imageUrl?: string
  publishedAt: string
  readTime?: string
  scrapedAt: string
  scrapedData?: any
  summary?: string
  insights?: any
}

const STORAGE_KEY = 'scraped_news_articles'
const MAX_SAVED_ARTICLES = 100 // Keep last 100 articles

/**
 * Save a scraped news article to localStorage
 */
export function saveScrapedNews(scrapedData: any, url: string): SavedNewsItem | null {
  try {
    if (!scrapedData || !url) return null

    // Extract information from scraped data
    const title = scrapedData.title || scrapedData.scraped_data?.title || 'Untitled Article'
    const description = scrapedData.summary?.text || 
                       scrapedData.summary || 
                       scrapedData.scraped_data?.content?.substring(0, 200) || 
                       'No description available'
    const source = extractSourceFromUrl(url)
    const category = detectCategory(title, description)
    const author = scrapedData.scraped_data?.author || source
    const date = scrapedData.scraped_data?.date || new Date().toISOString()
    
    // Calculate read time based on content length
    const contentLength = scrapedData.scraped_data?.content_length || description.length
    const readTime = Math.ceil(contentLength / 1000) + ' min read'

    // Create news item
    const newsItem: SavedNewsItem = {
      id: `scraped_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title,
      description: description.length > 200 ? description.substring(0, 200) + '...' : description,
      url: url,
      source: source,
      category: category,
      publishedAt: formatTimeAgo(date),
      readTime: readTime,
      scrapedAt: new Date().toISOString(),
      scrapedData: scrapedData,
      summary: typeof scrapedData.summary === 'string' ? scrapedData.summary : scrapedData.summary?.text,
      insights: scrapedData.vetting_results || scrapedData.insights
    }

    // Get existing articles
    const existing = getSavedNews()
    
    // Check if article with same URL already exists
    const existingIndex = existing.findIndex(item => item.url === url)
    if (existingIndex >= 0) {
      // Update existing article
      existing[existingIndex] = newsItem
    } else {
      // Add new article at the beginning
      existing.unshift(newsItem)
    }

    // Keep only the most recent articles
    const limited = existing.slice(0, MAX_SAVED_ARTICLES)
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
    
    // Dispatch custom event to notify feed of new article
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('newsArticleSaved', { detail: newsItem }))
    }
    
    return newsItem
  } catch (error) {
    console.error('Error saving scraped news:', error)
    return null
  }
}

/**
 * Get all saved news articles from localStorage
 */
export function getSavedNews(): SavedNewsItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const articles = JSON.parse(stored)
    return Array.isArray(articles) ? articles : []
  } catch (error) {
    console.error('Error loading saved news:', error)
    return []
  }
}

/**
 * Remove a saved news article
 */
export function removeSavedNews(id: string): boolean {
  try {
    const existing = getSavedNews()
    const filtered = existing.filter(item => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Error removing saved news:', error)
    return false
  }
}

/**
 * Clear all saved news
 */
export function clearSavedNews(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Error clearing saved news:', error)
    return false
  }
}

/**
 * Extract source name from URL
 */
function extractSourceFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
    // Remove www. and .com/.org/etc
    const source = hostname
      .replace(/^www\./, '')
      .split('.')
      .slice(0, -1)
      .join(' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    return source || 'Unknown Source'
  } catch {
    return 'Unknown Source'
  }
}

/**
 * Detect category from title and description
 */
function detectCategory(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase()
  
  if (text.match(/\b(tech|ai|software|computer|digital|internet|cyber|code|programming)\b/)) {
    return 'technology'
  }
  if (text.match(/\b(business|economy|market|stock|finance|trade|company|corporate)\b/)) {
    return 'business'
  }
  if (text.match(/\b(science|research|study|discovery|experiment|scientist)\b/)) {
    return 'science'
  }
  if (text.match(/\b(health|medical|doctor|hospital|disease|treatment|medicine)\b/)) {
    return 'health'
  }
  if (text.match(/\b(climate|environment|green|carbon|emission|renewable|energy)\b/)) {
    return 'environment'
  }
  if (text.match(/\b(entertainment|movie|music|celebrity|show|film|tv)\b/)) {
    return 'entertainment'
  }
  if (text.match(/\b(education|school|university|student|learn|teach)\b/)) {
    return 'education'
  }
  
  return 'general'
}

/**
 * Format timestamp to "time ago" format
 */
function formatTimeAgo(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    
    return date.toLocaleDateString()
  } catch {
    return 'Recently'
  }
}

