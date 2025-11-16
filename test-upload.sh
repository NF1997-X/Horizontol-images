#!/bin/bash

echo "🚀 Starting dev server for upload testing..."

# Kill any existing processes on port 5000
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Start the dev server
cd "/workspaces/Horizontol-images"
npm run dev