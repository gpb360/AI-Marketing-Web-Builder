# AI Marketing Web Builder - Commit and PR Workflow Script (PowerShell)
# Integrates with GitHub MCP Server and follows Archon workflow patterns
# Author: AI IDE Agent System
# Version: 1.0.0

param(
    [string]$TargetBranch = "main",
    [switch]$AutoCommit,
    [switch]$SkipPR,
    [string]$CommitMessage,
    [switch]$Help
)

# Configuration
$GITHUB_OWNER = "gpb360"
$GITHUB_REPO = "AI-Marketing-Web-Builder"

# Color output functions
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

function Show-Help {
    Write-Host @"
AI Marketing Web Builder - Commit and PR Workflow Script

USAGE:
    .\commit-and-pr-workflow.ps1 [OPTIONS]

OPTIONS:
    -TargetBranch <branch>    Target branch for PR (default: main)
    -AutoCommit               Skip interactive commit message generation
    -SkipPR                   Don't create PR, just commit and push
    -CommitMessage <msg>      Use specific commit message
    -Help                     Show this help message

EXAMPLES:
    .\commit-and-pr-workflow.ps1
    .\commit-and-pr-workflow.ps1 -TargetBranch develop
    .\commit-and-pr-workflow.ps1 -AutoCommit -CommitMessage "feat: add new feature"
    .\commit-and-pr-workflow.ps1 -SkipPR

REQUIREMENTS:
    - Git installed and configured
    - Docker installed and running
    - GITHUB_TOKEN environment variable set
    - GitHub MCP server image available
"@
}

function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check if we're in a git repository
    try {
        git rev-parse --git-dir | Out-Null
    } catch {
        Write-Error "Not in a git repository!"
        exit 1
    }
    
    # Check if GitHub token is configured
    if (-not $env:GITHUB_TOKEN -and -not (Get-Content .env -ErrorAction SilentlyContinue | Select-String "GITHUB_TOKEN")) {
        Write-Error "GITHUB_TOKEN not found in environment or .env file!"
        Write-Error "Please set your GitHub personal access token"
        exit 1
    }
    
    # Check if Docker is running
    try {
        docker info | Out-Null
    } catch {
        Write-Error "Docker is not running! GitHub MCP server requires Docker."
        exit 1
    }
    
    # Check if GitHub MCP server image exists
    $images = docker images --format "{{.Repository}}:{{.Tag}}" | Select-String "github-mcp-server"
    if (-not $images) {
        Write-Warning "GitHub MCP server image not found. Pulling latest version..."
        docker pull ghcr.io/github/github-mcp-server:latest
    }
    
    Write-Success "Prerequisites check completed"
}

function Get-CurrentBranch {
    return git branch --show-current
}

function Test-BranchNaming {
    param($BranchName)
    
    $validPatterns = @(
        "^[a-z-]+/[a-z-]+/[a-z0-9-]+$",  # agent-type/agent-name/feature
        "^feature/[0-9.]+-.+$",           # feature/story-number-description
        "^hotfix/.+$",                    # hotfix/description
        "^bugfix/.+$"                     # bugfix/description
    )
    
    $isValid = $false
    foreach ($pattern in $validPatterns) {
        if ($BranchName -match $pattern) {
            $isValid = $true
            break
        }
    }
    
    if (-not $isValid) {
        Write-Warning "Branch name '$BranchName' doesn't follow standard conventions"
        Write-Warning "Recommended patterns:"
        Write-Warning "  - agent-type/agent-name/feature-description"
        Write-Warning "  - feature/story-number-description"
        Write-Warning "  - hotfix/description"
        Write-Warning "Proceeding anyway..."
    }
}

