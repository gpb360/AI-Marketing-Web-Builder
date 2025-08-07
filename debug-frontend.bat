@echo off
echo 🔍 Debugging Frontend Issues...
echo.

REM Kill any existing processes on port 3000
echo 🧹 Cleaning up port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Killing process %%a on port 3000
    taskkill /f /pid %%a >nul 2>&1
)

timeout /t 2 >nul

REM Navigate to web-builder directory
cd web-builder
if %errorlevel% neq 0 (
    echo ❌ Cannot find web-builder directory
    pause
    exit /b 1
)

echo 📍 Current directory: %CD%

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found
    pause
    exit /b 1
)

echo ✅ package.json found

REM Check Node.js version
echo 🔧 Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found
    pause
    exit /b 1
)

REM Check npm version
echo 🔧 Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo ❌ npm not found
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 node_modules not found, installing...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ npm install failed
        pause
        exit /b 1
    )
) else (
    echo ✅ node_modules found
)

REM Check if Next.js is properly installed
echo 🔧 Checking Next.js installation...
if exist "node_modules\.bin\next.cmd" (
    echo ✅ Next.js binary found
) else (
    echo ❌ Next.js binary not found, reinstalling...
    npm install next@latest
    if %errorlevel% neq 0 (
        echo ❌ Next.js installation failed
        pause
        exit /b 1
    )
)

REM Try to start Next.js with verbose output
echo 🚀 Starting Next.js with debug output...
echo.
echo ========================================
echo If the server hangs here, press Ctrl+C
echo and check for TypeScript/compilation errors
echo ========================================
echo.

REM Set debug environment variables
set DEBUG=*
set NODE_ENV=development

REM Try starting with npx first
echo Method 1: Using npx next dev
npx next dev --port 3000

echo.
echo If that failed, trying alternative method...
echo Method 2: Using npm run dev
npm run dev

pause
