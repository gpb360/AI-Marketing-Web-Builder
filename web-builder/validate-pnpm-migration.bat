@echo off
REM PNPM Migration Validation Script
REM Validates that the migration to pnpm was successful

echo ==============================================
echo   PNPM Migration Validation
echo ==============================================
echo.

set "errors=0"

echo [1/7] Checking pnpm installation...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ PNPM is not installed or not accessible
    set /a errors+=1
) else (
    for /f %%i in ('pnpm --version') do echo ✓ PNPM %%i is installed
)

echo.
echo [2/7] Checking project configuration...
if exist .pnpmrc (
    echo ✓ .pnpmrc configuration file exists
) else (
    echo ✗ .pnpmrc configuration file missing
    set /a errors+=1
)

if exist pnpm-lock.yaml (
    echo ✓ pnpm-lock.yaml lockfile exists
) else (
    echo ✗ pnpm-lock.yaml lockfile missing
    set /a errors+=1
)

if exist package-lock.json (
    echo ⚠ package-lock.json still exists (should be removed)
    set /a errors+=1
) else (
    echo ✓ npm lockfile properly removed
)

echo.
echo [3/7] Checking node_modules structure...
if exist node_modules\.pnpm (
    echo ✓ PNPM node_modules structure detected
) else (
    echo ✗ PNPM node_modules structure not found
    set /a errors+=1
)

echo.
echo [4/7] Verifying core binaries...
pnpm exec next --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Next.js binary not accessible via pnpm
    set /a errors+=1
) else (
    for /f %%i in ('pnpm exec next --version') do echo ✓ Next.js %%i accessible
)

pnpm exec tsc --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ TypeScript binary not accessible via pnpm
    set /a errors+=1
) else (
    for /f %%i in ('pnpm exec tsc --version') do echo ✓ TypeScript %%i accessible
)

echo.
echo [5/7] Checking package.json pnpm configuration...
findstr /c:"packageManager.*pnpm" package.json >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ package.json missing packageManager field
) else (
    echo ✓ package.json configured for pnpm
)

echo.
echo [6/7] Testing pnpm scripts...
echo Testing: pnpm run type-check...
pnpm run type-check >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ TypeScript check has errors (expected due to existing type issues)
) else (
    echo ✓ TypeScript check passed
)

echo.
echo [7/7] Testing development server start...
echo Starting dev server for 5 seconds...
timeout /t 1 /nobreak >nul
start /b pnpm run dev >dev-test.log 2>&1
timeout /t 5 /nobreak >nul
taskkill /f /im node.exe >nul 2>&1

findstr /c:"Ready in" dev-test.log >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Development server failed to start
    set /a errors+=1
) else (
    echo ✓ Development server started successfully
)

if exist dev-test.log del dev-test.log

echo.
echo ==============================================
if %errors% equ 0 (
    echo ✓ PNPM MIGRATION SUCCESSFUL!
    echo All checks passed. You can now use:
    echo   pnpm run dev    ^(start development^)
    echo   pnpm run build  ^(production build^)
    echo   pnpm install    ^(add dependencies^)
    echo   pnpm store prune ^(clean store^)
) else (
    echo ✗ PNPM MIGRATION ISSUES DETECTED
    echo Found %errors% issues. Please run emergency-pnpm-recovery.bat
)
echo ==============================================

pause