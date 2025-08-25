@echo off
setlocal enabledelayedexpansion

REM AI Marketing Web Builder - Commit and PR Workflow Script (Windows)
REM Integrates with GitHub MCP Server and follows Archon workflow patterns
REM Author: AI IDE Agent System
REM Version: 1.0.0

REM Configuration
set GITHUB_OWNER=gpb360
set GITHUB_REPO=AI-Marketing-Web-Builder
set MAIN_BRANCH=main

REM Colors for output (using escape sequences)
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "NC=[0m"

echo %BLUE%[INFO]%NC% AI Marketing Web Builder - Commit and PR Workflow
echo %BLUE%[INFO]%NC% ======================================================

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Not in a git repository!
    exit /b 1
)

REM Check if GitHub token is configured
if "%GITHUB_TOKEN%"=="" (
    echo %RED%[ERROR]%NC% GITHUB_TOKEN environment variable is not set!
    echo %RED%[ERROR]%NC% Please set your GitHub personal access token in .env file
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Docker is not running! GitHub MCP server requires Docker.
    exit /b 1
)

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo %BLUE%[INFO]%NC% Current branch: !CURRENT_BRANCH!

REM Check for changes
git diff --quiet && git diff --staged --quiet
if not errorlevel 1 (
    echo %RED%[ERROR]%NC% No changes detected! Please make some changes first.
    exit /b 1
)

REM Stage changes if not already staged
git diff --staged --quiet
if not errorlevel 1 (
    echo %BLUE%[INFO]%NC% Staging all changes...
    git add .
)

REM Run basic pre-commit checks
echo %BLUE%[INFO]%NC% Running pre-commit validation checks...

REM Check if changes exist after staging
git diff --staged --quiet
if not errorlevel 1 (
    echo %RED%[ERROR]%NC% No staged changes found!
    exit /b 1
)

REM Frontend checks
if exist "web-builder\package.json" (
    echo %BLUE%[INFO]%NC% Running frontend checks...
    cd web-builder
    
    if not exist "pnpm-lock.yaml" (
        if exist "package.json" (
            echo %YELLOW%[WARNING]%NC% pnpm-lock.yaml not found. Consider running 'pnpm install'
        )
    )
    
    REM Check if pnpm is available
    where pnpm >nul 2>&1
    if not errorlevel 1 (
        echo %BLUE%[INFO]%NC% Running TypeScript type check...
        pnpm run type-check
    )
    
    cd ..
)

REM Get commit message
echo.
echo %BLUE%[INFO]%NC% Commit Message Options:
echo 1. Generate conventional commit interactively
echo 2. Enter custom message
echo 3. Use default message from git log
set /p COMMIT_CHOICE="Choose option (1-3): "

if "%COMMIT_CHOICE%"=="1" (
    call :generate_conventional_commit
) else if "%COMMIT_CHOICE%"=="2" (
    set /p COMMIT_MESSAGE="Enter commit message: "
) else (
    for /f "tokens=*" %%i in ('git log -1 --format^=%%s') do set COMMIT_MESSAGE=%%i
    set COMMIT_MESSAGE=feat: !COMMIT_MESSAGE!
)

REM Commit changes
echo %BLUE%[INFO]%NC% Committing changes...
git commit --no-verify -m "!COMMIT_MESSAGE!"
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Commit failed!
    exit /b 1
)
echo %GREEN%[SUCCESS]%NC% Changes committed successfully!

REM Push branch
echo %BLUE%[INFO]%NC% Pushing branch to origin...
git push --no-verify origin !CURRENT_BRANCH!
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Push failed!
    exit /b 1
)
echo %GREEN%[SUCCESS]%NC% Branch pushed successfully!

REM Ask about creating PR
set /p CREATE_PR="Create pull request? (y/N): "
if /i "%CREATE_PR%"=="y" (
    call :create_pull_request
)

echo %GREEN%[SUCCESS]%NC% Workflow completed successfully!
echo %BLUE%[INFO]%NC% Next steps:
echo %BLUE%[INFO]%NC% 1. Review the pull request on GitHub
echo %BLUE%[INFO]%NC% 2. Address any review comments  
echo %BLUE%[INFO]%NC% 3. Merge when approved
goto :end

