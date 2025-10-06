#!/bin/bash

echo "🚀 Starting BESTEA Development Servers..."

# Start backend server
echo "📡 Starting Backend Server (Port 5000)..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting Frontend Server (Port 3000)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting up!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup when script exits
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT

# Wait for both processes
wait
