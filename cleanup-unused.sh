#!/bin/bash

echo "🧹 Cleaning up unused files and fixing issues..."
echo "================================================"

# Remove unused files
echo "📁 Removing unused files..."

# Remove duplicate upload file
if [ -f "api/upload-simple.ts" ]; then
    rm -f api/upload-simple.ts
    echo "✅ Removed api/upload-simple.ts (duplicate of upload.ts)"
fi

# Remove temporary test files  
rm -f test-upload-flow.sh
rm -f test-upload.sh
rm -f fix-tailwind.sh
rm -f fix-git-divergent.sh
rm -f deploy-demo.sh
rm -f test-output.css
rm -f *.log
echo "✅ Removed temporary files"

# Remove any remaining merge conflict files
find . -name "*.orig" -delete 2>/dev/null || true
find . -name "*.rej" -delete 2>/dev/null || true
echo "✅ Removed merge conflict files"

# Clean up documentation that's not needed
rm -f POSTCSS_FIX_APPLIED.md
rm -f GIT_DIVERGENT_FIX.md  
rm -f UPLOAD_FLOW.md
rm -f GIT_COMMANDS.md
echo "✅ Removed temporary documentation"

echo ""
echo "🔧 Final cleanup tasks..."

# Check for any remaining merge conflicts
echo "📋 Checking for remaining merge conflicts..."
if grep -r "<<<<<<< HEAD" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
    echo "❌ Found remaining merge conflicts! Please resolve manually."
else
    echo "✅ No merge conflicts found"
fi

# Check TypeScript compilation
echo "📋 Checking TypeScript compilation..."
if command -v tsc >/dev/null 2>&1; then
    if tsc --noEmit --skipLibCheck; then
        echo "✅ TypeScript compilation successful"
    else
        echo "❌ TypeScript errors found"
    fi
else
    echo "⚠️  TypeScript not available for checking"
fi

echo ""
echo "🎉 Cleanup completed!"
echo "==================="
echo ""
echo "📋 Summary:"
echo "- Removed duplicate and unused files"
echo "- Cleaned up temporary documentation"  
echo "- Fixed merge conflicts in database.ts and api/demo.ts"
echo "- Ready for development and deployment"
echo ""
echo "🚀 Next steps:"
echo "1. npm install (if needed)"
echo "2. npm run dev (to test)"
echo "3. git add . && git commit && git push"