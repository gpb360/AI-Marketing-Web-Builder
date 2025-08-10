@echo off
echo ========================================
echo  Next.js Development Server Fixer
echo ========================================
echo.

cd /d "%~dp0"

echo Current directory: %CD%
echo.

echo Step 1: Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Step 2: Checking npm installation...
npm --version
if errorlevel 1 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo Step 3: Checking if package.json exists...
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Make sure you're in the correct directory
    pause
    exit /b 1
)

echo Step 4: Installing/updating dependencies...
npm install
if errorlevel 1 (
    echo WARNING: npm install had issues, trying to fix...
    echo Cleaning npm cache...
    npm cache clean --force
    echo Retrying npm install...
    npm install
    if errorlevel 1 (
        echo ERROR: Could not install dependencies
        pause
        exit /b 1
    )
)

echo Step 5: Checking Next.js installation...
if exist "node_modules\.bin\next.cmd" (
    echo ✓ Next.js found in .bin directory
    echo Starting with .bin method...
    node_modules\.bin\next.cmd dev
) else if exist "node_modules\next" (
    echo ✓ Next.js module found, trying npx...
    npx next dev
) else (
    echo Installing Next.js specifically...
    npm install next@latest
    if errorlevel 1 (
        echo ERROR: Could not install Next.js
        pause
        exit /b 1
    )
    echo Trying to start Next.js...
    npx next dev
)

echo.
echo If you see this message, the server stopped unexpectedly.
pause