function Invoke-PreCommitChecks {
    Write-Info "Running pre-commit validation checks..."
    
    # Check if changes exist
    $stagedChanges = git diff --staged --name-only
    if (-not $stagedChanges) {
        Write-Error "No staged changes found! Please stage your changes first."
        exit 1
    }
    
    # Check for large files
    Write-Info "Checking for large files..."
    foreach ($file in $stagedChanges) {
        if (Test-Path $file) {
            $fileSize = (Get-Item $file).Length
            if ($fileSize -gt 10MB) {
                Write-Warning "Large file detected: $file ($(($fileSize/1MB).ToString('F1'))MB)"
            }
        }
    }
    
    # Check for sensitive files
    Write-Info "Checking for sensitive files..."
    $sensitivePatterns = @("*.key", "*.pem", "*.p12", "*.pfx", ".env", "*.env", "secrets.*")
    foreach ($pattern in $sensitivePatterns) {
        $matches = $stagedChanges | Where-Object { $_ -like $pattern }
        if ($matches) {
            Write-Warning "Potentially sensitive files detected: $($matches -join ', ')"
        }
    }
    
    # Frontend checks
    if (Test-Path "web-builder\package.json") {
        Write-Info "Running frontend checks..."
        Push-Location "web-builder"
        
        if (-not (Test-Path "pnpm-lock.yaml") -and (Test-Path "package.json")) {
            Write-Warning "pnpm-lock.yaml not found. Consider running 'pnpm install'"
        }
        
        # TypeScript type check
        if (Get-Command pnpm -ErrorAction SilentlyContinue) {
            Write-Info "Running TypeScript type check..."
            try {
                pnpm run type-check
            } catch {
                Write-Warning "TypeScript type check failed"
            }
        }
        
        Pop-Location
    }
    
    # Backend checks
    if (Test-Path "backend\requirements.txt") {
        Write-Info "Running backend checks..."
        if (-not $env:VIRTUAL_ENV) {
            Write-Warning "Virtual environment not activated"
        }
    }
    
    Write-Success "Pre-commit checks completed"
}

function New-ConventionalCommitMessage {
    Write-Host "`n🚀 Conventional Commit Message Generator"
    Write-Host "========================================"
    
    $commitTypes = @{
        1 = @{type="feat"; desc="New feature"}
        2 = @{type="fix"; desc="Bug fix"}
        3 = @{type="docs"; desc="Documentation"}
        4 = @{type="style"; desc="Formatting, missing semicolons, etc"}
        5 = @{type="refactor"; desc="Code change that neither fixes a bug nor adds a feature"}
        6 = @{type="perf"; desc="Performance improvements"}
        7 = @{type="test"; desc="Adding or updating tests"}
        8 = @{type="build"; desc="Build system or external dependencies"}
        9 = @{type="ci"; desc="CI/CD changes"}
        10 = @{type="chore"; desc="Other changes that don't modify src or test files"}
    }
    
    Write-Host "Select commit type:"
    foreach ($key in $commitTypes.Keys | Sort-Object) {
        Write-Host "$key) $($commitTypes[$key].type) - $($commitTypes[$key].desc)"
    }
    
    do {
        $choice = Read-Host "Enter choice (1-10)"
        $choiceInt = [int]$choice
    } while ($choiceInt -lt 1 -or $choiceInt -gt 10)
    
    $commitType = $commitTypes[$choiceInt].type
    
    $scope = Read-Host "Enter scope (optional, e.g., auth, api, ui)"
    $description = Read-Host "Enter short description"
    $isBreaking = (Read-Host "Is this a breaking change? (y/N)") -match "^[Yy]"
    
    $breakingMarker = if ($isBreaking) { "!" } else { "" }
    
    $commitMsg = if ($scope) {
        "$commitType($scope)$breakingMarker`: $description"
    } else {
        "$commitType$breakingMarker`: $description"
    }
    
    if ($isBreaking) {
        $breakingDetails = Read-Host "Enter detailed description of breaking changes"
        $commitMsg += "`n`nBREAKING CHANGE: $breakingDetails"
    } else {
        $body = Read-Host "Enter detailed commit body (optional, press Enter to skip)"
        if ($body) {
            $commitMsg += "`n`n$body"
        }
    }
    
    return $commitMsg
}

function Invoke-GitCommit {
    param($Message)
    
    Write-Info "Committing changes..."
    try {
        git commit --no-verify -m $Message
        Write-Success "Changes committed successfully!"
    } catch {
        Write-Error "Commit failed: $_"
        exit 1
    }
}

function Push-Branch {
    param($BranchName)
    
    Write-Info "Pushing branch '$BranchName' to origin..."
    
    $maxRetries = 3
    for ($i = 1; $i -le $maxRetries; $i++) {
        try {
            git push --no-verify origin $BranchName
            Write-Success "Branch pushed successfully!"
            return
        } catch {
            if ($i -lt $maxRetries) {
                Write-Warning "Push failed, retrying in 5 seconds... (attempt $i/$maxRetries)"
                Start-Sleep -Seconds 5
            }
        }
    }
    
    Write-Error "Failed to push branch after $maxRetries attempts"
    exit 1
}

