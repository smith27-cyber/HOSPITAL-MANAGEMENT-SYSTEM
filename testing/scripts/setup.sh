#!/bin/bash

echo "=========================================="
echo "HMS Testing System Setup"
echo "=========================================="

# Install simulator dependencies
echo ""
echo "📦 Installing simulator dependencies..."
cd "$(dirname "$0")/../sim"
npm install
echo "✅ Simulator ready"

# Install Playwright dependencies
echo ""
echo "📦 Installing Playwright dependencies..."
cd "$(dirname "$0")/../playwright"
npm install
npm install -D @types/node
echo "✅ Playwright ready"

# Install Playwright browsers
echo ""
echo "📦 Installing Playwright browsers..."
npx playwright install chromium firefox webkit
echo "✅ Browsers ready"

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start the simulator: npm run sim"
echo "2. Run tests: npm run test"
echo ""
