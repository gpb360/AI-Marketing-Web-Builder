@echo off
REM Emergency PNPM Recovery Script for AI Marketing Web Builder
REM This script fixes common dependency issues and migrates to pnpm

echo ==============================================
echo   AI Marketing Web Builder - PNPM Recovery
echo ==============================================
echo.

echo [1/6] Stopping any running development servers...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Cleaning corrupted installations...
if exist node_modules (
    echo Removing node_modules directory...
    rmdir /s /q node_modules
)

if exist package-lock.json (
    echo Removing npm lockfile...
    del package-lock.json
)

echo [3/6] Cleaning npm cache...
npm cache clean --force 2>nul

echo [4/6] Initializing pnpm store...
pnpm store prune
pnpm cache clear

echo [5/6] Installing dependencies with pnpm...
pnpm install --no-optional --frozen-lockfile

echo [6/6] Verifying installation...
pnpm exec next --version
if %errorlevel% equ 0 (
    echo.
    echo ✓ Recovery completed successfully!
    echo ✓ Next.js is accessible via pnpm
    echo.
    echo You can now run:
    echo   pnpm run dev    ^(start development server^)
    echo   pnpm run build  ^(create production build^)
    echo   pnpm run test   ^(run tests^)
    echo.
) else (
    echo.
    echo ✗ Recovery failed. Please check the error messages above.
    echo.
)

pause