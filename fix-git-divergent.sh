#!/bin/bash

echo "🔧 Fixing divergent branches issue..."
echo "======================================"

# Set git config untuk pull strategy
echo "Setting git pull strategy to merge..."
git config pull.rebase false

# Check current status
echo ""
echo "📋 Current git status:"
git status --short

# Pull latest changes from remote with merge strategy
echo ""
echo "📥 Pulling latest changes from remote..."
git pull origin copilot/appropriate-bobcat --no-rebase

if [ $? -eq 0 ]; then
    echo "✅ Pull successful!"
    
    # Add all changes
    echo ""
    echo "📁 Adding all changes..."
    git add .
    
    # Commit with detailed message  
    echo ""
    echo "💾 Committing changes..."
    git commit -m "feat: Revert to local upload system and fix PostCSS configuration

🔄 Upload System Reverted:
- Removed complex Cloudinary multi-strategy system  
- Implemented simple local file upload using fs/promises
- Files saved to /uploads directory with unique filenames
- Added static file serving for uploaded images

🔧 PostCSS & TailwindCSS Fixes:
- Removed conflicting @tailwindcss/vite v4 plugin
- Converted tailwind.config.ts to tailwind.config.js (CommonJS)
- Updated postcss.config.js to CommonJS format  
- Fixed plugin conflicts and compilation errors

📁 File Structure:
- api/upload.ts: Clean local file upload implementation
- server/index.ts: Added /uploads static file serving
- client/src/components/: Cleaned up debug console.log statements
- tailwind.config.js: Converted from TypeScript to JS config

🎯 Upload Flow:
1. File upload → /api/upload → saves to /uploads/
2. Database save → /api/rows/[rowId]/images → saves metadata
3. Image accessible via /uploads/filename.jpg

✅ Benefits:
- Simple, reliable upload system
- No external dependencies (Cloudinary removed)  
- Faster development and debugging
- Works in both development and production"

    if [ $? -eq 0 ]; then
        echo "✅ Commit successful!"
        
        # Push to remote
        echo ""
        echo "📤 Pushing to remote repository..."
        git push origin HEAD
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 SUCCESS! All changes committed and pushed!"
            echo ""
            echo "🔗 Check your pull request at:"
            echo "   https://github.com/NF1997-X/Horizontol-images/pull/1"
        else
            echo "❌ Push failed. Check network connection or permissions."
        fi
    else
        echo "❌ Commit failed. Check for conflicts."
    fi
else
    echo "❌ Pull failed. May need to resolve conflicts manually."
    echo ""
    echo "🛠️ Try these commands manually:"
    echo "   git pull origin copilot/appropriate-bobcat"
    echo "   # Resolve any conflicts"
    echo "   git add ."
    echo "   git commit -m \"your commit message\""
    echo "   git push origin HEAD"
fi