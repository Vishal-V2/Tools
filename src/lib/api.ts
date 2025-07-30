// API service for HackSky AI Detector

export interface ScrapedData {
  url: string
  text: string
  images: string[]
}

export interface DetectionResult {
  textPreview: string
  aiLikelihoodPercent: number
}

export interface AnalysisResult {
  scrapedData: ScrapedData
  detectionResult: DetectionResult
  timestamp: Date
}

class ApiService {
  private baseUrl = 'http://localhost:5000'

  // Debug logging
  private log(message: string, data?: any) {
    console.log(`[HackSky API] ${message}`, data || '')
  }

  // Scrape page content
  async scrapePage(url: string): Promise<ScrapedData> {
    this.log('Scraping page:', url)
    
    try {
      const response = await fetch(`${this.baseUrl}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.log('Scrape response:', data)
      
      return data
    } catch (error) {
      this.log('Scrape error:', error)
      throw new Error(`Failed to scrape page: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Detect AI-generated content
  async detectAI(text: string): Promise<DetectionResult> {
    this.log('Detecting AI content, text length:', text.length)
    
    try {
      const response = await fetch(`${this.baseUrl}/api/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.log('Detection response:', data)
      
      return data
    } catch (error) {
      this.log('Detection error:', error)
      throw new Error(`Failed to detect AI content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Complete analysis workflow
  async analyzePage(url: string): Promise<AnalysisResult> {
    this.log('Starting page analysis for:', url)
    
    try {
      // Step 1: Scrape the page
      this.log('Step 1: Scraping page content...')
      const scrapedData = await this.scrapePage(url)
      
      // Step 2: Detect AI content
      this.log('Step 2: Detecting AI-generated content...')
      const detectionResult = await this.detectAI(scrapedData.text)
      
      const result: AnalysisResult = {
        scrapedData,
        detectionResult,
        timestamp: new Date()
      }
      
      this.log('Analysis complete:', result)
      return result
      
    } catch (error) {
      this.log('Analysis failed:', error)
      throw error
    }
  }

  // Test API connectivity
  async testConnection(): Promise<boolean> {
    this.log('Testing API connection...')
    
    try {
      const response = await fetch(`${this.baseUrl}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://example.com' })
      })
      
      this.log('Connection test response status:', response.status)
      return response.ok
    } catch (error) {
      this.log('Connection test failed:', error)
      return false
    }
  }
}

export const apiService = new ApiService() 