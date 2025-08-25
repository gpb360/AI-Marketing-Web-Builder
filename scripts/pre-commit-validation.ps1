# AI Marketing Web Builder - Pre-commit Validation Script (PowerShell)
# Comprehensive quality checks before commits
# Author: AI IDE Agent System
# Version: 1.0.0

param(
    [string]$CommitMessageFile,
    [switch]$SkipWarnings,
    [switch]$Help
)

# Configuration
$MAX_FILE_SIZE_MB = 10
$MAX_LINE_LENGTH = 120
$PROJECT_ROOT = git rev-parse --show-toplevel

# Counters
$script:Warnings = 0
$script:Errors = 0

# Color output functions
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { 
    param($Message) 
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
    $script:Warnings++
}
function Write-Error { 
    param($Message) 
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    $script:Errors++
}

function Show-Help {
    Write-Host @"
AI Marketing Web Builder - Pre-commit Validation Script

USAGE:
    .\pre-commit-validation.ps1 [OPTIONS]

OPTIONS:
    -CommitMessageFile <file>  Path to commit message file for validation
    -SkipWarnings              Don't prompt for warnings, auto-continue
    -Help                      Show this help message

DESCRIPTION:
    Comprehensive pre-commit validation including:
    - File size checks
    - Sensitive file detection
    - Secret scanning
    - Code quality checks
    - Line length validation
    - JSON validation
    - Branch protection compliance
    - Frontend/backend specific checks

EXAMPLES:
    .\pre-commit-validation.ps1
    .\pre-commit-validation.ps1 -CommitMessageFile .git\COMMIT_EDITMSG
    .\pre-commit-validation.ps1 -SkipWarnings
"@
}

function Test-Command {
    param($CommandName)
    return Get-Command $CommandName -ErrorAction SilentlyContinue
}

function Test-FileSizes {
    Write-Info "Checking file sizes..."
    
    $stagedFiles = git diff --cached --name-only
    $largeFiles = @()
    
    foreach ($file in $stagedFiles) {
        if (Test-Path $file) {
            $sizeBytes = (Get-Item $file).Length
            $sizeMB = [math]::Round($sizeBytes / 1MB, 2)
            
            if ($sizeMB -gt $MAX_FILE_SIZE_MB) {
                $largeFiles += "$file (${sizeMB}MB)"
            }
        }
    }
    
    if ($largeFiles.Count -gt 0) {
        Write-Warning "Large files detected (>$MAX_FILE_SIZE_MB MB):"
        foreach ($file in $largeFiles) {
            Write-Warning "  - $file"
        }
    } else {
        Write-Success "File size check passed"
    }
}

function Test-SensitiveFiles {
    Write-Info "Checking for sensitive files..."
    
    $sensitivePatterns = @(
        "*.key", "*.pem", "*.p12", "*.pfx", "*.crt", "*.cert",
        "id_rsa", "id_dsa", "*.env", "secrets.*", "*.secret",
        "config/database.yml", "config/secrets.yml"
    )
    
    $stagedFiles = git diff --cached --name-only
    $sensitiveFiles = @()
    
    foreach ($pattern in $sensitivePatterns) {
        $matches = $stagedFiles | Where-Object { $_ -like $pattern }
        $sensitiveFiles += $matches
    }
    
    if ($sensitiveFiles.Count -gt 0) {
        Write-Error "Potentially sensitive files detected:"
        foreach ($file in $sensitiveFiles) {
            Write-Error "  - $file"
        }
        Write-Error "Please remove sensitive files or add them to .gitignore"
    } else {
        Write-Success "Sensitive file check passed"
    }
}

