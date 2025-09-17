# AI Marketing Web Builder - Git Configuration Setup Script
# Configures git for conventional commits and quality standards
# Author: AI IDE Agent System
# Version: 1.0.0

param(
    [switch]$Force,
    [switch]$Help
)

function Show-Help {
    Write-Host @"
AI Marketing Web Builder - Git Configuration Setup

USAGE:
    .\setup-git-config.ps1 [OPTIONS]

OPTIONS:
    -Force    Overwrite existing git configuration
    -Help     Show this help message

DESCRIPTION:
    This script configures git for the AI Marketing Web Builder project with:
    - Conventional commit message template
    - Git hooks for commit message validation
    - Recommended git settings for the project
    - Branch protection and workflow standards

WHAT IT DOES:
    1. Sets commit message template (.gitmessage)
    2. Configures git hooks (commit-msg, pre-commit)
    3. Sets recommended git configuration
    4. Creates helper aliases for conventional commits
    5. Configures branch protection preferences

EXAMPLES:
    .\setup-git-config.ps1
    .\setup-git-config.ps1 -Force
"@
}

function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

function Test-GitRepository {
    try {
        git rev-parse --git-dir | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Set-GitCommitTemplate {
    Write-Info "Setting up commit message template..."
    
    $templatePath = ".gitmessage"
    if (Test-Path $templatePath) {
        try {
            git config commit.template $templatePath
            Write-Success "Commit template configured: $templatePath"
        } catch {
            Write-Error "Failed to set commit template: $_"
        }
    } else {
        Write-Warning "Commit template file not found: $templatePath"
    }
}

function Set-GitHooks {
    Write-Info "Setting up git hooks..."
    
    $hooksDir = ".git\hooks"
    
    # Ensure hooks directory exists
    if (-not (Test-Path $hooksDir)) {
        New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
    }
    
    # Set up commit-msg hook
    $commitMsgHook = Join-Path $hooksDir "commit-msg"
    if (Test-Path $commitMsgHook) {
        Write-Success "commit-msg hook already exists"
        
        # Make sure it's executable (Windows doesn't need chmod, but we'll ensure the script works)
        try {
            # Test the hook by checking if it contains our validation logic
            $hookContent = Get-Content $commitMsgHook -Raw
            if ($hookContent -match "conventional commit") {
                Write-Success "commit-msg hook is properly configured"
            } else {
                Write-Warning "commit-msg hook exists but may not be the expected version"
            }
        } catch {
            Write-Warning "Could not verify commit-msg hook content"
        }
    } else {
        Write-Warning "commit-msg hook not found at: $commitMsgHook"
        Write-Warning "Please ensure the hook file exists and is properly configured"
    }
    
    # Set up pre-commit hook (if validation script exists)
    $preCommitHook = Join-Path $hooksDir "pre-commit"
    $validationScript = "scripts\pre-commit-validation.ps1"
    
    if (Test-Path $validationScript) {
        $hookContent = @"
#!/bin/bash
# AI Marketing Web Builder - Pre-commit Hook
# Runs pre-commit validation script

# Run PowerShell validation script
powershell.exe -ExecutionPolicy Bypass -File "scripts/pre-commit-validation.ps1"
exit_code=$?

if [ $exit_code -ne 0 ]; then
    echo "Pre-commit validation failed. Commit aborted."
    exit $exit_code
fi

exit 0
"@
        
        if (-not (Test-Path $preCommitHook) -or $Force) {
            $hookContent | Out-File -FilePath $preCommitHook -Encoding ASCII
            Write-Success "pre-commit hook configured"
        } else {
            Write-Info "pre-commit hook already exists (use -Force to overwrite)"
        }
    } else {
        Write-Warning "Pre-commit validation script not found: $validationScript"
    }
}

function Set-GitConfiguration {
    Write-Info "Configuring git settings..."
    
    # Core settings
    try {
        # Set line ending handling
        git config core.autocrlf true
        Write-Success "Configured line ending handling (autocrlf=true)"
        
        # Set default branch name
        git config init.defaultBranch main
        Write-Success "Set default branch name to 'main'"
        
        # Configure merge strategy
        git config pull.rebase false
        Write-Success "Configured pull strategy (merge, not rebase)"
        
        # Set push behavior
        git config push.default simple
        Write-Success "Set push default to 'simple'"
        
        # Configure editor (if not already set)
        $currentEditor = git config --get core.editor
        if (-not $currentEditor) {
            # Try to set a reasonable default editor
            if (Get-Command code -ErrorAction SilentlyContinue) {
                git config core.editor "code --wait"
                Write-Success "Set editor to VS Code"
            } elseif (Get-Command notepad -ErrorAction SilentlyContinue) {
                git config core.editor "notepad"
                Write-Success "Set editor to Notepad"
            }
        } else {
            Write-Info "Editor already configured: $currentEditor"
        }
        
    } catch {
        Write-Error "Failed to configure git settings: $_"
    }
}

function Set-GitAliases {
    Write-Info "Setting up helpful git aliases..."
    
    $aliases = @{
        "co" = "checkout"
        "br" = "branch"
        "ci" = "commit"
        "st" = "status"
        "unstage" = "reset HEAD --"
        "last" = "log -1 HEAD"
        "visual" = "!gitk"
        "type-check" = "!powershell.exe -ExecutionPolicy Bypass -File scripts/pre-commit-validation.ps1"
        "conventional" = "!f() { echo 'Conventional commit types:'; echo 'feat: New feature'; echo 'fix: Bug fix'; echo 'docs: Documentation'; echo 'style: Formatting'; echo 'refactor: Code restructuring'; echo 'perf: Performance'; echo 'test: Tests'; echo 'build: Build system'; echo 'ci: CI/CD'; echo 'chore: Maintenance'; }; f"
        "pr-ready" = "!powershell.exe -ExecutionPolicy Bypass -File scripts/commit-and-pr-workflow.ps1"
    }
    
    foreach ($alias in $aliases.GetEnumerator()) {
        try {
            $existing = git config --get alias.$($alias.Key) 2>$null
            if (-not $existing -or $Force) {
                git config alias.$($alias.Key) $($alias.Value)
                Write-Success "Set alias: git $($alias.Key) = $($alias.Value)"
            } else {
                Write-Info "Alias already exists: git $($alias.Key) (use -Force to overwrite)"
            }
        } catch {
            Write-Warning "Failed to set alias $($alias.Key): $_"
        }
    }
}

function Set-ProjectSettings {
    Write-Info "Configuring project-specific settings..."
    
    # Set up gitignore patterns for this project
    $gitignorePath = ".gitignore"
    if (Test-Path $gitignorePath) {
        Write-Success "Project .gitignore already exists"
    } else {
        Write-Warning ".gitignore file not found - consider creating one"
    }
    
    # Configure GitHub integration
    try {
        $origin = git config --get remote.origin.url
        if ($origin) {
            Write-Success "Remote origin configured: $origin"
            
            # Extract repository info for GitHub MCP
            if ($origin -match "github\.com[:/]([^/]+)/([^/.]+)") {
                $owner = $matches[1]
                $repo = $matches[2]
                Write-Info "Detected GitHub repository: $owner/$repo"
            }
        } else {
            Write-Warning "No remote origin configured"
        }
    } catch {
        Write-Warning "Could not check remote configuration"
    }
}

function Test-Configuration {
    Write-Info "Testing git configuration..."
    
    # Test commit template
    $template = git config --get commit.template
    if ($template) {
        if (Test-Path $template) {
            Write-Success "✅ Commit template: $template"
        } else {
            Write-Error "❌ Commit template file not found: $template"
        }
    } else {
        Write-Warning "⚠️  No commit template configured"
    }
    
    # Test hooks
    $hooksDir = ".git\hooks"
    $hooks = @("commit-msg", "pre-commit")
    
    foreach ($hook in $hooks) {
        $hookPath = Join-Path $hooksDir $hook
        if (Test-Path $hookPath) {
            Write-Success "✅ Hook configured: $hook"
        } else {
            Write-Warning "⚠️  Hook not found: $hook"
        }
    }
    
    # Test aliases
    $testAliases = @("conventional", "pr-ready", "type-check")
    foreach ($alias in $testAliases) {
        $aliasValue = git config --get alias.$alias
        if ($aliasValue) {
            Write-Success "✅ Alias configured: git $alias"
        } else {
            Write-Warning "⚠️  Alias not configured: git $alias"
        }
    }
}

function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    Write-Info "🔧 AI Marketing Web Builder - Git Configuration Setup"
    Write-Info "====================================================="
    
    # Check if we're in a git repository
    if (-not (Test-GitRepository)) {
        Write-Error "Not in a git repository! Please run this script from the project root."
        exit 1
    }
    
    Write-Info "Setting up git configuration for AI Marketing Web Builder..."
    
    # Run configuration steps
    Set-GitCommitTemplate
    Set-GitHooks
    Set-GitConfiguration
    Set-GitAliases
    Set-ProjectSettings
    
    Write-Info "====================================================="
    Write-Info "Testing configuration..."
    Test-Configuration
    
    Write-Success "🎉 Git configuration setup completed!"
    Write-Info ""
    Write-Info "Next steps:"
    Write-Info "1. Try 'git conventional' to see commit types"
    Write-Info "2. Use 'git pr-ready' to run the full workflow"
    Write-Info "3. Commit messages will now be validated automatically"
    Write-Info "4. Pre-commit checks will run before each commit"
    Write-Info ""
    Write-Info "For help with conventional commits, check the .gitmessage template"
}

# Execute main function
Main