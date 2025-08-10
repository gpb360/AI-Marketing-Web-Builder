@echo off
echo Starting Next.js Development Server...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Try different ways to start Next.js
echo Attempting to start Next.js...

REM Method 1: Try npx
echo Method 1: Using npx next dev
npx next dev
if not errorlevel 1 goto :success

REM Method 2: Try direct node execution
echo Method 2: Using node directly
if exist "node_modules\.bin\next.cmd" (
    node_modules\.bin\next.cmd dev
    if not errorlevel 1 goto :success
)

REM Method 3: Try npm run dev
echo Method 3: Using npm run dev
npm run dev
if not errorlevel 1 goto :success

REM Method 4: Reinstall Next.js and try again
echo Method 4: Reinstalling Next.js...
npm uninstall next
npm install next@latest
if errorlevel 1 (
    echo Failed to reinstall Next.js
    goto :error
)

npx next dev
if not errorlevel 1 goto :success

:error
echo.
echo ========================================
echo ERROR: Could not start Next.js server
echo ========================================
echo.
echo Troubleshooting steps:
echo 1. Delete node_modules folder
echo 2. Run: npm install
echo 3. Run: npm run dev
echo.
echo If the problem persists:
echo 1. Check if Node.js is properly installed
echo 2. Try running: npm cache clean --force
echo 3. Delete package-lock.json and reinstall
echo.
pause
exit /b 1

:success
echo.
echo ========================================
echo Next.js Development Server Started!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
