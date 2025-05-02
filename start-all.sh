#!/bin/bash

# Backend
echo "🚀 Starting backend (server.js)..."
cd "$(dirname "$0")/moderation-server" || exit 1
node server.js &
BACK_PID=$!

# Frontend
echo "🌐 Starting React frontend..."
cd "$(dirname "$0")/my-image-moderation-app" || exit 1
npm run dev &

# Wait for backend to finish
wait $BACK_PID
