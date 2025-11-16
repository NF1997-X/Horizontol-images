#!/bin/bash

echo "🧹 Cleaning and fixing PostCSS + TailwindCSS..."

# Remove node_modules and reinstall fresh
rm -rf node_modules package-lock.json

echo "📦 Installing fresh packages..."
npm install

echo "🎨 Testing TailwindCSS compilation..."
npx tailwindcss -i ./client/src/index.css -o ./test-output.css --watch=false

if [ $? -eq 0 ]; then
    echo "✅ TailwindCSS compilation successful!"
    rm -f test-output.css
else
    echo "❌ TailwindCSS compilation failed"
fi

echo "🚀 Starting dev server..."
npm run dev