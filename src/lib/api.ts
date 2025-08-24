// API service for Factora

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

export interface SummarizationResult {
  summary: string
  model: string
  input_length: number
  summary_length: number
}

export interface QAResult {
  question: string
  answer: string
  model: string
  content_length: number
  answer_length: number
}

export interface AISource {
  source: string
  confidence: number
}

export interface ImageDetectionResult {
  url: string
  aiLikelihoodPercent: number
  rawModelReply: string
  topSources?: AISource[]
}

export interface AnalysisResult {
  scrapedData: ScrapedData
  detectionResult: DetectionResult
  factCheckResult?: FactCheckResult
  sentimentResult?: SentimentResult
  summarizationResult?: SummarizationResult
  imageDetectionResults?: ImageDetectionResult[]
  timestamp: Date
}

class ApiService {
  private baseUrl = 'http://localhost:5000'

  // Debug logging
  private log(message: string, data?: any) {
    console.log(`[Factora API] ${message}`, data || '')
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

  // Summarize content
  async summarizeContent(text: string): Promise<SummarizationResult> {
    this.log('Summarizing content, text length:', text.length)
    
    try {
      const response = await fetch(`${this.baseUrl}/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.log('Summarization response:', data)
      
      if (!data.success) {
        throw new Error(data.error || 'Summarization failed')
      }
      
      return data
    } catch (error) {
      this.log('Summarization error:', error)
      throw new Error(`Failed to summarize content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Answer questions
  async answerQuestion(question: string, content: string): Promise<QAResult> {
    this.log(`Answering question, question length: ${question.length}, content length: ${content.length}`)
    
    try {
      const response = await fetch(`${this.baseUrl}/api/qa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, content })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.log('Q&A response:', data)
      
      if (!data.success) {
        throw new Error(data.error || 'Question answering failed')
      }
      
      return data
    } catch (error) {
      this.log('Q&A error:', error)
      throw new Error(`Failed to answer question: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        rawModelReply: data.rawModelReply,
        topSources: data.topSources
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
        
        // Check if this is a skipped image due to unsupported format
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        if (errorMessage.includes('skipAnalysis') || errorMessage.includes('Unsupported image format') || errorMessage.includes('HTTP error! status: 400')) {
          this.log(`Unsupported image format detected: ${imageUrl}`)
          // Add result with user-friendly message for unsupported formats
          results.push({
            url: imageUrl,
            aiLikelihoodPercent: 0,
            rawModelReply: 'This format is not supported'
          })
          continue
        }
        
        // Add failed result for other types of errors
        results.push({
          url: imageUrl,
          aiLikelihoodPercent: 0,
          rawModelReply: `Analysis failed: ${errorMessage}`
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