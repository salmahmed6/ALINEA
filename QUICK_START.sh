#!/bin/bash

# ALINEA Quick Start Script
# Run this to get ALINEA up and running locally

echo "🚀 Starting ALINEA..."

# Check if Node.js and pnpm are installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js first."
  exit 1
fi

if ! command -v pnpm &> /dev/null; then
  echo "⚠️  pnpm is not installed. Installing via npm..."
  npm install -g pnpm
fi

echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "To start the development server, run:"
echo "  pnpm dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Optional: To enable Claude AI coaching, set ANTHROPIC_API_KEY in .env.local"
echo ""
echo "Happy trading! 💜"
