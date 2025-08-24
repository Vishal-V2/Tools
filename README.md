# Factora Content Detector

A sophisticated Chrome extension that proactively identifies and disrupts fake content and honeytrap operations on the web.

## Features

- 🔍 **Content Detection**: Analyzes web pages for generated content patterns
- 🚨 **Fake News Detection**: Identifies potential fake news and misinformation
- 🎨 **Modern UI**: Clean, responsive interface with dark/light theme support
- ⚡ **Real-time Analysis**: Instant scanning and analysis of web content
- 📊 **Detailed Reports**: Comprehensive analysis with confidence scores
- 🔧 **Customizable Settings**: User preferences and scanning options

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Extension**: Chrome Extension Manifest V3

## Project Structure

```
factora1/
├── src/
│   ├── popup/           # Extension popup UI
│   ├── background/      # Service worker
│   ├── content/         # Content scripts
│   └── lib/            # Utility functions
├── public/             # Static assets
├── dist/              # Build output
└── manifest.json      # Extension manifest
```

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Mode

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Loading the Extension

1. Build the project: `npm run build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder

## Usage

1. **Install the Extension**: Load the extension in Chrome
2. **Navigate to a Webpage**: Visit any website you want to analyze
3. **Click the Extension Icon**: Open the popup to see the interface
4. **Scan the Page**: Click "Scan Page" to analyze the content
5. **Review Results**: View detailed analysis and risk assessments

## Features in Detail

### Content Detection
- Analyzes text patterns and writing styles
- Identifies generated content markers
- Provides confidence scores for detection

### Fake News Detection
- Checks for credible sources and citations
- Analyzes claim consistency
- Identifies sensationalist language patterns

### Risk Assessment
- **Low Risk**: Content appears genuine
- **Medium Risk**: Some suspicious indicators
- **High Risk**: Strong evidence of generated content or fake news

### Settings
- **Theme Toggle**: Switch between light and dark themes
- **Auto Scan**: Automatically scan pages on load
- **Notifications**: Enable/disable alerts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

- [ ] Integration with external fact-checking APIs
- [ ] Advanced algorithms for improved detection
- [ ] Browser action badge with real-time alerts
- [ ] Export analysis reports
- [ ] Custom detection rules
- [ ] Multi-language support

## Security

This extension:
- Only reads page content for analysis
- Does not collect personal data
- Does not track user browsing history
- All analysis is performed locally or through secure APIs

## Support

For issues and feature requests, please open an issue on GitHub. 