function Test-SecretsInContent {
    Write-Info "Scanning for secrets in code..."
    
    $secretPatterns = @(
        "password\s*=\s*['\`"][^'\`"]+['\`"]",
        "api[_-]?key\s*=\s*['\`"][^'\`"]+['\`"]",
        "secret[_-]?key\s*=\s*['\`"][^'\`"]+['\`"]",
        "access[_-]?token\s*=\s*['\`"][^'\`"]+['\`"]",
        "private[_-]?key\s*=\s*['\`"][^'\`"]+['\`"]",
        "['\`"]ghp_[a-zA-Z0-9]{36}['\`"]",  # GitHub personal access tokens
        "['\`"]sk-[a-zA-Z0-9]{48}['\`"]",   # OpenAI API keys
        "['\`"]xoxb-[a-zA-Z0-9-]+['\`"]"    # Slack bot tokens
    )
    
    $secretsFound = $false
    $diffContent = git diff --cached
    
    foreach ($pattern in $secretPatterns) {
        $matches = $diffContent | Select-String -Pattern $pattern -AllMatches
        if ($matches) {
            $secretsFound = $true
            foreach ($match in $matches) {
                Write-Error "Potential secret found: $($match.Line.Trim())"
            }
        }
    }
    
    if (-not $secretsFound) {
        Write-Success "Secret scanning passed"
    }
}

function Test-CommitMessage {
    param($MessageFile)
    
    if (-not $MessageFile -or -not (Test-Path $MessageFile)) {
        return
    }
    
    Write-Info "Validating commit message format..."
    
    $commitMsg = Get-Content $MessageFile -Raw | Out-String
    $commitMsg = $commitMsg.Trim()
    
    # Conventional commit pattern
    $conventionalPattern = "^(feat|fix|docs|style|refactor|perf|test|build|ci|chore)(\(.+\))?!?: .+"
    
    if ($commitMsg -notmatch $conventionalPattern) {
        Write-Warning "Commit message doesn't follow conventional commit format"
        Write-Warning "Expected format: type(scope): description"
        Write-Warning "Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore"
        Write-Warning "Current message: $commitMsg"
    } else {
        Write-Success "Commit message format is valid"
    }
}

function Test-LineLengths {
    Write-Info "Checking line lengths..."
    
    $stagedFiles = git diff --cached --name-only
    $codeFiles = $stagedFiles | Where-Object { $_ -match "\.(js|ts|jsx|tsx|py|sh|bash|ps1)$" }
    $longLines = @()
    
    foreach ($file in $codeFiles) {
        if (Test-Path $file) {
            $lines = Get-Content $file
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i].Length -gt $MAX_LINE_LENGTH) {
                    $longLines += "$file`:$($i+1): $($lines[$i].Substring(0, [Math]::Min(100, $lines[$i].Length)))..."
                    if ($longLines.Count -ge 5) { break }  # Limit output
                }
            }
        }
    }
    
    if ($longLines.Count -gt 0) {
        Write-Warning "Lines longer than $MAX_LINE_LENGTH characters found:"
        foreach ($line in $longLines) {
            Write-Warning "  - $line"
        }
    } else {
        Write-Success "Line length check passed"
    }
}

function Test-Frontend {
    $packageJsonPath = Join-Path $PROJECT_ROOT "web-builder\package.json"
    if (-not (Test-Path $packageJsonPath)) {
        return
    }
    
    Write-Info "Running frontend checks..."
    
    Push-Location (Join-Path $PROJECT_ROOT "web-builder")
    
    try {
        # Check for lockfile consistency
        $hasPackageLock = Test-Path "package-lock.json"
        $hasPnpmLock = Test-Path "pnpm-lock.yaml"
        
        if ($hasPackageLock -and $hasPnpmLock) {
            Write-Warning "Both package-lock.json and pnpm-lock.yaml found"
            Write-Warning "Consider using only one package manager"
        }
        
        # Check if pnpm is preferred but not installed
        if ($hasPnpmLock -and -not (Test-Command pnpm)) {
            Write-Error "pnpm-lock.yaml found but pnpm is not installed"
            Write-Error "Install pnpm: npm install -g pnpm"
        }
        
        # Run type checking if TypeScript is configured
        if (Test-Path "tsconfig.json") {
            $packageManager = if (Test-Command pnpm) { "pnpm" } elseif (Test-Command npm) { "npm" } else { $null }
            
            if ($packageManager) {
                Write-Info "Running TypeScript type check..."
                try {
                    & $packageManager run type-check 2>$null
                    Write-Success "TypeScript type check passed"
                } catch {
                    Write-Warning "TypeScript type check failed or type-check script not found"
                }
            }
        }
        
        # Run linting if configured
        $packageManager = if (Test-Command pnpm) { "pnpm" } elseif (Test-Command npm) { "npm" } else { $null }
        
        if ($packageManager) {
            try {
                & $packageManager run lint 2>$null
                Write-Success "Linting passed"
            } catch {
                Write-Warning "Linting failed or lint script not found"
            }
        }
        
        # Check for outdated dependencies (informational)
        if (Test-Command pnpm) {
            Write-Info "Checking for outdated dependencies..."
            try {
                $outdated = & pnpm outdated --format=table 2>$null
                if ($outdated -and $outdated.Count -gt 1) {
                    Write-Warning "$($outdated.Count - 1) outdated dependencies found"
                    Write-Warning "Run 'pnpm outdated' to see details"
                }
            } catch {
                # Ignore errors in outdated check
            }
        }
    }
    finally {
        Pop-Location
    }
}

