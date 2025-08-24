// Content script for Factora

interface PageContent {
  title: string
  text: string
  url: string
  timestamp: Date
}

class ContentAnalyzer {
  private isAnalyzing = false

  constructor() {
    this.init()
  }

  private init() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      console.log('[Factora Content] Received message:', request)
      
      if (request.type === 'ANALYZE_PAGE') {
        this.analyzeCurrentPage().then(sendResponse)
        return true
      }
      
      if (request.type === 'GET_CURRENT_URL') {
        const currentUrl = window.location.href
        console.log('[Factora Content] Current URL:', currentUrl)
        sendResponse({ url: currentUrl })
        return true
      }
    })

    // Auto-scan if enabled
    this.checkAutoScan()
  }

  private async checkAutoScan() {
    chrome.storage.local.get(['autoScan'], (result) => {
      if (result.autoScan) {
        console.log('[Factora Content] Auto-scan enabled, analyzing page...')
        setTimeout(() => {
          this.analyzeCurrentPage()
        }, 2000) // Wait for page to load
      }
    })
  }

  private async analyzeCurrentPage(): Promise<any> {
    if (this.isAnalyzing) {
              console.log('[Factora Content] Analysis already in progress')
      return { error: 'Analysis already in progress' }
    }

    this.isAnalyzing = true
          console.log('[Factora Content] Starting page analysis...')

    try {
      const content = this.extractPageContent()
              console.log('[Factora Content] Extracted content:', {
        title: content.title,
        textLength: content.text.length,
        url: content.url
      })
      
      this.isAnalyzing = false
      return { success: true, content }
    } catch (error) {
      this.isAnalyzing = false
              console.error('[Factora Content] Analysis error:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  private extractPageContent(): PageContent {
    const title = document.title || ''
    const text = this.extractTextContent()
    const url = window.location.href

    return {
      title,
      text,
      url,
      timestamp: new Date()
    }
  }

  private extractTextContent(): string {
          console.log('[Factora Content] Extracting text content...')
    
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style')
    scripts.forEach(script => script.remove())

    // Get main content areas
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '.story-content'
    ]

    let content = ''
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector)
      if (element) {
        content += element.textContent || ''
        console.log(`[Factora Content] Found content with selector: ${selector}`)
        break
      }
    }

    // Fallback to body content
    if (!content) {
      content = document.body.textContent || ''
      console.log('[Factora Content] Using fallback body content')
    }

    // Clean up the text
    const cleanedContent = content
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000) // Limit content length
    
          console.log(`[Factora Content] Extracted ${cleanedContent.length} characters`)
    return cleanedContent
  }

  // Public method to trigger analysis from popup
  public async scanPage() {
    return this.analyzeCurrentPage()
  }
}

// Initialize the analyzer
const analyzer = new ContentAnalyzer()
console.log('[Factora Content] Content script initialized')

// Expose to window for debugging
window.factoraAnalyzer = analyzer 