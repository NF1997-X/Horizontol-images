#!/bin/bash

# Quick deploy script for demo mode

echo "🚀 Deploying Gallery Demo Mode..."

# Add all changes
git add .

# Commit with demo mode message
git commit -m "feat: Emergency demo mode with static gallery data

- Added DEMO_MODE configuration to bypass database issues
- 3 demo rows: Nature Photos, City Life, Food & Drinks  
- 10 beautiful demo images using picsum.photos
- Hides all edit/add/delete buttons in demo mode
- Shows 'DEMO MODE' indicator in UI
- Copy links and preview mode still work
- Glass theme and dark mode fully functional

This ensures a working gallery deployment while database issues are resolved."

# Push to main branch
git push origin main

echo "✅ Demo mode deployed! Check your hosting provider for updates."
echo ""
echo "🎨 Demo Features:"
echo "- Beautiful glass theme with dark/light mode"
echo "- 10 curated images across 3 themed rows"
echo "- Working copy links and preview mode"
echo "- Responsive design with smooth animations"
echo "- No database dependencies (pure static demo)"
echo ""
echo "To disable demo mode later:"
echo "- Set DEMO_MODE = false in client/src/lib/demo.ts"
echo "- Fix database connection issues"
echo "- Redeploy"