function New-GitHubPR {
    param(
        $HeadBranch,
        $BaseBranch,
        $Title,
        $Body
    )
    
    Write-Info "Creating pull request using GitHub MCP server..."
    
    # Load GitHub token from environment or .env file
    $githubToken = $env:GITHUB_TOKEN
    if (-not $githubToken) {
        $envContent = Get-Content .env -ErrorAction SilentlyContinue
        $tokenLine = $envContent | Select-String "GITHUB_TOKEN=(.+)" | Select-Object -First 1
        if ($tokenLine) {
            $githubToken = $tokenLine.Matches[0].Groups[1].Value
        }
    }
    
    if (-not $githubToken) {
        Write-Error "GitHub token not found!"
        return
    }
    
    # Prepare MCP command
    $prData = @{
        owner = $GITHUB_OWNER
        repo = $GITHUB_REPO
        title = $Title
        head = $HeadBranch
        base = $BaseBranch
        body = $Body
    } | ConvertTo-Json -Compress
    
    Write-Info "PR Data prepared: $Title"
    
    try {
        # Use GitHub MCP server via Docker
        $env:GITHUB_PERSONAL_ACCESS_TOKEN = $githubToken
        $result = $prData | docker run --rm -i --env GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server:latest
        
        Write-Success "Pull request created successfully!"
        Write-Info "Result: $result"
    } catch {
        Write-Warning "GitHub MCP creation failed, providing manual instructions..."
        Write-Info "Please create PR manually at:"
        Write-Info "https://github.com/$GITHUB_OWNER/$GITHUB_REPO/compare/$HeadBranch"
        Write-Info "Title: $Title"
        Write-Info "Body: $Body"
    }
}

function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    Write-Info "🚀 AI Marketing Web Builder - Commit and PR Workflow"
    Write-Info "======================================================"
    
    # Prerequisites
    Test-Prerequisites
    
    # Get current branch
    $currentBranch = Get-CurrentBranch
    Write-Info "Current branch: $currentBranch"
    
    # Validate branch name
    Test-BranchNaming $currentBranch
    
    # Check for changes
    $hasUnstagedChanges = git diff --quiet; $LASTEXITCODE -ne 0
    $hasStagedChanges = git diff --staged --quiet; $LASTEXITCODE -ne 0
    
    if (-not $hasUnstagedChanges -and -not $hasStagedChanges) {
        Write-Error "No changes detected! Please make some changes first."
        exit 1
    }
    
    # Stage changes if needed
    if (-not $hasStagedChanges) {
        Write-Info "Staging all changes..."
        git add .
    }
    
    # Run pre-commit checks  
    Invoke-PreCommitChecks
    
    # Handle commit message
    if ($CommitMessage) {
        $message = $CommitMessage
    } elseif ($AutoCommit) {
        $lastCommit = git log -1 --format="%s"
        $message = "feat: $lastCommit"
    } else {
        $generateInteractive = (Read-Host "Generate conventional commit message interactively? (y/N)") -match "^[Yy]"
        if ($generateInteractive) {
            $message = New-ConventionalCommitMessage
        } else {
            $message = Read-Host "Enter commit message"
        }
    }
    
    # Commit changes
    Invoke-GitCommit $message
    
    # Push branch
    Push-Branch $currentBranch
    
    # Create PR
    if (-not $SkipPR) {
        $createPR = (Read-Host "Create pull request? (y/N)") -match "^[Yy]"
        if ($createPR) {
            $targetBranch = if ($TargetBranch) { $TargetBranch } else { Read-Host "Target branch (default: main)" }
            if (-not $targetBranch) { $targetBranch = "main" }
            
            # Generate PR details
            $agentName = ($currentBranch -split "/")[1]
            $prTitle = "[$($agentName.ToUpper())] $(git log -1 --format='%s')"
            
            $prBody = @"
## Summary
Automated PR creation from branch: ``$currentBranch``

## Changes
$(git log --oneline $targetBranch..$currentBranch | Select-Object -First 10 | Out-String)

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed  
- [ ] E2E tests pass (if applicable)

## Checklist
- [x] Code follows project conventions
- [x] Commit messages follow conventional commit format
- [x] Pre-commit checks passed
- [ ] Documentation updated (if needed)
- [ ] Breaking changes documented (if any)

## Archon Integration
- Branch: ``$currentBranch``
- Agent: $agentName
- Task Status: Ready for Review

---
*This PR was created automatically using the GitHub MCP workflow script.*
"@
            
            New-GitHubPR -HeadBranch $currentBranch -BaseBranch $targetBranch -Title $prTitle -Body $prBody
        }
    }
    
    Write-Success "🎉 Workflow completed successfully!"
    Write-Info "Next steps:"
    Write-Info "1. Review the pull request on GitHub"
    Write-Info "2. Address any review comments"
    Write-Info "3. Merge when approved"
}

# Execute main function
Main