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

export interface SupportingSource {
  title: string
  link: string
}

export interface FactCheckClaim {
  claim: string
  isLikelyTrue: boolean
  supportingSources: SupportingSource[]
}

export interface FactCheckResult {
  claims: FactCheckClaim[]
}

export interface SentimentResult {
  summary: string
}

export interface ImageDetectionResult {
  url: string
  aiLikelihoodPercent: number
  rawModelReply: string
}

export interface AnalysisResult {
  scrapedData: ScrapedData
  detectionResult: DetectionResult
  factCheckResult?: FactCheckResult
  sentimentResult?: SentimentResult
  imageDetectionResults?: ImageDetectionResult[]
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

  // Fact-check page content
  async factCheck(text: string): Promise<FactCheckResult> {
    this.log('Fact-checking content, text length:', text.length)
    
    try {
      const response = await fetch(`${this.baseUrl}/api/factcheck`, {
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
      this.log('Fact-check response:', data)
      
      return data
    } catch (error) {
      this.log('Fact-check error:', error)
      throw new Error(`Failed to fact-check content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Analyze sentiment of content
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    this.log('Analyzing sentiment, text length:', text.length)
    
    try {
      const response = await fetch(`${this.baseUrl}/api/sentiment`, {
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
      this.log('Sentiment response:', data)
      
      return data
    } catch (error) {
      this.log('Sentiment error:', error)
      throw new Error(`Failed to analyze sentiment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Detect AI in image from URL
  async detectAIInImage(imageUrl: string): Promise<ImageDetectionResult> {
    this.log('Detecting AI in image:', imageUrl)
    
    try {
      const response = await fetch(`${this.baseUrl}/api/image-detect-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.log('Image detection response:', data)
      
      return {
        url: imageUrl,
        aiLikelihoodPercent: data.aiLikelihoodPercent,
        rawModelReply: data.rawModelReply
      }
    } catch (error) {
      this.log('Image detection error:', error)
      throw new Error(`Failed to detect AI in image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Analyze multiple images for AI detection
  async analyzeImages(imageUrls: string[]): Promise<ImageDetectionResult[]> {
    this.log('Analyzing images for AI detection, count:', imageUrls.length)
    
    if (!imageUrls || imageUrls.length === 0) {
      return []
    }

    const results: ImageDetectionResult[] = []
    
    // Process images sequentially to avoid overwhelming the API
    for (const imageUrl of imageUrls) {
      try {
        const result = await this.detectAIInImage(imageUrl)
        results.push(result)
      } catch (error) {
        this.log(`Failed to analyze image ${imageUrl}:`, error)
        // Add failed result to maintain consistency
        results.push({
          url: imageUrl,
          aiLikelihoodPercent: 0,
          rawModelReply: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }
    
    return results
  }

  // Complete analysis workflow with optional fact-checking
  async analyzePage(url: string, includeFactCheck: boolean = true): Promise<AnalysisResult> {
    this.log('Starting page analysis for:', url)
    
    try {
      // Step 1: Scrape the page
      this.log('Step 1: Scraping page content...')
      const scrapedData = await this.scrapePage(url)
      
      // Step 2: Detect AI content
      this.log('Step 2: Detecting AI-generated content...')
      const detectionResult = await this.detectAI(scrapedData.text)
      
      // Step 3: Fact-check content (optional)
      let factCheckResult
      if (includeFactCheck) {
        this.log('Step 3: Fact-checking content...')
        factCheckResult = await this.factCheck(scrapedData.text)
      }
      
      const result: AnalysisResult = {
        scrapedData,
        detectionResult,
        factCheckResult,
        timestamp: new Date()
      }
      
      this.log('Analysis complete:', result)
      return result
      
    } catch (error) {
      this.log('Analysis failed:', error)
      throw error
    }
  }

  // Calculate fake news percentage from fact-check claims
  calculateFakeNewsPercentage(claims: FactCheckClaim[]): number {
    if (!claims || claims.length === 0) return 0
    const falseClaims = claims.filter(claim => !claim.isLikelyTrue).length
    return Math.round((falseClaims / claims.length) * 100)
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