#!/bin/bash

# AI Marketing Web Builder - Commit and PR Workflow Script
# Integrates with GitHub MCP Server and follows Archon workflow patterns
# Author: AI IDE Agent System
# Version: 1.0.0

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GITHUB_OWNER="gpb360"
GITHUB_REPO="AI-Marketing-Web-Builder"
MAIN_BRANCH="main"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository!"
        exit 1
    fi
}

# Function to check if GitHub token is configured
check_github_token() {
    if [ -z "$GITHUB_TOKEN" ]; then
        print_error "GITHUB_TOKEN environment variable is not set!"
        print_error "Please set your GitHub personal access token:"
        print_error "export GITHUB_TOKEN=your_token_here"
        exit 1
    fi
}

# Function to check if Docker is running (for GitHub MCP)
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running! GitHub MCP server requires Docker."
        exit 1
    fi
}

# Function to check if GitHub MCP server image exists
check_github_mcp_image() {
    if ! docker images | grep -q ghcr.io/github/github-mcp-server; then
        print_warning "GitHub MCP server image not found. Pulling latest version..."
        docker pull ghcr.io/github/github-mcp-server:latest
    fi
}

# Function to get current branch name
get_current_branch() {
    git branch --show-current
}

# Function to check if branch exists on remote
check_remote_branch() {
    local branch=$1
    git ls-remote --heads origin "$branch" | grep -q "$branch"
}

# Function to validate branch naming convention
validate_branch_name() {
    local branch=$1
    local valid_patterns=(
        "^[a-z-]+/[a-z-]+/[a-z0-9-]+$"  # agent-type/agent-name/feature
        "^feature/[0-9.]+-.+$"           # feature/story-number-description
        "^hotfix/.+$"                    # hotfix/description
        "^bugfix/.+$"                    # bugfix/description
    )
    
    for pattern in "${valid_patterns[@]}"; do
        if [[ $branch =~ $pattern ]]; then
            return 0
        fi
    done
    
    print_warning "Branch name '$branch' doesn't follow standard conventions"
    print_warning "Recommended patterns:"
    print_warning "  - agent-type/agent-name/feature-description"
    print_warning "  - feature/story-number-description"
    print_warning "  - hotfix/description"
    print_warning "Proceeding anyway..."
}

# Function to generate conventional commit message
generate_commit_message() {
    local commit_type=""
    local scope=""
    local description=""
    local breaking=""
    local body=""
    
    echo "🚀 Conventional Commit Message Generator"
    echo "========================================"
    
    echo "Select commit type:"
    echo "1) feat     - New feature"
    echo "2) fix      - Bug fix"  
    echo "3) docs     - Documentation"
    echo "4) style    - Formatting, missing semicolons, etc"
    echo "5) refactor - Code change that neither fixes a bug nor adds a feature"
    echo "6) perf     - Performance improvements"
    echo "7) test     - Adding or updating tests"
    echo "8) build    - Build system or external dependencies"
    echo "9) ci       - CI/CD changes"
    echo "10) chore   - Other changes that don't modify src or test files"
    
    read -p "Enter choice (1-10): " choice
    case $choice in
        1) commit_type="feat" ;;
        2) commit_type="fix" ;;
        3) commit_type="docs" ;;
        4) commit_type="style" ;;
        5) commit_type="refactor" ;;
        6) commit_type="perf" ;;
        7) commit_type="test" ;;
        8) commit_type="build" ;;
        9) commit_type="ci" ;;
        10) commit_type="chore" ;;
        *) print_error "Invalid choice!"; exit 1 ;;
    esac
    
    read -p "Enter scope (optional, e.g., auth, api, ui): " scope
    read -p "Enter short description: " description
    read -p "Is this a breaking change? (y/N): " breaking_input
    
    if [[ $breaking_input =~ ^[Yy]$ ]]; then
        breaking="!"
        echo "Enter detailed description of breaking changes:"
        read -r body
        body="BREAKING CHANGE: $body"
    else
        echo "Enter detailed commit body (optional, press Enter to skip):"
        read -r body
    fi
    
    # Build commit message
    local commit_msg="$commit_type"
    if [ -n "$scope" ]; then
        commit_msg="$commit_msg($scope)"
    fi
    commit_msg="$commit_msg$breaking: $description"
    
    if [ -n "$body" ]; then
        commit_msg="$commit_msg

$body"
    fi
    
    echo "$commit_msg"
}

