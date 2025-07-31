import React, { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle, Info, Moon, Sun, Settings, Zap, Eye, BarChart3, Wifi, WifiOff, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiService, AnalysisResult, FactCheckClaim } from '@/lib/api'
import DebugPanel from '@/components/DebugPanel'
import AnalysisProgress, { AnalysisStep } from '@/components/AnalysisProgress'

interface ScanResult {
  id: string
  type: 'ai-generated' | 'fake-news' | 'suspicious' | 'safe'
  confidence: number
  description: string
  timestamp: Date
}

interface PageAnalysis {
  url: string
  title: string
  aiScore: number
  fakeNewsScore: number
  overallRisk: 'low' | 'medium' | 'high'
  results: ScanResult[]
  factCheckClaims?: FactCheckClaim[]
  apiData?: AnalysisResult
}

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false)
  const [currentTab, setCurrentTab] = useState<'overview' | 'analysis' | 'settings'>('overview')
  const [isScanning, setIsScanning] = useState(false)
  const [analysis, setAnalysis] = useState<PageAnalysis | null>(null)
  const [apiConnected, setApiConnected] = useState<boolean | null>(null)
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([])

  useEffect(() => {
    // Load theme preference from storage
    chrome.storage.local.get(['theme'], (result) => {
      setIsDark(result.theme === 'dark')
    })

    // Apply theme to document
    document.documentElement.classList.toggle('dark', isDark)
    
    // Test API connection on load
    testApiConnection()

    // Load persisted analysis data for current tab
    loadPersistedAnalysis()
  }, [isDark])

  const addDebugLog = (message: string) => {
    console.log(`[HackSky Debug] ${message}`)
  }

  const testApiConnection = async () => {
    addDebugLog('Testing API connection...')
    try {
      const connected = await apiService.testConnection()
      setApiConnected(connected)
      addDebugLog(`API connection: ${connected ? 'SUCCESS' : 'FAILED'}`)
    } catch (error) {
      setApiConnected(false)
      addDebugLog(`API connection error: ${error}`)
    }
  }

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
    chrome.storage.local.set({ theme: newTheme ? 'dark' : 'light' })
  }

  const updateStep = (stepId: string, status: AnalysisStep['status'], error?: string) => {
    setAnalysisSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, status, error } 
          : step
      )
    )
  }

  const initializeAnalysisSteps = () => {
    const steps: AnalysisStep[] = [
      {
        id: 'get-url',
        title: 'Getting Current Page URL',
        description: 'Retrieving the URL of the active tab',
        status: 'pending'
      },
      {
        id: 'scrape-content',
        title: 'Scraping Page Content',
        description: 'Extracting text and images from the webpage',
        status: 'pending'
      },
      {
        id: 'detect-ai',
        title: 'Analyzing AI Content',
        description: 'Detecting AI-generated text patterns',
        status: 'pending'
      },
      {
        id: 'fact-check',
        title: 'Fact-Checking Claims',
        description: 'Verifying factual accuracy of content',
        status: 'pending'
      },
      {
        id: 'sentiment-analysis',
        title: 'Sentiment Analysis',
        description: 'Analyzing content sentiment and information',
        status: 'pending'
      },
      {
        id: 'image-analysis',
        title: 'Image Analysis',
        description: 'Detecting AI-generated images',
        status: 'pending'
      },
      {
        id: 'generate-report',
        title: 'Generating Analysis Report',
        description: 'Creating comprehensive risk assessment',
        status: 'pending'
      }
    ]
    setAnalysisSteps(steps)
  }

  const loadPersistedAnalysis = async () => {
    try {
      // Get current tab URL
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.url) return

      // Get stored analysis data
      chrome.storage.local.get([`analysis_${tab.url}`], (result) => {
        const storedAnalysis = result[`analysis_${tab.url}`]
        if (storedAnalysis) {
          addDebugLog(`Loaded persisted analysis for: ${tab.url}`)
          setAnalysis(storedAnalysis)
        }
      })
    } catch (error) {
      addDebugLog(`Error loading persisted analysis: ${error}`)
    }
  }

  const saveAnalysisToStorage = async (analysisData: PageAnalysis) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.url) return

      // Store analysis data with URL as key
      chrome.storage.local.set({
        [`analysis_${tab.url}`]: analysisData
      }, () => {
        addDebugLog(`Saved analysis data for: ${tab.url}`)
      })
    } catch (error) {
      addDebugLog(`Error saving analysis to storage: ${error}`)
    }
  }

  const scanCurrentPage = async () => {
    setIsScanning(true)
    initializeAnalysisSteps()
    addDebugLog('Starting page scan...')
    
    // Initialize variables to track results and failures
    let tab: chrome.tabs.Tab | undefined
    let scrapeResult: any = null
    let detectResult: any = null
    let factCheckResult: any = null
    let sentimentResult: any = null
    let imageAnalysisResults: any[] = []
    const results: ScanResult[] = []
    
    try {
      // Step 1: Get current page URL
      updateStep('get-url', 'loading')
      addDebugLog('Getting current page URL...')
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      tab = tabs[0]
      if (!tab?.url) {
        throw new Error('No active tab URL found')
      }
      
      updateStep('get-url', 'completed')
      addDebugLog(`Current URL: ${tab.url}`)
    } catch (error) {
      updateStep('get-url', 'error', error instanceof Error ? error.message : 'Unknown error')
      addDebugLog(`Failed to get URL: ${error}`)
      setIsScanning(false)
      return
    }
    
    // Step 2: Scrape page content
    updateStep('scrape-content', 'loading')
    addDebugLog('Calling scrape API...')
    try {
      scrapeResult = await apiService.scrapePage(tab.url)
      updateStep('scrape-content', 'completed')
      addDebugLog(`Scraped ${scrapeResult.text.length} characters`)
    } catch (error) {
      updateStep('scrape-content', 'error', error instanceof Error ? error.message : 'Scraping failed')
      addDebugLog(`Scrape API failed: ${error}`)
    }
    
    // Step 3: Detect AI content (only if scraping succeeded)
    if (scrapeResult) {
      updateStep('detect-ai', 'loading')
      addDebugLog('Calling detect API...')
      try {
        detectResult = await apiService.detectAI(scrapeResult.text)
        updateStep('detect-ai', 'completed')
        addDebugLog(`AI likelihood: ${detectResult.aiLikelihoodPercent}%`)
        
        // Add AI detection result
        results.push({
          id: '1',
          type: 'ai-generated',
          confidence: detectResult.aiLikelihoodPercent,
          description: `Text analysis suggests ${detectResult.aiLikelihoodPercent}% likelihood of AI generation. Preview: "${detectResult.textPreview.substring(0, 100)}..."`,
          timestamp: new Date()
        })
      } catch (error) {
        updateStep('detect-ai', 'error', error instanceof Error ? error.message : 'AI detection failed')
        addDebugLog(`Detect API failed: ${error}`)
        
        // Add failed AI detection result
        results.push({
          id: '1',
          type: 'ai-generated',
          confidence: 0,
          description: 'AI detection failed - API unavailable or returned an error',
          timestamp: new Date()
        })
      }
    } else {
      updateStep('detect-ai', 'error', 'Cannot analyze AI content - scraping failed')
      results.push({
        id: '1',
        type: 'ai-generated',
        confidence: 0,
        description: 'AI detection failed - no content to analyze (scraping failed)',
        timestamp: new Date()
      })
    }
    
    // Step 4: Fact-check content (only if scraping succeeded)
    if (scrapeResult) {
      updateStep('fact-check', 'loading')
      addDebugLog('Calling fact-check API...')
      try {
        factCheckResult = await apiService.factCheck(scrapeResult.text)
        updateStep('fact-check', 'completed')
        addDebugLog(`Found ${factCheckResult.claims.length} claims to fact-check`)
        
        // Calculate fake news score based on fact-check results
        const fakeNewsPercentage = apiService.calculateFakeNewsPercentage(factCheckResult.claims)
        
        // Add fact-check result
        results.push({
          id: '2',
          type: 'fake-news',
          confidence: fakeNewsPercentage,
          description: `${factCheckResult.claims.filter((claim: any) => !claim.isLikelyTrue).length} out of ${factCheckResult.claims.length} claims appear to be false or misleading`,
          timestamp: new Date()
        })
      } catch (error) {
        updateStep('fact-check', 'error', error instanceof Error ? error.message : 'Fact-checking failed')
        addDebugLog(`Fact-check API failed: ${error}`)
        
        // Add failed fact-check result
        results.push({
          id: '2',
          type: 'fake-news',
          confidence: 0,
          description: 'Fact-checking failed - API unavailable or returned an error',
          timestamp: new Date()
        })
      }
    } else {
      updateStep('fact-check', 'error', 'Cannot fact-check content - scraping failed')
      results.push({
        id: '2',
        type: 'fake-news',
        confidence: 0,
        description: 'Fact-checking failed - no content to analyze (scraping failed)',
        timestamp: new Date()
      })
    }
    
    // Step 5: Sentiment Analysis (only if scraping succeeded)
    if (scrapeResult) {
      updateStep('sentiment-analysis', 'loading')
      addDebugLog('Calling sentiment API...')
      try {
        sentimentResult = await apiService.analyzeSentiment(scrapeResult.text)
        updateStep('sentiment-analysis', 'completed')
        addDebugLog(`Sentiment analysis completed: ${sentimentResult.summary.substring(0, 100)}...`)
      } catch (error) {
        updateStep('sentiment-analysis', 'error', error instanceof Error ? error.message : 'Sentiment analysis failed')
        addDebugLog(`Sentiment API failed: ${error}`)
      }
    } else {
      updateStep('sentiment-analysis', 'error', 'Cannot analyze sentiment - scraping failed')
    }
    
    // Step 6: Image Analysis (only if scraping succeeded and images exist)
    if (scrapeResult && scrapeResult.images && scrapeResult.images.length > 0) {
      updateStep('image-analysis', 'loading')
      addDebugLog(`Analyzing ${scrapeResult.images.length} images for AI detection...`)
      try {
        imageAnalysisResults = await apiService.analyzeImages(scrapeResult.images)
        updateStep('image-analysis', 'completed')
        addDebugLog(`Image analysis completed for ${imageAnalysisResults.length} images`)
      } catch (error) {
        updateStep('image-analysis', 'error', error instanceof Error ? error.message : 'Image analysis failed')
        addDebugLog(`Image analysis failed: ${error}`)
      }
    } else if (scrapeResult && (!scrapeResult.images || scrapeResult.images.length === 0)) {
      updateStep('image-analysis', 'completed')
      addDebugLog('No images found on page to analyze')
    } else {
      updateStep('image-analysis', 'error', 'Cannot analyze images - scraping failed')
    }
    
    // Step 7: Generate report
    updateStep('generate-report', 'loading')
    addDebugLog('Generating analysis report...')
    
    // Calculate scores (use 0 for failed operations)
    const aiScore = detectResult ? detectResult.aiLikelihoodPercent : 0
    const fakeNewsScore = factCheckResult ? apiService.calculateFakeNewsPercentage(factCheckResult.claims) : 0
    
    // Determine overall risk based on available data
    let overallRisk: 'low' | 'medium' | 'high' = 'low'
    if (aiScore > 70 || fakeNewsScore > 50) {
      overallRisk = 'high'
    } else if (aiScore > 40 || fakeNewsScore > 30) {
      overallRisk = 'medium'
    }
    
    // Create final analysis result
    const analysisResult: PageAnalysis = {
      url: scrapeResult ? scrapeResult.url : tab.url,
      title: tab.title || 'Unknown',
      aiScore,
      fakeNewsScore,
      overallRisk,
      results,
      factCheckClaims: factCheckResult ? factCheckResult.claims : [],
      apiData: {
        scrapedData: scrapeResult || {
          title: 'Analysis Failed',
          content: 'Unable to scrape page content',
          images: [],
          links: []
        },
        detectionResult: detectResult || {
          isAiGenerated: false,
          confidence: 0,
          explanation: 'AI detection failed'
        },
        factCheckResult: factCheckResult,
        sentimentResult: sentimentResult,
        imageDetectionResults: imageAnalysisResults,
        timestamp: new Date()
      }
    }
    
    setAnalysis(analysisResult)
    saveAnalysisToStorage(analysisResult)
    updateStep('generate-report', 'completed')
    addDebugLog('Analysis complete and displayed')
    
    setIsScanning(false)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-success-600 dark:text-success-400'
      case 'medium': return 'text-warning-600 dark:text-warning-400'
      case 'high': return 'text-danger-600 dark:text-danger-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="w-5 h-5 text-success-600" />
      case 'medium': return <AlertTriangle className="w-5 h-5 text-warning-600" />
      case 'high': return <AlertTriangle className="w-5 h-5 text-danger-600" />
      default: return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="w-96 h-[600px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-primary-600" />
          <h1 className="text-lg font-bold">HackSky AI Detector</h1>
        </div>
        <div className="flex items-center space-x-2">
          {/* API Status Indicator */}
          <div className="flex items-center space-x-1">
            {apiConnected === null ? (
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
            ) : apiConnected ? (
              <Wifi className="w-4 h-4 text-success-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-danger-600" />
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setCurrentTab('overview')}
          className={cn(
            "flex-1 py-3 px-4 text-sm font-medium transition-colors",
            currentTab === 'overview'
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setCurrentTab('analysis')}
          className={cn(
            "flex-1 py-3 px-4 text-sm font-medium transition-colors",
            currentTab === 'analysis'
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Analysis
        </button>
        <button
          onClick={() => setCurrentTab('settings')}
          className={cn(
            "flex-1 py-3 px-4 text-sm font-medium transition-colors",
            currentTab === 'settings'
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto h-[480px]">
        {currentTab === 'overview' && (
          <div className="space-y-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Current Page</h2>
                <button
                  onClick={scanCurrentPage}
                  disabled={isScanning}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  {isScanning ? 'Scanning...' : 'Scan Page'}
                </button>
              </div>
              
              {/* Progress Checklist */}
              {isScanning && analysisSteps.length > 0 && (
                <div className="mb-4">
                  <AnalysisProgress steps={analysisSteps} />
                </div>
              )}
              
              {analysis ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level:</span>
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(analysis.overallRisk)}
                      <span className={cn("font-medium", getRiskColor(analysis.overallRisk))}>
                        {analysis.overallRisk.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">{analysis.aiScore}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">AI Generated</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-warning-600">{analysis.fakeNewsScore}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Fake Claims</div>
                    </div>
                  </div>
                  
                  {analysis.apiData && (
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        API Analysis: {analysis.apiData.scrapedData.text.length} chars analyzed
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Click "Scan Page" to analyze the current webpage</p>
                  {apiConnected === false && (
                    <p className="text-xs text-red-500 mt-2">API server not connected</p>
                  )}
                </div>
              )}
            </div>

            {/* <div className="card p-4">
              <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">24</div>
                  <div className="text-gray-600 dark:text-gray-400">Pages Scanned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-danger-600">3</div>
                  <div className="text-gray-600 dark:text-gray-400">Threats Detected</div>
                </div>
              </div>
            </div> */}
          </div>
        )}

        {currentTab === 'analysis' && analysis && (
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-3">Detailed Analysis</h3>
              <div className="space-y-3">
                {analysis.results.map((result) => (
                  <div key={result.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{result.type.replace('-', ' ')}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {result.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Factual Analysis Section */}
            {analysis.factCheckClaims && analysis.factCheckClaims.length > 0 && (
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-3">Factual Analysis</h3>
                <div className="space-y-3">
                  {analysis.factCheckClaims.map((claim, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "p-3 rounded-lg border-l-4",
                        claim.isLikelyTrue 
                          ? "bg-green-50 dark:bg-green-900/20 border-green-500" 
                          : "bg-red-50 dark:bg-red-900/20 border-red-500"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {claim.isLikelyTrue ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          )}
                          <span className={cn(
                            "font-medium text-sm",
                            claim.isLikelyTrue ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                          )}>
                            {claim.isLikelyTrue ? "Likely True" : "Likely False"}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        "{claim.claim}"
                      </p>
                      
                      {claim.supportingSources && claim.supportingSources.length > 0 && (
                        <div className="space-y-1">
                          <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Supporting Sources:
                          </h5>
                          {claim.supportingSources.map((source, sourceIndex) => (
                            <div key={sourceIndex} className="flex items-center space-x-2">
                              <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <a 
                                href={source.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate"
                                title={source.title}
                              >
                                {source.title}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Information and Sentiment Analysis Section */}
            {analysis.apiData?.sentimentResult && (
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-3">Information and Sentiment Analysis</h3>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-sm text-blue-800 dark:text-blue-200">
                      Content Analysis
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {analysis.apiData.sentimentResult.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Image AI Detection Results Section */}
            {analysis.apiData?.imageDetectionResults && analysis.apiData.imageDetectionResults.length > 0 && (
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-3">Image AI Detection Results</h3>
                <div className="space-y-3">
                  {analysis.apiData.imageDetectionResults.map((result, index) => (
                    <div key={index} className={cn(
                      "p-3 rounded-lg border-l-4",
                      result.aiLikelihoodPercent > 70 
                        ? "bg-red-50 dark:bg-red-900/20 border-red-500" 
                        : result.aiLikelihoodPercent > 40
                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                        : "bg-green-50 dark:bg-green-900/20 border-green-500"
                    )}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {result.aiLikelihoodPercent > 70 ? (
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          ) : result.aiLikelihoodPercent > 40 ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          )}
                          <span className={cn(
                            "font-medium text-sm",
                            result.aiLikelihoodPercent > 70 
                              ? "text-red-800 dark:text-red-200" 
                              : result.aiLikelihoodPercent > 40
                              ? "text-yellow-800 dark:text-yellow-200"
                              : "text-green-800 dark:text-green-200"
                          )}>
                            AI Likelihood: {result.aiLikelihoodPercent}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <img 
                          src={result.url} 
                          alt="Analyzed image" 
                          className="max-w-full h-32 object-cover rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 break-all">
                        {result.url}
                      </p>
                      
                      {result.rawModelReply && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Analysis:</strong> {result.rawModelReply}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-3">Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Dark Theme</span>
                  <button
                    onClick={toggleTheme}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      isDark ? "bg-primary-600" : "bg-gray-200"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        isDark ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Debug Panel */}
            <DebugPanel />

            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-3">About</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                HackSky AI Detector helps you identify AI-generated content and potential fake news threats.
                Stay safe online with our advanced detection algorithms.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App 