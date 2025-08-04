@echo off
echo 🔧 Complete Next.js Fix Script
echo ================================
echo.

REM Step 1: Clean everything
echo Step 1: Cleaning existing installation...
if exist "node_modules" (
    echo Removing node_modules...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo Removing package-lock.json...
    del package-lock.json
)

if exist ".next" (
    echo Removing .next cache...
    rmdir /s /q .next
)

REM Step 2: Clear npm cache
echo Step 2: Clearing npm cache...
npm cache clean --force

REM Step 3: Install dependencies
echo Step 3: Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

REM Step 4: Verify Next.js installation
echo Step 4: Verifying Next.js installation...
if exist "node_modules\.bin\next.cmd" (
    echo ✅ Next.js binary found
) else (
    echo ❌ Next.js binary missing, installing specifically...
    npm install next@latest --save
)

REM Step 5: Try to start Next.js
echo Step 5: Starting Next.js...
echo.
echo ========================================
echo Starting development server...
echo If successful, the app will be at:
echo http://localhost:3000
echo ========================================
echo.

REM Try different methods to start Next.js
echo Method 1: Direct binary execution
if exist "node_modules\.bin\next.cmd" (
    "node_modules\.bin\next.cmd" dev
) else (
    echo Method 2: Using npm run dev
    npm run dev
)

pause
