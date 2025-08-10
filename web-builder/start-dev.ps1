# PowerShell script to start Next.js development server
Write-Host "Starting Next.js Development Server..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Function to test if Next.js is working
function Test-NextJS {
    Write-Host "Testing Next.js installation..." -ForegroundColor Yellow
    
    # Check if next binary exists
    if (Test-Path "node_modules\.bin\next.cmd") {
        Write-Host "✓ Next.js binary found" -ForegroundColor Green
        return $true
    } elseif (Test-Path "node_modules\next\dist\bin\next") {
        Write-Host "✓ Next.js dist found" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ Next.js binary not found" -ForegroundColor Red
        return $false
    }
}

# Function to reinstall Next.js
function Reinstall-NextJS {
    Write-Host "Reinstalling Next.js..." -ForegroundColor Yellow
    
    # Remove Next.js
    npm uninstall next
    
    # Clear npm cache
    npm cache clean --force
    
    # Reinstall Next.js
    npm install next@latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Next.js reinstalled successfully" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ Failed to reinstall Next.js" -ForegroundColor Red
        return $false
    }
}

# Try different methods to start Next.js
Write-Host "Attempting to start Next.js..." -ForegroundColor Cyan

# Method 1: Try npx
Write-Host "Method 1: Using npx next dev" -ForegroundColor Yellow
try {
    & npx next dev
    if ($LASTEXITCODE -eq 0) {
        exit 0
    }
} catch {
    Write-Host "Method 1 failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Method 2: Try direct execution
Write-Host "Method 2: Using direct execution" -ForegroundColor Yellow
if (Test-Path "node_modules\.bin\next.cmd") {
    try {
        & "node_modules\.bin\next.cmd" dev
        if ($LASTEXITCODE -eq 0) {
            exit 0
        }
    } catch {
        Write-Host "Method 2 failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Method 3: Try npm run dev
Write-Host "Method 3: Using npm run dev" -ForegroundColor Yellow
try {
    npm run dev
    if ($LASTEXITCODE -eq 0) {
        exit 0
    }
} catch {
    Write-Host "Method 3 failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Method 4: Reinstall and try again
Write-Host "Method 4: Reinstalling Next.js and retrying..." -ForegroundColor Yellow
if (Reinstall-NextJS) {
    try {
        & npx next dev
        if ($LASTEXITCODE -eq 0) {
            exit 0
        }
    } catch {
        Write-Host "Final attempt failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# If all methods fail, show error message
Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "ERROR: Could not start Next.js server" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
Write-Host "1. Delete node_modules folder: Remove-Item -Recurse -Force node_modules" -ForegroundColor White
Write-Host "2. Delete package-lock.json: Remove-Item package-lock.json" -ForegroundColor White
Write-Host "3. Run: npm install" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "If the problem persists:" -ForegroundColor Yellow
Write-Host "1. Check if Node.js is properly installed: node --version" -ForegroundColor White
Write-Host "2. Try running: npm cache clean --force" -ForegroundColor White
Write-Host "3. Check npm version: npm --version" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
exit 1
