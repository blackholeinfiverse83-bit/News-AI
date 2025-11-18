'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import BackendStatus from '@/components/BackendStatus'
import { checkBackendHealth } from '@/lib/api'
import { getSavedNews, removeSavedNews, SavedNewsItem } from '@/lib/newsStorage'
import { Search, Filter, TrendingUp, Clock, Globe, Newspaper, Trash2, PlayCircle, X } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  source: string
  category: string
  imageUrl?: string
  publishedAt: string
  readTime?: string
  isScraped?: boolean
  relatedVideos?: Array<{
    title?: string
    url?: string
    thumbnail?: string
    duration?: string
    source?: string
  }>
}

export default function NewsFeed() {
  const router = useRouter()
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [activeVideo, setActiveVideo] = useState<{
    article: NewsItem
    video: NonNullable<NewsItem['relatedVideos']>[number]
  } | null>(null)

  useEffect(() => {
    checkBackend()
    loadNewsFeed()
    const interval = setInterval(checkBackend, 30000)
    
    // Listen for storage changes to refresh feed when new articles are added
    const handleStorageChange = () => {
      loadNewsFeed()
    }
    window.addEventListener('storage', handleStorageChange)
    
    // Listen for custom event when articles are saved in same tab
    const handleNewsSaved = () => {
      loadNewsFeed()
    }
    window.addEventListener('newsArticleSaved', handleNewsSaved)
    
    // Also check periodically for changes (in case same tab adds articles)
    const refreshInterval = setInterval(loadNewsFeed, 3000)
    
    return () => {
      clearInterval(interval)
      clearInterval(refreshInterval)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('newsArticleSaved', handleNewsSaved)
    }
  }, [])

  const checkBackend = async () => {
    try {
      const isHealthy = await checkBackendHealth()
      setBackendStatus(isHealthy ? 'online' : 'offline')
    } catch (error) {
      setBackendStatus('offline')
    }
  }

  const loadNewsFeed = () => {
    // Load saved scraped articles from localStorage
    const savedArticles = getSavedNews()
    const scrapedNews: NewsItem[] = savedArticles.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      url: item.url,
      source: item.source,
      category: item.category,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt,
      readTime: item.readTime,
      isScraped: true,
      relatedVideos: item.relatedVideos
    }))

    // Sample news items - in production, this would come from an API
    const sampleNews: NewsItem[] = [
      {
        id: '1',
        title: 'Breaking: Major AI Breakthrough in Natural Language Processing',
        description: 'Researchers announce significant advancement in AI language models, enabling more accurate and context-aware responses.',
        url: 'https://www.bbc.com/news/technology',
        source: 'BBC News',
        category: 'technology',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        publishedAt: '2 hours ago',
        readTime: '5 min read'
      },
      {
        id: '2',
        title: 'Global Climate Summit Reaches Historic Agreement',
        description: 'World leaders commit to ambitious new targets for carbon emission reductions by 2030.',
        url: 'https://www.reuters.com/sustainability/climate-energy/',
        source: 'Reuters',
        category: 'environment',
        imageUrl: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b3?w=800',
        publishedAt: '4 hours ago',
        readTime: '7 min read'
      },
      {
        id: '3',
        title: 'Tech Giants Announce Major Partnership in Quantum Computing',
        description: 'Leading technology companies join forces to accelerate quantum computing research and development.',
        url: 'https://www.theverge.com/tech',
        source: 'The Verge',
        category: 'technology',
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
        publishedAt: '6 hours ago',
        readTime: '4 min read'
      },
      {
        id: '4',
        title: 'Stock Markets Rally on Positive Economic Data',
        description: 'Major indices see significant gains following better-than-expected employment and inflation figures.',
        url: 'https://www.cnbc.com/world-markets/',
        source: 'CNBC',
        category: 'business',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        publishedAt: '8 hours ago',
        readTime: '6 min read'
      },
      {
        id: '5',
        title: 'New Study Reveals Health Benefits of Mediterranean Diet',
        description: 'Long-term research shows significant improvements in cardiovascular health and longevity.',
        url: 'https://www.theguardian.com/science',
        source: 'The Guardian',
        category: 'health',
        imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
        publishedAt: '10 hours ago',
        readTime: '5 min read'
      },
      {
        id: '6',
        title: 'Space Agency Announces Plans for Mars Mission',
        description: 'Ambitious new timeline set for crewed mission to Mars, with launch targeted for 2030.',
        url: 'https://www.space.com/news',
        source: 'Space.com',
        category: 'science',
        imageUrl: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800',
        publishedAt: '12 hours ago',
        readTime: '8 min read'
      },
      {
        id: '7',
        title: 'Cybersecurity Alert: New Vulnerability Discovered',
        description: 'Security researchers identify critical flaw affecting millions of devices worldwide.',
        url: 'https://www.wired.com/category/security/',
        source: 'Wired',
        category: 'technology',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
        publishedAt: '14 hours ago',
        readTime: '6 min read'
      },
      {
        id: '8',
        title: 'Entertainment Industry Embraces Virtual Reality',
        description: 'Major studios announce slate of VR experiences, signaling shift in entertainment consumption.',
        url: 'https://variety.com/v/digital/',
        source: 'Variety',
        category: 'entertainment',
        imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800',
        publishedAt: '16 hours ago',
        readTime: '5 min read'
      },
      {
        id: '9',
        title: 'Electric Vehicle Sales Surge in Major Markets',
        description: 'Latest figures show record adoption rates as prices decline and charging infrastructure expands.',
        url: 'https://www.cnn.com/business/tech',
        source: 'CNN Business',
        category: 'business',
        imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
        publishedAt: '18 hours ago',
        readTime: '4 min read'
      },
      {
        id: '10',
        title: 'Breakthrough in Renewable Energy Storage Technology',
        description: 'Scientists develop new battery technology promising longer lifespan and faster charging.',
        url: 'https://www.scientificamerican.com/energy-sustainability/',
        source: 'Scientific American',
        category: 'science',
        imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
        publishedAt: '20 hours ago',
        readTime: '7 min read'
      },
      {
        id: '11',
        title: 'Global Education Initiative Reaches 1 Million Students',
        description: 'International program providing free online education celebrates major milestone.',
        url: 'https://www.edweek.org/technology',
        source: 'Education Week',
        category: 'education',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
        publishedAt: '22 hours ago',
        readTime: '5 min read'
      },
      {
        id: '12',
        title: 'Artificial Intelligence in Healthcare Shows Promise',
        description: 'AI diagnostic tools demonstrate accuracy comparable to experienced physicians in recent trials.',
        url: 'https://www.healthcareitnews.com/',
        source: 'Healthcare IT News',
        category: 'health',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
        publishedAt: '1 day ago',
        readTime: '6 min read'
      }
    ]
    
    // Merge scraped articles (first) with sample news
    // Scraped articles appear first, then sample news
    const allNews = [...scrapedNews, ...sampleNews]
    setNewsItems(allNews)
  }

  const categories = [
    { id: 'all', name: 'All', icon: Globe },
    { id: 'technology', name: 'Technology', icon: TrendingUp },
    { id: 'business', name: 'Business', icon: Newspaper },
    { id: 'science', name: 'Science', icon: Clock },
    { id: 'health', name: 'Health', icon: Filter },
    { id: 'environment', name: 'Environment', icon: Globe },
    { id: 'entertainment', name: 'Entertainment', icon: Newspaper },
    { id: 'education', name: 'Education', icon: Clock }
  ]

  const filteredNews = newsItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAnalyzeArticle = (url: string) => {
    // Navigate to home page with the URL pre-filled
    router.push(`/?url=${encodeURIComponent(url)}`)
  }

  const handleNewsCardClick = (news: NewsItem) => {
    if (news.isScraped && news.relatedVideos && news.relatedVideos.length > 0) {
      setActiveVideo({ article: news, video: news.relatedVideos[0] })
      return
    }
    handleAnalyzeArticle(news.url)
  }

  const handleRemoveArticle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Remove this article from your feed?')) {
      const updated = newsItems.filter(item => item.id !== id)
      setNewsItems(updated)
      
      // Also remove from localStorage if it's a scraped article
      if (newsItems.find(item => item.id === id)?.isScraped) {
        removeSavedNews(id)
        // Reload to ensure consistency
        loadNewsFeed()
      }
    }
  }

  return (
    <div className="min-h-screen">
      <Header backendStatus={backendStatus} />

      <main className="container mx-auto px-6 py-8">
        <BackendStatus status={backendStatus} onRetry={checkBackend} />

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Newspaper className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">News Feed</h1>
            {newsItems.filter(item => item.isScraped).length > 0 && (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                {newsItems.filter(item => item.isScraped).length} Scraped
              </span>
            )}
          </div>
          <p className="text-gray-400 text-lg">
            Browse the latest news from trusted sources worldwide. Scraped articles appear first. Click any article to analyze it with AI.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search news articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-3 pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-black/40 text-gray-300 hover:bg-black/60 border border-white/10'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((news) => (
            <div
              key={news.id}
              className="glass-effect rounded-xl overflow-hidden border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
              onClick={() => handleNewsCardClick(news)}
            >
              {/* Image */}
              {news.imageUrl && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-purple-500/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                      {news.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-purple-400 font-medium">{news.source}</span>
                    {news.isScraped && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                        Scraped
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{news.publishedAt}</span>
                    {news.isScraped && (
                      <button
                        onClick={(e) => handleRemoveArticle(news.id, e)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        title="Remove from feed"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                  {news.title}
                </h3>

                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {news.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {news.readTime}
                  </span>
                  <div className="flex items-center space-x-3">
                    {news.isScraped && news.relatedVideos?.length ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNewsCardClick(news)
                        }}
                        className="text-sm text-pink-400 hover:text-pink-300 font-semibold flex items-center group/btn"
                      >
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Watch Video
                        <span className="ml-1 group-hover/btn:translate-x-1 transition-transform">▶</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAnalyzeArticle(news.url)
                        }}
                        className="text-sm text-purple-400 hover:text-purple-300 font-semibold flex items-center group/btn"
                      >
                        Analyze with AI
                        <span className="ml-1 group-hover/btn:translate-x-1 transition-transform">→</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredNews.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No articles found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-12 glass-effect rounded-xl p-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">{newsItems.length}</div>
              <div className="text-gray-400">Total Articles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">
                {newsItems.filter(item => item.isScraped).length}
              </div>
              <div className="text-gray-400">Scraped Articles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-400 mb-2">{categories.length - 1}</div>
              <div className="text-gray-400">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
              <div className="text-gray-400">Live Updates</div>
            </div>
          </div>
        </div>
      </main>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <p className="text-sm text-purple-300 uppercase tracking-wide">Related Video</p>
                <h3 className="text-xl font-bold text-white">{activeVideo.article.title}</h3>
                <p className="text-gray-400 text-sm">
                  Source: {activeVideo.video.source || 'YouTube'}
                </p>
              </div>
              <button
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                onClick={() => setActiveVideo(null)}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden border border-white/10">
                {getVideoEmbedUrl(activeVideo.video.url) ? (
                  <iframe
                    src={getVideoEmbedUrl(activeVideo.video.url)!}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={activeVideo.video.title || 'Related video'}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white space-y-4">
                    <p className="text-center px-6">
                      Unable to embed this video. Open it directly to view.
                    </p>
                    <a
                      href={activeVideo.video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-purple-500 rounded-full font-semibold hover:bg-purple-600 transition-colors"
                    >
                      Open Video
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3 justify-between">
                <div className="text-sm text-gray-400 flex flex-col">
                  {activeVideo.video.title && (
                    <span className="text-white font-semibold">{activeVideo.video.title}</span>
                  )}
                  {activeVideo.video.duration && <span>Duration: {activeVideo.video.duration}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAnalyzeArticle(activeVideo.article.url)}
                    className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full border border-purple-400/50 hover:bg-purple-500/30 transition-colors"
                  >
                    Analyze Article
                  </button>
                  <a
                    href={activeVideo.video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white/10 text-white rounded-full border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    Open on {activeVideo.video.source || 'YouTube'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getVideoEmbedUrl(url?: string) {
  if (!url) return null
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`
  }
  return null
}

