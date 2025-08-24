@echo off
echo 🧹 AI Marketing Web Builder - Fresh Install Script
echo =====================================================

echo.
echo 🛑 Stopping any running processes...
taskkill /f /im node.exe 2>nul

echo.
echo 📦 Cleaning up existing installation...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)

if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)

if exist .next (
    echo Removing .next build cache...
    rmdir /s /q .next
)

echo.
echo 🧽 Clearing npm cache...
npm cache clean --force

echo.
echo 📥 Installing dependencies...
npm install

if %ERRORLEVEL% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

echo.
echo ✅ Fresh installation completed successfully!
echo.
echo 🚀 Starting development server...
echo.
node debug-dev-server.js

pause