@echo off
REM Quick PNPM Development Startup Script
REM Starts the development environment with pnpm

echo ==============================================
echo   AI Marketing Web Builder - PNPM Dev Start
echo ==============================================
echo.

echo [1/3] Checking PNPM installation...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ PNPM not found. Installing...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo ✗ Failed to install PNPM. Please install manually.
        pause
        exit /b 1
    )
)

for /f %%i in ('pnpm --version') do echo ✓ Using PNPM %%i

echo.
echo [2/3] Verifying dependencies...
if not exist node_modules\.pnpm (
    echo Installing dependencies with PNPM...
    pnpm install
    if %errorlevel% neq 0 (
        echo ✗ Failed to install dependencies.
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencies already installed
)

echo.
echo [3/3] Starting development server...
echo.
echo Server will be available at:
echo   Local:   http://localhost:3003
echo   Network: http://0.0.0.0:3003
echo.
echo Press Ctrl+C to stop the server
echo.

pnpm run dev