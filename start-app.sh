#!/bin/bash

# ClubSphere - Quick Start Script for Mac/Linux

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     ClubSphere - Event Management        ║"
echo "║     Starting Application...              ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if MongoDB is running
if ! nc -z localhost 27017 &> /dev/null; then
    echo "⚠️  WARNING: MongoDB not detected on port 27017"
    echo "Make sure MongoDB is running before starting the app"
    echo ""
fi

echo "Starting Backend Server on Port 5000..."
cd backend && npm start &
BACKEND_PID=$!

sleep 3

echo "Starting Frontend Server on Port 3000..."
cd ../frontend && npm start &
FRONTEND_PID=$!

sleep 3

echo ""
echo "✓ Both servers are starting..."
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:5000/api"
echo ""
echo "👤 Test Credentials:"
echo "   Admin: admin@college.edu / admin123"
echo "   Student: student@college.edu / student123"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

wait
