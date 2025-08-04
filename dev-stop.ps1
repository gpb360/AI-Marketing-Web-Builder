# AI Marketing Web Builder - Development Stop Script (PowerShell)
# Stops both backend and frontend services

Write-Host "🛑 Stopping AI Marketing Web Builder Development Environment..." -ForegroundColor Red
Write-Host ""

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()
        return $listener | Where-Object { $_.Port -eq $Port }
    }
    catch {
        return $false
    }
}

# Function to kill processes on a specific port
function Stop-ProcessOnPort {
    param([int]$Port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        foreach ($process in $processes) {
            $pid = $process.OwningProcess
            if ($pid -and $pid -ne 0) {
                Write-Host "Stopping process $pid on port $Port" -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
    }
    catch {
        Write-Host "No processes found on port $Port" -ForegroundColor Gray
    }
}

# Stop background jobs if they exist
if (Test-Path ".backend.job") {
    $backendJobId = Get-Content ".backend.job" -ErrorAction SilentlyContinue
    if ($backendJobId) {
        Write-Host "🔧 Stopping Backend job $backendJobId..." -ForegroundColor Blue
        Stop-Job -Id $backendJobId -ErrorAction SilentlyContinue
        Remove-Job -Id $backendJobId -ErrorAction SilentlyContinue
    }
    Remove-Item ".backend.job" -ErrorAction SilentlyContinue
}

if (Test-Path ".frontend.job") {
    $frontendJobId = Get-Content ".frontend.job" -ErrorAction SilentlyContinue
    if ($frontendJobId) {
        Write-Host "🎨 Stopping Frontend job $frontendJobId..." -ForegroundColor Blue
        Stop-Job -Id $frontendJobId -ErrorAction SilentlyContinue
        Remove-Job -Id $frontendJobId -ErrorAction SilentlyContinue
    }
    Remove-Item ".frontend.job" -ErrorAction SilentlyContinue
}

# Kill processes on ports
Write-Host "🔧 Stopping Backend (port 8000)..." -ForegroundColor Blue
Stop-ProcessOnPort -Port 8000

Write-Host "🎨 Stopping Frontend (port 3000)..." -ForegroundColor Blue
Stop-ProcessOnPort -Port 3000

# Clean up any remaining processes
Write-Host "🧹 Cleaning up remaining processes..." -ForegroundColor Yellow

# Kill Python processes that might be running mock_server.py
Get-Process python -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*mock_server.py*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

# Kill Node processes that might be running Next.js
Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*next*dev*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Check port status
Write-Host ""
Write-Host "📋 Checking port status..." -ForegroundColor Blue

if (Test-Port -Port 8000) {
    Write-Host "⚠️  Port 8000 still in use" -ForegroundColor Yellow
} else {
    Write-Host "✅ Port 8000 is now free" -ForegroundColor Green
}

if (Test-Port -Port 3000) {
    Write-Host "⚠️  Port 3000 still in use" -ForegroundColor Yellow
} else {
    Write-Host "✅ Port 3000 is now free" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Development environment stopped!" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to exit"
