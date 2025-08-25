#!/bin/bash

# AI Marketing Web Builder - Pre-commit Validation Script
# Comprehensive quality checks before commits
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
MAX_FILE_SIZE_MB=10
MAX_LINE_LENGTH=120
PROJECT_ROOT=$(git rev-parse --show-toplevel)

# Counters
WARNINGS=0
ERRORS=0

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    ((WARNINGS++))
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((ERRORS++))
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check file sizes
check_file_sizes() {
    print_status "Checking file sizes..."
    
    local large_files=()
    while IFS= read -r -d '' file; do
        if [ -f "$file" ]; then
            local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
            local size_mb=$((size / 1024 / 1024))
            
            if [ $size_mb -gt $MAX_FILE_SIZE_MB ]; then
                large_files+=("$file (${size_mb}MB)")
            fi
        fi
    done < <(git diff --cached --name-only -z)
    
    if [ ${#large_files[@]} -gt 0 ]; then
        print_warning "Large files detected (>${MAX_FILE_SIZE_MB}MB):"
        for file in "${large_files[@]}"; do
            print_warning "  - $file"
        done
    else
        print_success "File size check passed"
    fi
}

# Function to check for sensitive files
check_sensitive_files() {
    print_status "Checking for sensitive files..."
    
    local sensitive_patterns=(
        "*.key"
        "*.pem" 
        "*.p12"
        "*.pfx"
        "*.crt"
        "*.cert"
        "id_rsa"
        "id_dsa"
        "*.env"
        "secrets.*"
        "*.secret"
        "config/database.yml"
        "config/secrets.yml"
    )
    
    local sensitive_files=()
    for pattern in "${sensitive_patterns[@]}"; do
        while IFS= read -r file; do
            if [ -n "$file" ]; then
                sensitive_files+=("$file")
            fi
        done < <(git diff --cached --name-only | grep -E "$(echo "$pattern" | sed 's/\*/.*/g')" || true)
    done
    
    if [ ${#sensitive_files[@]} -gt 0 ]; then
        print_error "Potentially sensitive files detected:"
        for file in "${sensitive_files[@]}"; do
            print_error "  - $file"
        done
        print_error "Please remove sensitive files or add them to .gitignore"
    else
        print_success "Sensitive file check passed"
    fi
}

# Function to check for secrets in content
check_secrets_in_content() {
    print_status "Scanning for secrets in code..."
    
    local secret_patterns=(
        "password\s*=\s*['\"][^'\"]+['\"]"
        "api[_-]?key\s*=\s*['\"][^'\"]+['\"]"
        "secret[_-]?key\s*=\s*['\"][^'\"]+['\"]"
        "access[_-]?token\s*=\s*['\"][^'\"]+['\"]"
        "private[_-]?key\s*=\s*['\"][^'\"]+['\"]"
        "['\"]ghp_[a-zA-Z0-9]{36}['\"]"  # GitHub personal access tokens
        "['\"]sk-[a-zA-Z0-9]{48}['\"]"   # OpenAI API keys
        "['\"]xoxb-[a-zA-Z0-9-]+['\"]"   # Slack bot tokens
    )
    
    local secrets_found=false
    for pattern in "${secret_patterns[@]}"; do
        while IFS= read -r line; do
            if [ -n "$line" ]; then
                secrets_found=true
                print_error "Potential secret found: $line"
            fi
        done < <(git diff --cached | grep -iE "$pattern" || true)
    done
    
    if [ "$secrets_found" = false ]; then
        print_success "Secret scanning passed"
    fi
}

# Function to validate commit message format
validate_commit_message() {
    print_status "Validating commit message format..."
    
    # Get the commit message from the temporary file
    local commit_msg_file="$1"
    if [ ! -f "$commit_msg_file" ]; then
        return 0  # Skip if no commit message file
    fi
    
    local commit_msg=$(cat "$commit_msg_file")
    
    # Conventional commit pattern
    local conventional_pattern="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore)(\(.+\))?!?: .+"
    
    if [[ ! $commit_msg =~ $conventional_pattern ]]; then
        print_warning "Commit message doesn't follow conventional commit format"
        print_warning "Expected format: type(scope): description"
        print_warning "Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore"
        print_warning "Current message: $commit_msg"
    else
        print_success "Commit message format is valid"
    fi
}

# Function to check line lengths
check_line_lengths() {
    print_status "Checking line lengths..."
    
    local long_lines=()
    while IFS= read -r file; do
        if [ -f "$file" ] && [[ "$file" =~ \.(js|ts|jsx|tsx|py|sh|bash)$ ]]; then
            while IFS= read -r line_info; do
                if [ -n "$line_info" ]; then
                    long_lines+=("$file: $line_info")
                fi
            done < <(awk "length > $MAX_LINE_LENGTH { print NR \":\" \$0 }" "$file" | head -5)
        fi
    done < <(git diff --cached --name-only)
    
    if [ ${#long_lines[@]} -gt 0 ]; then
        print_warning "Lines longer than $MAX_LINE_LENGTH characters found:"
        for line in "${long_lines[@]}"; do
            print_warning "  - $line"
        done
    else
        print_success "Line length check passed"
    fi
}

# Function to run frontend checks
run_frontend_checks() {
    if [ ! -f "$PROJECT_ROOT/web-builder/package.json" ]; then
        return 0
    fi
    
    print_status "Running frontend checks..."
    
    cd "$PROJECT_ROOT/web-builder"
    
    # Check for lockfile consistency
    if [ -f "package-lock.json" ] && [ -f "pnpm-lock.yaml" ]; then
        print_warning "Both package-lock.json and pnpm-lock.yaml found"
        print_warning "Consider using only one package manager"
    fi
    
    # Check if pnpm is preferred (based on pnpm-lock.yaml existence)
    if [ -f "pnpm-lock.yaml" ] && ! command_exists pnpm; then
        print_error "pnpm-lock.yaml found but pnpm is not installed"
        print_error "Install pnpm: npm install -g pnpm"
    fi
    
    # Run type checking if TypeScript is configured
    if [ -f "tsconfig.json" ]; then
        if command_exists pnpm; then
            print_status "Running TypeScript type check..."
            if ! pnpm run type-check 2>/dev/null; then
                print_warning "TypeScript type check failed or type-check script not found"
            else
                print_success "TypeScript type check passed"
            fi
        elif command_exists npm; then
            print_status "Running TypeScript type check..."
            if ! npm run type-check 2>/dev/null; then
                print_warning "TypeScript type check failed or type-check script not found"
            else
                print_success "TypeScript type check passed"
            fi
        fi
    fi
    
    # Run linting if configured  
    if command_exists pnpm; then
        if pnpm run lint 2>/dev/null; then
            print_success "Linting passed"
        else
            print_warning "Linting failed or lint script not found"
        fi
    elif command_exists npm; then
        if npm run lint 2>/dev/null; then
            print_success "Linting passed"
        else
            print_warning "Linting failed or lint script not found"
        fi
    fi
    
    # Check for outdated dependencies (informational)
    if command_exists pnpm; then
        print_status "Checking for outdated dependencies..."
        local outdated=$(pnpm outdated --format=table 2>/dev/null | wc -l)
        if [ "$outdated" -gt 1 ]; then
            print_warning "$((outdated-1)) outdated dependencies found"
            print_warning "Run 'pnpm outdated' to see details"
        fi
    fi
    
    cd - > /dev/null
}

# Function to run backend checks
run_backend_checks() {
    if [ ! -f "$PROJECT_ROOT/backend/requirements.txt" ]; then
        return 0
    fi
    
    print_status "Running backend checks..."
    
    cd "$PROJECT_ROOT/backend"
    
    # Check if virtual environment is activated
    if [ -z "$VIRTUAL_ENV" ]; then
        print_warning "Virtual environment not activated"
        print_warning "Activate with: source venv/bin/activate (or .venv/bin/activate)"
    fi
    
    # Check Python version if python is available
    if command_exists python3; then
        local python_version=$(python3 --version | cut -d' ' -f2)
        print_status "Python version: $python_version"
        
        # Check if requirements are satisfied
        if command_exists pip; then
            print_status "Checking Python requirements..."
            if pip check > /dev/null 2>&1; then
                print_success "Python requirements check passed"
            else
                print_warning "Python requirements check failed"
                print_warning "Run 'pip check' for details"
            fi
        fi
    fi
    
    # Run flake8 if available
    if command_exists flake8; then
        print_status "Running flake8 linting..."
        if flake8 . --max-line-length=120 --exclude=venv,migrations 2>/dev/null; then
            print_success "Flake8 linting passed"
        else
            print_warning "Flake8 linting found issues"
        fi
    fi
    
    # Run mypy if available
    if command_exists mypy; then
        print_status "Running mypy type checking..."
        if mypy . --ignore-missing-imports 2>/dev/null; then
            print_success "MyPy type checking passed"
        else
            print_warning "MyPy type checking found issues"
        fi
    fi
    
    cd - > /dev/null
}

# Function to check git hooks setup
check_git_hooks() {
    print_status "Checking git hooks setup..."
    
    local hooks_dir="$PROJECT_ROOT/.git/hooks"
    
    # Check if pre-commit hook exists and is executable
    if [ -f "$hooks_dir/pre-commit" ]; then
        if [ -x "$hooks_dir/pre-commit" ]; then
            print_success "Pre-commit hook is properly configured"
        else
            print_warning "Pre-commit hook exists but is not executable"
            print_warning "Fix with: chmod +x .git/hooks/pre-commit"
        fi
    else
        print_warning "Pre-commit hook not found"
        print_warning "Consider setting up pre-commit hooks for automated validation"
    fi
}

# Function to check for TODO/FIXME comments
check_todo_comments() {
    print_status "Checking for TODO/FIXME comments..."
    
    local todo_patterns=("TODO" "FIXME" "HACK" "XXX")
    local todo_found=false
    
    for pattern in "${todo_patterns[@]}"; do
        while IFS= read -r match; do
            if [ -n "$match" ]; then
                todo_found=true
                print_warning "Found $pattern: $match"
            fi
        done < <(git diff --cached | grep -n "$pattern" || true)
    done
    
    if [ "$todo_found" = false ]; then
        print_success "No TODO/FIXME comments in staged changes"
    fi
}

# Function to validate JSON files
validate_json_files() {
    print_status "Validating JSON files..."
    
    local json_files=()
    while IFS= read -r file; do
        if [[ "$file" =~ \.json$ ]]; then
            json_files+=("$file")
        fi
    done < <(git diff --cached --name-only)
    
    local json_errors=false
    for file in "${json_files[@]}"; do
        if [ -f "$file" ]; then
            if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
                print_error "Invalid JSON format in $file"
                json_errors=true
            fi
        fi
    done
    
    if [ "$json_errors" = false ] && [ ${#json_files[@]} -gt 0 ]; then
        print_success "JSON validation passed for ${#json_files[@]} files"
    elif [ ${#json_files[@]} -eq 0 ]; then
        print_success "No JSON files to validate"
    fi
}

# Function to check branch protection compliance
check_branch_protection() {
    print_status "Checking branch protection compliance..."
    
    local current_branch=$(git branch --show-current)
    
    # Check if trying to commit directly to main/master
    if [[ "$current_branch" == "main" || "$current_branch" == "master" ]]; then
        print_error "Direct commits to $current_branch are not allowed"
        print_error "Create a feature branch and submit a pull request"
        ((ERRORS++))
    else
        print_success "Branch protection compliance check passed"
    fi
}

# Main execution function
main() {
    print_status "🔒 AI Marketing Web Builder - Pre-commit Validation"
    print_status "=================================================="
    
    # Check if there are staged changes
    if git diff --cached --quiet; then
        print_error "No staged changes found!"
        exit 1
    fi
    
    # Run all checks
    check_file_sizes
    check_sensitive_files
    check_secrets_in_content
    check_line_lengths
    check_todo_comments
    validate_json_files
    check_branch_protection
    run_frontend_checks
    run_backend_checks
    check_git_hooks
    
    # Validate commit message if provided
    if [ -n "$1" ]; then
        validate_commit_message "$1"
    fi
    
    # Summary
    print_status "=================================================="
    print_status "Pre-commit validation summary:"
    
    if [ $ERRORS -gt 0 ]; then
        print_error "❌ $ERRORS error(s) found"
        print_error "Please fix the errors before committing"
        exit 1
    elif [ $WARNINGS -gt 0 ]; then
        print_warning "⚠️  $WARNINGS warning(s) found"
        print_warning "Consider addressing the warnings"
        
        # Allow commit with warnings but ask for confirmation
        read -p "Continue with commit despite warnings? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Commit aborted by user"
            exit 1
        fi
    else
        print_success "✅ All checks passed!"
    fi
    
    print_success "Pre-commit validation completed successfully"
}

# Run main function with arguments
main "$@"