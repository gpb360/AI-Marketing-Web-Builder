@echo off
REM AI Marketing Web Builder - Development Stop Script (Windows)
REM Stops both backend and frontend services

echo 🛑 Stopping AI Marketing Web Builder Development Environment...
echo.

REM Kill processes on port 8000 (Backend)
echo 🔧 Stopping Backend (port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Killing process %%a on port 8000
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill processes on port 3000 (Frontend)
echo 🎨 Stopping Frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Killing process %%a on port 3000
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill any remaining Python/Node processes that might be related
echo 🧹 Cleaning up remaining processes...
taskkill /f /im "python.exe" /fi "WINDOWTITLE eq Backend Server" >nul 2>&1
taskkill /f /im "node.exe" /fi "WINDOWTITLE eq Frontend Server" >nul 2>&1

REM Wait a moment
timeout /t 2 >nul

REM Check if ports are now free
echo.
echo 📋 Checking port status...

netstat -an | findstr ":8000" >nul 2>&1
if %errorlevel% == 0 (
    echo ⚠️  Port 8000 still in use
) else (
    echo ✅ Port 8000 is now free
)

netstat -an | findstr ":3000" >nul 2>&1
if %errorlevel% == 0 (
    echo ⚠️  Port 3000 still in use
) else (
    echo ✅ Port 3000 is now free
)

echo.
echo 🎉 Development environment stopped!
echo.
pause
