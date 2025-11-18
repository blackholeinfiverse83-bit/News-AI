const API_BASE = 'http://localhost:8000'

export interface WorkflowResult {
  success: boolean
  data?: {
    url: string
    timestamp: string
    workflow_steps: string[]
    processing_time: {
      scraping: number
      vetting: number
      summarization: number
      prompt_generation: number
      video_search: number
    }
    scraped_data: {
      title: string
      content_length: number
      author: string
      date: string
    }
    vetting_results: {
      authenticity_score: number
      credibility_rating: string
      is_reliable: boolean
    }
    summary: {
      text: string
      original_length: number
      summary_length: number
      compression_ratio: number
    }
    video_prompt: {
      prompt: string
      for_video_creation: boolean
      based_on_summary: boolean
    }
    sidebar_videos: {
      videos: Array<{
        title: string
        url: string
        thumbnail?: string
        duration?: string
        source: string
      }>
      total_found: number
      ready_for_playback: boolean
    }
    total_processing_time: number
    workflow_complete: boolean
    steps_completed: number
  }
  message?: string
  timestamp?: string
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.status === 'healthy'
  } catch (error) {
    console.error('Backend health check failed:', error)
    return false
  }
}

export async function runUnifiedWorkflow(url: string): Promise<WorkflowResult> {
  try {
    const response = await fetch(`${API_BASE}/api/unified-news-workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Unified workflow failed:', error)
    throw new Error(error instanceof Error ? error.message : 'Unknown error occurred')
  }
}

export async function testIndividualTool(tool: string, payload: any): Promise<any> {
  try {
    const endpoints: { [key: string]: string } = {
      scraping: '/api/scrape',
      vetting: '/api/vet',
      summarization: '/api/summarize',
      prompt: '/api/prompt',
      video: '/api/video-search',
      'validate-video': '/api/validate-video'
    }
    
    const endpoint = endpoints[tool]
    if (!endpoint) {
      throw new Error(`Unknown tool: ${tool}`)
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`${tool} tool test failed:`, error)
    throw error
  }
}

export async function getBackendStatus(): Promise<{
  status: string
  services: { [key: string]: any }
  endpoints: number
  version: string
}> {
  try {
    const response = await fetch(`${API_BASE}/health`)
    if (!response.ok) {
      throw new Error('Backend not responding')
    }
    return await response.json()
  } catch (error) {
    throw new Error('Failed to get backend status')
  }
}