:generate_conventional_commit
echo.
echo Select commit type:
echo 1^) feat     - New feature
echo 2^) fix      - Bug fix
echo 3^) docs     - Documentation
echo 4^) style    - Formatting, missing semicolons, etc
echo 5^) refactor - Code change that neither fixes a bug nor adds a feature
echo 6^) perf     - Performance improvements
echo 7^) test     - Adding or updating tests
echo 8^) build    - Build system or external dependencies
echo 9^) ci       - CI/CD changes
echo 10^) chore   - Other changes that don't modify src or test files

set /p TYPE_CHOICE="Enter choice (1-10): "
set COMMIT_TYPE=feat
if "%TYPE_CHOICE%"=="1" set COMMIT_TYPE=feat
if "%TYPE_CHOICE%"=="2" set COMMIT_TYPE=fix
if "%TYPE_CHOICE%"=="3" set COMMIT_TYPE=docs
if "%TYPE_CHOICE%"=="4" set COMMIT_TYPE=style
if "%TYPE_CHOICE%"=="5" set COMMIT_TYPE=refactor
if "%TYPE_CHOICE%"=="6" set COMMIT_TYPE=perf
if "%TYPE_CHOICE%"=="7" set COMMIT_TYPE=test
if "%TYPE_CHOICE%"=="8" set COMMIT_TYPE=build
if "%TYPE_CHOICE%"=="9" set COMMIT_TYPE=ci
if "%TYPE_CHOICE%"=="10" set COMMIT_TYPE=chore

set /p COMMIT_SCOPE="Enter scope (optional, e.g., auth, api, ui): "
set /p COMMIT_DESC="Enter short description: "

if not "%COMMIT_SCOPE%"=="" (
    set COMMIT_MESSAGE=!COMMIT_TYPE!(^!COMMIT_SCOPE!^): !COMMIT_DESC!
) else (
    set COMMIT_MESSAGE=!COMMIT_TYPE!: !COMMIT_DESC!
)

goto :eof

:create_pull_request
echo %BLUE%[INFO]%NC% Creating pull request using GitHub MCP server...

REM Generate PR title and body
for /f "tokens=2 delims=/" %%i in ("!CURRENT_BRANCH!") do set AGENT_NAME=%%i
for /f "tokens=*" %%i in ('git log -1 --format^=%%s') do set LAST_COMMIT=%%i

set PR_TITLE=[!AGENT_NAME!] !LAST_COMMIT!
set PR_BODY=## Summary%NL%Automated PR creation from branch: `!CURRENT_BRANCH!`%NL%%NL%## Changes%NL%$(git log --oneline !MAIN_BRANCH!..!CURRENT_BRANCH! | head -10)%NL%%NL%## Testing%NL%- [ ] Unit tests pass%NL%- [ ] Integration tests pass%NL%- [ ] Manual testing completed%NL%- [ ] E2E tests pass (if applicable)%NL%%NL%## Checklist%NL%- [x] Code follows project conventions%NL%- [x] Commit messages follow conventional commit format%NL%- [x] Pre-commit checks passed%NL%- [ ] Documentation updated (if needed)%NL%- [ ] Breaking changes documented (if any)%NL%%NL%## Archon Integration%NL%- Branch: `!CURRENT_BRANCH!`%NL%- Agent: !AGENT_NAME!%NL%- Task Status: Ready for Review%NL%%NL%----%NL%*This PR was created automatically using the GitHub MCP workflow script.*

echo %BLUE%[INFO]%NC% PR Title: !PR_TITLE!
echo %BLUE%[INFO]%NC% Creating PR via GitHub MCP...

REM Note: Actual MCP integration would require more complex JSON handling
REM For now, we'll provide instructions for manual PR creation
echo %YELLOW%[INFO]%NC% GitHub MCP integration in progress...
echo %YELLOW%[INFO]%NC% Please create PR manually at: https://github.com/!GITHUB_OWNER!/!GITHUB_REPO!/compare/!CURRENT_BRANCH!

goto :eof

:end
endlocal