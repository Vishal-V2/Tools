import React, { useState } from 'react'
import { Bug, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiService } from '@/lib/api'

interface DebugPanelProps {
  className?: string
}

const DebugPanel: React.FC<DebugPanelProps> = ({ className }) => {
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown')

  const addTestLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults(prev => [...prev.slice(-19), `[${timestamp}] ${message}`])
  }

  const runTests = async () => {
    setIsTesting(true)
    setTestResults([])
    addTestLog('Starting debug tests...')

    try {
      // Test 1: API Connection
      addTestLog('Test 1: Testing API connection...')
      const connected = await apiService.testConnection()
      setApiStatus(connected ? 'connected' : 'disconnected')
      addTestLog(`API connection: ${connected ? 'SUCCESS' : 'FAILED'}`)

      // Test 2: Scrape API
      if (connected) {
        addTestLog('Test 2: Testing scrape API...')
        try {
          const scrapeResult = await apiService.scrapePage('https://example.com')
          addTestLog(`Scrape API: SUCCESS (${scrapeResult.text.length} chars)`)

          // Test 3: Detect API
          addTestLog('Test 3: Testing detect API...')
          const detectResult = await apiService.detectAI(scrapeResult.text.substring(0, 500))
          addTestLog(`Detect API: SUCCESS (${detectResult.aiLikelihoodPercent}% AI likelihood)`)
        } catch (error) {
          addTestLog(`API test failed: ${error}`)
        }
      }

      // Test 4: Chrome Extension APIs
      addTestLog('Test 4: Testing Chrome extension APIs...')
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
        addTestLog(`Chrome tabs API: SUCCESS (${tabs.length} active tabs)`)
        
        if (tabs[0]?.url) {
          addTestLog(`Current tab URL: ${tabs[0].url}`)
        }
      } catch (error) {
        addTestLog(`Chrome API test failed: ${error}`)
      }

      addTestLog('All tests completed')
    } catch (error) {
      addTestLog(`Test error: ${error}`)
    } finally {
      setIsTesting(false)
    }
  }

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-success-600" />
      case 'disconnected':
        return <AlertCircle className="w-4 h-4 text-danger-600" />
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse" />
    }
  }

  const getStatusText = () => {
    switch (apiStatus) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Disconnected'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className={cn("card p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Bug className="w-5 h-5" />
          <span>Debug Panel</span>
        </h3>
        <button
          onClick={runTests}
          disabled={isTesting}
          className="btn-secondary flex items-center space-x-2 text-sm"
        >
          {isTesting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isTesting ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      <div className="space-y-3">
        {/* API Status */}
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <span className="text-sm">API Server Status:</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={cn(
              "text-sm font-medium",
              apiStatus === 'connected' ? "text-success-600" :
              apiStatus === 'disconnected' ? "text-danger-600" : "text-gray-600"
            )}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Test Results:</span>
            <span className="text-xs text-gray-500">
              {testResults.length} logs
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs">
            {testResults.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                No test results yet. Click "Run Tests" to start debugging.
              </div>
            ) : (
              testResults.map((log, index) => (
                <div key={index} className="text-gray-600 dark:text-gray-400 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>Debug Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Ensure your API server is running on localhost:5000</li>
            <li>Check browser console for detailed logs</li>
            <li>Verify CORS settings on your API server</li>
            <li>Test with the demo.html page for best results</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DebugPanel 