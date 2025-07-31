// Background service worker for SafeClick

console.log('[HackSky Background] Service worker initialized')

chrome.runtime.onInstalled.addListener(() => {
  console.log('[HackSky Background] Extension installed')
  
  // Set default settings
  chrome.storage.local.set({
    theme: 'light',
    autoScan: false,
    notifications: true,
    apiUrl: 'http://localhost:5000'
  })
})

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[HackSky Background] Received message:', request)
  
  if (request.type === 'SCAN_PAGE') {
    // Handle page scanning request
    console.log('[HackSky Background] Scanning page:', sender.tab?.url)
    
    // Simulate AI analysis (this will be replaced by API calls)
    setTimeout(() => {
      const analysis = {
        url: sender.tab?.url,
        aiScore: Math.floor(Math.random() * 100),
        fakeNewsScore: Math.floor(Math.random() * 100),
        risk: Math.random() > 0.5 ? 'high' : 'low'
      }
      
      console.log('[HackSky Background] Analysis result:', analysis)
      sendResponse({ success: true, analysis })
    }, 1000)
    
    return true // Keep message channel open for async response
  }
  
  if (request.type === 'GET_SETTINGS') {
    chrome.storage.local.get(['theme', 'autoScan', 'notifications', 'apiUrl'], (result) => {
      console.log('[HackSky Background] Settings requested:', result)
      sendResponse(result)
    })
    return true
  }
  
  if (request.type === 'UPDATE_SETTINGS') {
    console.log('[HackSky Background] Updating settings:', request.settings)
    chrome.storage.local.set(request.settings, () => {
      sendResponse({ success: true })
    })
    return true
  }
  
  if (request.type === 'TEST_API_CONNECTION') {
    console.log('[HackSky Background] Testing API connection...')
    testApiConnection().then(sendResponse)
    return true
  }
})

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('[HackSky Background] Extension icon clicked for tab:', tab.url)
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_POPUP' })
  }
})

// Test API connection
async function testApiConnection(): Promise<{ success: boolean, message: string }> {
  try {
    console.log('[HackSky Background] Testing API connection to localhost:5000')
    
    const response = await fetch('http://localhost:5000/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://example.com' })
    })
    
    if (response.ok) {
      console.log('[HackSky Background] API connection successful')
      return { success: true, message: 'API server is running' }
    } else {
      console.log('[HackSky Background] API connection failed with status:', response.status)
      return { success: false, message: `API server responded with status ${response.status}` }
    }
  } catch (error) {
    console.error('[HackSky Background] API connection error:', error)
    return { 
      success: false, 
      message: `API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Handle tab updates for auto-scanning
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('[HackSky Background] Tab updated:', tab.url)
    
    // Clear any stored analysis data for the previous URL when navigating to a new page
    if (changeInfo.url) {
      console.log('[HackSky Background] URL changed, clearing stored analysis data')
      // Get all stored analysis data and remove entries that don't match current URL
      chrome.storage.local.get(null, (items) => {
        const keysToRemove: string[] = []
        Object.keys(items).forEach(key => {
          if (key.startsWith('analysis_') && key !== `analysis_${tab.url}`) {
            keysToRemove.push(key)
          }
        })
        if (keysToRemove.length > 0) {
          chrome.storage.local.remove(keysToRemove)
          console.log('[HackSky Background] Cleared analysis data for:', keysToRemove)
        }
      })
    }
    
    // Check if auto-scan is enabled
    chrome.storage.local.get(['autoScan'], (result) => {
      if (result.autoScan) {
        console.log('[HackSky Background] Auto-scan enabled, triggering analysis')
        // Delay to allow page to fully load
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, { type: 'ANALYZE_PAGE' })
        }, 2000)
      }
    })
  }
})