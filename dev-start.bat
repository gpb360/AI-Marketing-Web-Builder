@echo off
REM AI Marketing Web Builder - Development Startup Script (Windows)
REM Starts both backend and frontend services for testing

echo 🚀 Starting AI Marketing Web Builder Development Environment...
echo.

REM Function to check if port is in use
:check_port
netstat -an | findstr ":%1 " >nul 2>&1
if %errorlevel% == 0 (
    exit /b 0
) else (
    exit /b 1
)

REM Kill existing processes on ports 8000 and 3000
echo 🧹 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000"') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 >nul

REM Start Backend (Mock Server on port 8000)
echo 🔧 Starting Backend (Mock Server)...
cd backend

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

REM Start mock backend in background
echo 🚀 Launching Backend on http://localhost:8000
start "Backend Server" cmd /c "python mock_server.py"

REM Give backend time to start
timeout /t 3 >nul

REM Check if backend started successfully
call :check_port 8000
if %errorlevel% == 0 (
    echo ✅ Backend running on port 8000
) else (
    echo ❌ Backend failed to start
)

REM Start Frontend (Next.js on port 3000)
echo 🎨 Starting Frontend (Next.js)...
cd ..\web-builder

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start frontend in background
echo 🚀 Launching Frontend on http://localhost:3000
start "Frontend Server" cmd /c "npm run dev"

REM Give frontend time to start
timeout /t 5 >nul

REM Check if frontend started successfully
call :check_port 3000
if %errorlevel% == 0 (
    echo ✅ Frontend running on port 3000
) else (
    echo ❌ Frontend failed to start
)

echo.
echo 🎉 Development Environment Started!
echo.
echo 📍 Services:
echo    • Backend API:  http://localhost:8000
echo    • Frontend App: http://localhost:3000
echo    • API Docs:     http://localhost:8000/docs
echo.
echo 📋 Management:
echo    • Stop all services: dev-stop.bat
echo    • View running processes: tasklist ^| findstr "python\|node"
echo.
echo ✨ Ready for development!
echo.
echo Press any key to open the frontend in your browser...
pause >nul

REM Open frontend in default browser
start http://localhost:3000

echo.
echo Services are running in separate windows.
echo Close those windows or run dev-stop.bat to stop the services.
pause
