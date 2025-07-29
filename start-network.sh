#!/bin/bash

# Get local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo "🌐 Starting EcoDEX for Network Access"
echo "=================================="
echo ""
echo "📱 Mobile Access URLs:"
echo "Frontend: http://$LOCAL_IP:3000"
echo "Backend:  http://$LOCAL_IP:5000"
echo ""
echo "💻 Local Access URLs:"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo ""
echo "📋 Instructions for Mobile Testing:"
echo "1. Make sure your phone is connected to the same WiFi network"
echo "2. Open your phone's browser"
echo "3. Navigate to: http://$LOCAL_IP:3000"
echo "4. Allow camera permissions when prompted"
echo ""
echo "🚀 Starting servers..."
echo ""

# Start backend server in background
echo "Starting backend server..."
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "Starting frontend server..."
cd client && npm run start:https

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM