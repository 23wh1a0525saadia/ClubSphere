@echo off
REM ClubSphere - Quick Start Script for Windows

echo.
echo ╔══════════════════════════════════════════╗
echo ║     ClubSphere - Event Management        ║
echo ║     Starting Application...              ║
echo ╚══════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MongoDB is running
netstat -an | find ":27017" >nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: MongoDB not detected on port 27017
    echo Make sure MongoDB is running before starting the app
    echo.
)

echo Starting Backend Server on Port 5000...
start "ClubSphere Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak

echo Starting Frontend Server on Port 3000...
start "ClubSphere Frontend" cmd /k "cd frontend && npm start"

timeout /t 3 /nobreak

echo.
echo ✓ Both servers are starting...
echo.
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend API: http://localhost:5000/api
echo.
echo 👤 Test Credentials:
echo    Admin: admin@college.edu / admin123
echo    Student: student@college.edu / student123
echo.
echo Press any key to keep these windows open...
echo Minimize these windows (don't close) to keep servers running
pause >nul