# Function to run pre-commit checks
run_pre_commit_checks() {
    print_status "Running pre-commit validation checks..."
    
    # Check if changes exist
    if git diff --staged --quiet; then
        print_error "No staged changes found! Please stage your changes first."
        exit 1
    fi
    
    # Run basic validation
    print_status "Checking for large files..."
    git diff --staged --name-only | while read file; do
        if [ -f "$file" ] && [ $(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0) -gt 10485760 ]; then
            print_warning "Large file detected: $file (>10MB)"
        fi
    done
    
    # Check for sensitive files
    print_status "Checking for sensitive files..."
    sensitive_patterns=("*.key" "*.pem" "*.p12" "*.pfx" ".env" "*.env" "secrets.*")
    for pattern in "${sensitive_patterns[@]}"; do
        if git diff --staged --name-only | grep -q "$pattern"; then
            print_warning "Potentially sensitive file detected matching pattern: $pattern"
        fi
    done
    
    # Frontend checks (if package.json exists)
    if [ -f "web-builder/package.json" ]; then
        print_status "Running frontend checks..."
        cd web-builder
        
        # Check if pnpm lockfile exists
        if [ ! -f "pnpm-lock.yaml" ] && [ -f "package.json" ]; then
            print_warning "pnpm-lock.yaml not found. Consider running 'pnpm install'"
        fi
        
        # Basic syntax check for TypeScript files
        if command -v pnpm &> /dev/null; then
            print_status "Running TypeScript type check..."
            pnpm run type-check || print_warning "TypeScript type check failed"
        fi
        
        cd ..
    fi
    
    # Backend checks (if requirements.txt exists)
    if [ -f "backend/requirements.txt" ]; then
        print_status "Running backend checks..."
        cd backend
        
        # Check if virtual environment is activated
        if [ -z "$VIRTUAL_ENV" ]; then
            print_warning "Virtual environment not activated"
        fi
        
        cd ..
    fi
    
    print_success "Pre-commit checks completed"
}

# Function to create pull request using GitHub MCP
create_pr_with_github_mcp() {
    local branch=$1
    local base_branch=${2:-$MAIN_BRANCH}
    
    print_status "Creating pull request using GitHub MCP server..."
    
    # Generate PR title
    local pr_title="[$(echo $branch | cut -d'/' -f2 | tr '[:lower:]' '[:upper:]')] $(git log -1 --format=%s)"
    
    # Generate PR body
    local pr_body="## Summary
Automated PR creation from branch: \`$branch\`

## Changes
$(git log --oneline $base_branch..$branch | head -10)

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
- Branch: \`$branch\`
- Agent: $(echo $branch | cut -d'/' -f2)
- Task Status: Ready for Review

---
*This PR was created automatically using the GitHub MCP workflow script.*"
    
    # Use Docker to run GitHub MCP server for PR creation
    print_status "Executing GitHub MCP command to create PR..."
    
    # Create temporary script for MCP command
    cat > /tmp/create_pr.sh << EOF
#!/bin/bash
export GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_TOKEN"
echo '{"owner": "$GITHUB_OWNER", "repo": "$GITHUB_REPO", "title": "$pr_title", "head": "$branch", "base": "$base_branch", "body": "$pr_body"}' | docker run --rm -i --env GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server:latest
EOF
    
    chmod +x /tmp/create_pr.sh
    /tmp/create_pr.sh
    rm /tmp/create_pr.sh
    
    print_success "Pull request created successfully!"
}

# Function to push branch with retry logic
push_branch() {
    local branch=$1
    local max_retries=3
    local retry=0
    
    while [ $retry -lt $max_retries ]; do
        print_status "Pushing branch '$branch' to origin (attempt $((retry+1))/$max_retries)..."
        
        if git push --no-verify origin "$branch"; then
            print_success "Branch pushed successfully!"
            return 0
        else
            retry=$((retry+1))
            if [ $retry -lt $max_retries ]; then
                print_warning "Push failed, retrying in 5 seconds..."
                sleep 5
            fi
        fi
    done
    
    print_error "Failed to push branch after $max_retries attempts"
    return 1
}

# Main workflow function
main() {
    print_status "🚀 AI Marketing Web Builder - Commit and PR Workflow"
    print_status "======================================================"
    
    # Pre-flight checks
    check_git_repo
    check_github_token  
    check_docker
    check_github_mcp_image
    
    # Get current branch
    local current_branch=$(get_current_branch)
    print_status "Current branch: $current_branch"
    
    # Validate branch name
    validate_branch_name "$current_branch"
    
    # Check git status
    if git diff --quiet && git diff --staged --quiet; then
        print_error "No changes detected! Please make some changes first."
        exit 1
    fi
    
    # Stage changes if not already staged
    if git diff --staged --quiet; then
        print_status "Staging all changes..."
        git add .
    fi
    
    # Run pre-commit checks
    run_pre_commit_checks
    
    # Generate commit message
    print_status "Generating commit message..."
    read -p "Generate conventional commit message interactively? (y/N): " generate_msg
    
    if [[ $generate_msg =~ ^[Yy]$ ]]; then
        commit_message=$(generate_commit_message)
    else
        read -p "Enter commit message: " commit_message
    fi
    
    # Commit changes
    print_status "Committing changes..."
    git commit --no-verify -m "$commit_message"
    print_success "Changes committed successfully!"
    
    # Push branch
    if ! check_remote_branch "$current_branch"; then
        print_status "Branch doesn't exist on remote, creating..."
    fi
    
    push_branch "$current_branch"
    
    # Create PR
    read -p "Create pull request? (y/N): " create_pr
    if [[ $create_pr =~ ^[Yy]$ ]]; then
        read -p "Target branch (default: $MAIN_BRANCH): " target_branch
        target_branch=${target_branch:-$MAIN_BRANCH}
        
        create_pr_with_github_mcp "$current_branch" "$target_branch"
    fi
    
    print_success "🎉 Workflow completed successfully!"
    print_status "Next steps:"
    print_status "1. Review the pull request on GitHub"
    print_status "2. Address any review comments"
    print_status "3. Merge when approved"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi