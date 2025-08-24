# Fact-Checking Implementation

This document describes the fact-checking functionality that has been implemented in the Factora Content Detector Chrome extension.

## Overview

The extension now includes a complete fact-checking workflow that:

1. **Posts page content** to `localhost:5000/api/factcheck`
2. **Receives fact-check results** with claims analysis
3. **Displays fact-check results** in the Analytics tab
4. **Shows fake claims percentage** in the Overview tab

## API Integration

### Request Format
```javascript
POST /api/factcheck
Content-Type: application/json

{
  "text": "page content to analyze"
}
```

### Response Format
```javascript
{
  "claims": [
    {
      "claim": "specific claim text",
      "isLikelyTrue": true/false,
      "supportingSources": [
        {
          "title": "Source title",
          "link": "https://source-url.com"
        }
      ]
    }
  ]
}
```

## Frontend Changes

### 1. API Service (`src/lib/api.ts`)
- Added `FactCheckClaim`, `SupportingSource`, and `FactCheckResult` interfaces
- Added `factCheck()` method to call the fact-check API
- Updated `analyzePage()` to include fact-checking step
- Added `calculateFakeNewsPercentage()` utility method

### 2. Extension Popup (`src/popup/App.tsx`)

#### Analysis Steps
Added fact-checking step to the analysis workflow:
- Get URL
- Scrape content
- Detect AI
- **Fact-check claims** (new)
- Generate report

#### Overview Tab
- Shows **"Fake Claims"** percentage instead of generic "Fake News"
- Percentage is calculated from actual fact-check results
- Risk level considers both AI likelihood and fake claims percentage

#### Analytics Tab
- Added **"Factual Analysis"** section
- Claims are highlighted:
  - 🟢 **Green** for likely true claims
  - 🔴 **Red** for likely false claims
- Each claim shows:
  - Truth assessment with icon
  - Original claim text
  - Supporting sources with clickable links

## Server-Side Implementation

The server already includes the fact-checking functionality:

### Files
- `routes/factCheckRoute.js` - Express route handler
- `controllers/factCheckController.js` - Core fact-checking logic

### Process
1. **Extract claims** from input text using advanced algorithms
2. **Search web** for each claim using Google Custom Search API
3. **Validate claims** against search results using content analysis
4. **Return structured results** with supporting sources

## Testing

### Prerequisites
1. Start the server: `cd factora-server && node server.js`
2. Ensure environment variables are set:
   - `API_KEY`
   - `GOOGLE_SEARCH_API_KEY`
   - `GOOGLE_SEARCH_ENGINE_ID`

### Test Steps
1. Build the extension: `npm run build`
2. Load the extension in Chrome (Developer mode)
3. Open the demo page: `demo.html`
4. Click the extension icon
5. Click "Scan Page" to analyze content
6. Check both **Overview** and **Analysis** tabs

### Expected Results

#### Overview Tab
- Shows content generation percentage
- Shows fake claims percentage (calculated from fact-check)
- Risk level considers both metrics

#### Analysis Tab
- Shows detailed content analysis
- Shows **Factual Analysis** section with:
  - Individual claims with truth assessment
  - Color-coded backgrounds (green/red)
  - Supporting source links
  - Navigation icons for external links

## Mock Data Fallback

If the API is unavailable, the extension shows mock fact-check data:
- Sample false claim about policy costs
- Sample true claim about climate change
- Complete with supporting sources

## Key Features

✅ **Real-time fact-checking** of web page content
✅ **Visual indicators** for claim truthfulness
✅ **Supporting sources** with clickable links
✅ **Integrated workflow** with content detection
✅ **Fallback handling** when API is unavailable
✅ **Responsive UI** with dark mode support
