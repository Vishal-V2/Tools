#!/bin/bash

echo "Installing Factora AI Detector dependencies..."
npm install

echo ""
echo "Building the extension..."
npm run build

echo ""
echo "Installation complete!"
echo ""
echo "To load the extension in Chrome:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked' and select the dist folder"
echo "" 