function Test-Backend {
    $requirementsPath = Join-Path $PROJECT_ROOT "backend\requirements.txt"
    if (-not (Test-Path $requirementsPath)) {
        return
    }
    
    Write-Info "Running backend checks..."
    
    Push-Location (Join-Path $PROJECT_ROOT "backend")
    
    try {
        # Check if virtual environment is activated
        if (-not $env:VIRTUAL_ENV) {
            Write-Warning "Virtual environment not activated"
            Write-Warning "Activate with: venv\Scripts\activate (Windows) or source venv/bin/activate (Unix)"
        }
        
        # Check Python version if python is available
        if (Test-Command python) {
            $pythonVersion = python --version 2>&1
            Write-Info "Python version: $pythonVersion"
            
            # Check if requirements are satisfied
            if (Test-Command pip) {
                Write-Info "Checking Python requirements..."
                try {
                    pip check 2>$null
                    Write-Success "Python requirements check passed"
                } catch {
                    Write-Warning "Python requirements check failed"
                    Write-Warning "Run 'pip check' for details"
                }
            }
        }
        
        # Run flake8 if available
        if (Test-Command flake8) {
            Write-Info "Running flake8 linting..."
            try {
                flake8 . --max-line-length=120 --exclude=venv,migrations 2>$null
                Write-Success "Flake8 linting passed"
            } catch {
                Write-Warning "Flake8 linting found issues"
            }
        }
        
        # Run mypy if available
        if (Test-Command mypy) {
            Write-Info "Running mypy type checking..."
            try {
                mypy . --ignore-missing-imports 2>$null
                Write-Success "MyPy type checking passed"
            } catch {
                Write-Warning "MyPy type checking found issues"
            }
        }
    }
    finally {
        Pop-Location
    }
}

function Test-GitHooks {
    Write-Info "Checking git hooks setup..."
    
    $hooksDir = Join-Path $PROJECT_ROOT ".git\hooks"
    $preCommitHook = Join-Path $hooksDir "pre-commit"
    
    if (Test-Path $preCommitHook) {
        Write-Success "Pre-commit hook is configured"
    } else {
        Write-Warning "Pre-commit hook not found"
        Write-Warning "Consider setting up pre-commit hooks for automated validation"
    }
}

function Test-TodoComments {
    Write-Info "Checking for TODO/FIXME comments..."
    
    $todoPatterns = @("TODO", "FIXME", "HACK", "XXX")
    $todoFound = $false
    $diffContent = git diff --cached
    
    foreach ($pattern in $todoPatterns) {
        $matches = $diffContent | Select-String -Pattern $pattern
        if ($matches) {
            $todoFound = $true
            foreach ($match in $matches) {
                Write-Warning "Found $pattern`: $($match.Line.Trim())"
            }
        }
    }
    
    if (-not $todoFound) {
        Write-Success "No TODO/FIXME comments in staged changes"
    }
}

function Test-JsonFiles {
    Write-Info "Validating JSON files..."
    
    $stagedFiles = git diff --cached --name-only
    $jsonFiles = $stagedFiles | Where-Object { $_ -match "\.json$" }
    $jsonErrors = $false
    
    foreach ($file in $jsonFiles) {
        if (Test-Path $file) {
            try {
                Get-Content $file | ConvertFrom-Json | Out-Null
            } catch {
                Write-Error "Invalid JSON format in $file`: $($_.Exception.Message)"
                $jsonErrors = $true
            }
        }
    }
    
    if (-not $jsonErrors -and $jsonFiles.Count -gt 0) {
        Write-Success "JSON validation passed for $($jsonFiles.Count) files"
    } elseif ($jsonFiles.Count -eq 0) {
        Write-Success "No JSON files to validate"
    }
}

function Test-BranchProtection {
    Write-Info "Checking branch protection compliance..."
    
    $currentBranch = git branch --show-current
    
    # Check if trying to commit directly to main/master
    if ($currentBranch -eq "main" -or $currentBranch -eq "master") {
        Write-Error "Direct commits to $currentBranch are not allowed"
        Write-Error "Create a feature branch and submit a pull request"
    } else {
        Write-Success "Branch protection compliance check passed"
    }
}

function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    Write-Info "🔒 AI Marketing Web Builder - Pre-commit Validation"
    Write-Info "=================================================="
    
    # Check if there are staged changes
    $stagedChanges = git diff --cached --name-only
    if (-not $stagedChanges) {
        Write-Error "No staged changes found!"
        exit 1
    }
    
    # Run all checks
    Test-FileSizes
    Test-SensitiveFiles
    Test-SecretsInContent
    Test-LineLengths
    Test-TodoComments
    Test-JsonFiles
    Test-BranchProtection
    Test-Frontend
    Test-Backend
    Test-GitHooks
    
    # Validate commit message if provided
    if ($CommitMessageFile) {
        Test-CommitMessage $CommitMessageFile
    }
    
    # Summary
    Write-Info "=================================================="
    Write-Info "Pre-commit validation summary:"
    
    if ($script:Errors -gt 0) {
        Write-Error "❌ $($script:Errors) error(s) found"
        Write-Error "Please fix the errors before committing"
        exit 1
    } elseif ($script:Warnings -gt 0) {
        Write-Warning "⚠️  $($script:Warnings) warning(s) found"
        Write-Warning "Consider addressing the warnings"
        
        # Allow commit with warnings but ask for confirmation
        if (-not $SkipWarnings) {
            $continue = Read-Host "Continue with commit despite warnings? (y/N)"
            if ($continue -notmatch "^[Yy]$") {
                Write-Info "Commit aborted by user"
                exit 1
            }
        }
    } else {
        Write-Success "✅ All checks passed!"
    }
    
    Write-Success "Pre-commit validation completed successfully"
}

# Execute main function
Main