# AI Marketing Web Builder - Development Startup Script (PowerShell)
# Starts both backend and frontend services for testing

Write-Host "🚀 Starting AI Marketing Web Builder Development Environment..." -ForegroundColor Green
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

# Clean up existing processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Stop-ProcessOnPort -Port 8000
Stop-ProcessOnPort -Port 3000
Start-Sleep -Seconds 2

# Start Backend (Mock Server on port 8000)
Write-Host "🔧 Starting Backend (Mock Server)..." -ForegroundColor Blue
Set-Location backend

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://python.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Start mock backend
Write-Host "🚀 Launching Backend on http://localhost:8000" -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    python mock_server.py
}

# Give backend time to start
Start-Sleep -Seconds 3

# Check if backend started successfully
if (Test-Port -Port 8000) {
    Write-Host "✅ Backend running on port 8000" -ForegroundColor Green
} else {
    Write-Host "❌ Backend failed to start" -ForegroundColor Red
}

# Start Frontend (Next.js on port 3000)
Write-Host "🎨 Starting Frontend (Next.js)..." -ForegroundColor Blue
Set-Location ..\web-builder

# Check if Node.js is available
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Start frontend
Write-Host "🚀 Launching Frontend on http://localhost:3000" -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

# Give frontend time to start
Start-Sleep -Seconds 5

# Check if frontend started successfully
if (Test-Port -Port 3000) {
    Write-Host "✅ Frontend running on port 3000" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend failed to start" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Development Environment Started!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Services:" -ForegroundColor Blue
Write-Host "   • Backend API:  http://localhost:8000" -ForegroundColor White
Write-Host "   • Frontend App: http://localhost:3000" -ForegroundColor White
Write-Host "   • API Docs:     http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "📋 Management:" -ForegroundColor Blue
Write-Host "   • Stop all services: .\dev-stop.ps1" -ForegroundColor White
Write-Host "   • View backend job: Get-Job -Id $($backendJob.Id)" -ForegroundColor White
Write-Host "   • View frontend job: Get-Job -Id $($frontendJob.Id)" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Job IDs:" -ForegroundColor Blue
Write-Host "   • Backend Job: $($backendJob.Id)" -ForegroundColor White
Write-Host "   • Frontend Job: $($frontendJob.Id)" -ForegroundColor White
Write-Host ""

# Save job IDs for stop script
$backendJob.Id | Out-File -FilePath ".backend.job" -Encoding UTF8
$frontendJob.Id | Out-File -FilePath ".frontend.job" -Encoding UTF8

Write-Host "✨ Ready for development!" -ForegroundColor Green
Write-Host ""

# Ask if user wants to open browser
$openBrowser = Read-Host "Open frontend in browser? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y" -or $openBrowser -eq "") {
    Start-Process "http://localhost:3000"
}

Write-Host ""
Write-Host "Services are running in background jobs." -ForegroundColor Yellow
Write-Host "Run .\dev-stop.ps1 to stop all services." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to exit this script (services will continue running)." -ForegroundColor Yellow

# Keep script running to monitor jobs
try {
    while ($true) {
        Start-Sleep -Seconds 10
        
        # Check if jobs are still running
        $backendStatus = Get-Job -Id $backendJob.Id -ErrorAction SilentlyContinue
        $frontendStatus = Get-Job -Id $frontendJob.Id -ErrorAction SilentlyContinue
        
        if ($backendStatus.State -eq "Failed") {
            Write-Host "⚠️  Backend job failed!" -ForegroundColor Red
        }
        
        if ($frontendStatus.State -eq "Failed") {
            Write-Host "⚠️  Frontend job failed!" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host "Script interrupted. Services are still running in background." -ForegroundColor Yellow
}
