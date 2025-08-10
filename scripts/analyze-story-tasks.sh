#!/bin/bash
# Story Analysis Script - Extract acceptance criteria and create GitHub Project tasks
# Usage: ./scripts/analyze-story-tasks.sh /path/to/story.md

set -e

# Configuration
REPO="gpb360/AI-Marketing-Web-Builder"
FRONTEND_PROJECT="10"
BACKEND_PROJECT="11"
DESIGN_PROJECT="12"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v gh &> /dev/null; then
        error "GitHub CLI (gh) is not installed. Please install it first."
    fi
    
    if ! gh auth status &> /dev/null; then
        error "GitHub CLI is not authenticated. Run 'gh auth login' first."
    fi
    
    success "Prerequisites check passed"
}

# Parse story file and extract metadata
parse_story() {
    local story_file="$1"
    
    if [[ ! -f "$story_file" ]]; then
        error "Story file not found: $story_file"
    fi
    
    log "Parsing story file: $story_file"
    
    # Extract story title
    STORY_TITLE=$(grep -E "^# " "$story_file" | head -1 | sed 's/^# //' || echo "Unknown Story")
    
    # Extract story number (e.g., 3.1, 3.2)
    STORY_NUMBER=$(echo "$story_file" | grep -oE '[0-9]+\.[0-9]+' | head -1 || echo "x.x")
    
    # Extract acceptance criteria
    ACCEPTANCE_CRITERIA=$(sed -n '/## Acceptance Criteria/,/^## /p' "$story_file" | grep -E '^[0-9]+\.' | head -20)
    
    # Extract tasks/subtasks section
    TASKS_SECTION=$(sed -n '/## Tasks \/ Subtasks/,/^## /p' "$story_file" | grep -E '^\s*-\s*\[' | head -50)
    
    log "Story parsed: $STORY_TITLE (Story $STORY_NUMBER)"
    log "Found $(echo "$ACCEPTANCE_CRITERIA" | wc -l) acceptance criteria"
    log "Found $(echo "$TASKS_SECTION" | wc -l) tasks/subtasks"
}

# Analyze components and categorize by project
analyze_components() {
    log "Analyzing story components..."
    
    # Initialize arrays
    FRONTEND_TASKS=()
    BACKEND_TASKS=()
    DESIGN_TASKS=()
    INTEGRATION_TASKS=()
    
    # Keywords for categorization
    FRONTEND_KEYWORDS="component|hook|modal|timeline|canvas|react|tsx|frontend|ui|interface"
    BACKEND_KEYWORDS="websocket|api|endpoint|service|backend|database|workflow|execution"
    DESIGN_KEYWORDS="template|design|visual|theme|style|layout"
    INTEGRATION_KEYWORDS="integration|testing|end-to-end|e2e"
    
    # Parse tasks and categorize
    while IFS= read -r task; do
        if [[ -n "$task" ]]; then
            task_clean=$(echo "$task" | sed 's/^\s*-\s*\[\s*[x ]\s*\]\s*//')
            
            if echo "$task" | grep -qiE "$FRONTEND_KEYWORDS"; then
                FRONTEND_TASKS+=("$task_clean")
            elif echo "$task" | grep -qiE "$BACKEND_KEYWORDS"; then
                BACKEND_TASKS+=("$task_clean")
            elif echo "$task" | grep -qiE "$DESIGN_KEYWORDS"; then
                DESIGN_TASKS+=("$task_clean")
            elif echo "$task" | grep -qiE "$INTEGRATION_KEYWORDS"; then
                INTEGRATION_TASKS+=("$task_clean")
            else
                # Default to frontend for ambiguous tasks
                FRONTEND_TASKS+=("$task_clean")
            fi
        fi
    done <<< "$TASKS_SECTION"
    
    success "Component analysis complete:"
    log "  Frontend tasks: ${#FRONTEND_TASKS[@]}"
    log "  Backend tasks: ${#BACKEND_TASKS[@]}"
    log "  Design tasks: ${#DESIGN_TASKS[@]}"
    log "  Integration tasks: ${#INTEGRATION_TASKS[@]}"
}

# Generate GitHub issue for a task
create_github_issue() {
    local task="$1"
    local project_id="$2"
    local category="$3"
    local task_number="$4"
    
    log "Creating GitHub issue for: $task"
    
    # Generate issue title
    local issue_title="Story $STORY_NUMBER: $task"
    
    # Generate issue body with acceptance criteria
    local issue_body="Part of **$STORY_TITLE**

**Task Category:** $category
**Task Number:** $task_number of story components

**Description:**
$task

**Acceptance Criteria:**
$ACCEPTANCE_CRITERIA

**Implementation Status:**
- [ ] Development complete
- [ ] Tests written and passing
- [ ] PR created and linked
- [ ] Code review passed
- [ ] Merged to main

**Labels:** story-$STORY_NUMBER, $category

**Story Reference:** [Story $STORY_NUMBER Documentation]($story_file)"
    
    # Create the issue
    local issue_url
    issue_url=$(gh issue create \
        --repo "$REPO" \
        --title "$issue_title" \
        --body "$issue_body" \
        2>/dev/null || echo "")
    
    if [[ -n "$issue_url" ]]; then
        success "Created issue: $issue_url"
        
        # Add to project
        gh project item-add "$project_id" --owner "gpb360" --url "$issue_url" 2>/dev/null || warning "Could not add issue to project $project_id"
        
        echo "$issue_url"
    else
        error "Failed to create issue for task: $task"
    fi
}

# Create all GitHub issues for the story
create_all_issues() {
    log "Creating GitHub issues for all story components..."
    
    local created_issues=()
    local task_counter=1
    
    # Create frontend issues
    for task in "${FRONTEND_TASKS[@]}"; do
        issue_url=$(create_github_issue "$task" "$FRONTEND_PROJECT" "frontend" "$task_counter")
        created_issues+=("$issue_url")
        ((task_counter++))
    done
    
    # Create backend issues
    for task in "${BACKEND_TASKS[@]}"; do
        issue_url=$(create_github_issue "$task" "$BACKEND_PROJECT" "backend" "$task_counter")
        created_issues+=("$issue_url")
        ((task_counter++))
    done
    
    # Create design issues
    for task in "${DESIGN_TASKS[@]}"; do
        issue_url=$(create_github_issue "$task" "$DESIGN_PROJECT" "design" "$task_counter")
        created_issues+=("$issue_url")
        ((task_counter++))
    done
    
    # Create integration issues (add to frontend project)
    for task in "${INTEGRATION_TASKS[@]}"; do
        issue_url=$(create_github_issue "$task" "$FRONTEND_PROJECT" "integration" "$task_counter")
        created_issues+=("$issue_url")
        ((task_counter++))
    done
    
    success "Created ${#created_issues[@]} GitHub issues for Story $STORY_NUMBER"
    
    # Output summary
    echo
    log "=== STORY $STORY_NUMBER GITHUB ISSUES CREATED ==="
    for issue in "${created_issues[@]}"; do
        echo "  $issue"
    done
    echo
    log "View project boards:"
    log "  Frontend Project: https://github.com/users/gpb360/projects/$FRONTEND_PROJECT"
    log "  Backend Project: https://github.com/users/gpb360/projects/$BACKEND_PROJECT"  
    log "  Design Project: https://github.com/users/gpb360/projects/$DESIGN_PROJECT"
}

# Main execution
main() {
    local story_file="$1"
    
    if [[ -z "$story_file" ]]; then
        error "Usage: $0 <story-file.md>"
    fi
    
    log "Starting story analysis and GitHub Project task creation"
    log "Story file: $story_file"
    
    check_prerequisites
    parse_story "$story_file"
    analyze_components
    create_all_issues
    
    success "Story $STORY_NUMBER GitHub Project setup complete!"
}

# Run main function with all arguments
main "$@"