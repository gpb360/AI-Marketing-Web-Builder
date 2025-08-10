#!/bin/bash
# Cross-Project Coordinator - Manage dependencies across Frontend, Backend, and Design projects
# Usage: ./scripts/cross-project-coordinator.sh [command] [options]

set -e

# Configuration
REPO="gpb360/AI-Marketing-Web-Builder"
FRONTEND_PROJECT="10"
BACKEND_PROJECT="11"
DESIGN_PROJECT="12"
OWNER="gpb360"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

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

info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

header() {
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════════╗
║  🔄 $1
╚══════════════════════════════════════════════════════════════════╝${NC}"
}

# Show help
show_help() {
    cat << EOF
🔄 Cross-Project Coordinator - Multi-Project Management

USAGE:
    ./scripts/cross-project-coordinator.sh COMMAND [OPTIONS]

COMMANDS:
    sync-status                 Synchronize status across all projects
    find-dependencies          Find cross-project dependencies  
    create-dependency ISSUE1 ISSUE2   Create dependency link
    project-overview           Show overview of all projects
    balance-workload           Balance tasks across projects
    story-coordination STORY   Coordinate story across projects

PROJECT INFORMATION:
    Frontend Project #10:  React components, hooks, UI elements
    Backend Project #11:   APIs, services, database operations  
    Design Project #12:    Templates, design systems, visual assets

EXAMPLES:
    # Show overview of all projects
    ./scripts/cross-project-coordinator.sh project-overview
    
    # Sync status across projects
    ./scripts/cross-project-coordinator.sh sync-status
    
    # Find dependencies for Story 3.2
    ./scripts/cross-project-coordinator.sh find-dependencies
    
    # Balance workload across projects
    ./scripts/cross-project-coordinator.sh balance-workload

OPTIONS:
    -h, --help     Show this help message
    -v, --verbose  Verbose output
    --dry-run     Show what would be done without executing

EOF
}

# Get project information
get_project_info() {
    local project_id="$1"
    
    case "$project_id" in
        "$FRONTEND_PROJECT")
            echo "Frontend|React components, hooks, UI elements"
            ;;
        "$BACKEND_PROJECT") 
            echo "Backend|APIs, services, database operations"
            ;;
        "$DESIGN_PROJECT")
            echo "Design|Templates, design systems, visual assets"
            ;;
        *)
            echo "Unknown|Unknown project type"
            ;;
    esac
}

# Project overview
project_overview() {
    header "Cross-Project Overview"
    
    local projects=("$FRONTEND_PROJECT" "$BACKEND_PROJECT" "$DESIGN_PROJECT")
    
    for project_id in "${projects[@]}"; do
        local project_info=$(get_project_info "$project_id")
        local project_name=$(echo "$project_info" | cut -d'|' -f1)
        local project_desc=$(echo "$project_info" | cut -d'|' -f2)
        
        echo
        info "📋 Project #$project_id - $project_name"
        echo "   Description: $project_desc"
        echo "   URL: https://github.com/users/$OWNER/projects/$project_id"
        
        # Get recent issues for this project by searching labels
        local label_search=""
        case "$project_name" in
            "Frontend") label_search="label:frontend" ;;
            "Backend") label_search="label:backend" ;;
            "Design") label_search="label:design" ;;
        esac
        
        # Count open issues
        local open_issues
        open_issues=$(gh issue list --repo "$REPO" --search "$label_search is:open" --json number --limit 50 2>/dev/null | jq length || echo "0")
        
        # Count closed issues  
        local closed_issues
        closed_issues=$(gh issue list --repo "$REPO" --search "$label_search is:closed" --json number --limit 50 2>/dev/null | jq length || echo "0")
        
        echo "   📊 Issues: $open_issues open, $closed_issues closed"
        
        # Get recent PRs
        local recent_prs
        recent_prs=$(gh pr list --repo "$REPO" --search "$label_search" --limit 5 --json number,title,state 2>/dev/null || echo "[]")
        
        local pr_count=$(echo "$recent_prs" | jq length || echo "0")
        echo "   🔄 Recent PRs: $pr_count"
        
        if [[ "$pr_count" -gt 0 ]]; then
            echo "$recent_prs" | jq -r '.[] | "      PR #\(.number): \(.title) [\(.state)]"' | head -3
        fi
    done
    
    echo
    success "Cross-project overview complete"
    info "Use 'sync-status' to synchronize status across projects"
}

# Synchronize status across projects
sync_status() {
    header "Synchronizing Status Across Projects"
    
    # Find issues that might need cross-project coordination
    log "Searching for cross-project coordination opportunities..."
    
    # Look for issues mentioning other projects/components
    local frontend_backend_deps
    frontend_backend_deps=$(gh issue list --repo "$REPO" \
        --search "label:frontend (API OR backend OR endpoint OR service)" \
        --json number,title,labels --limit 20 2>/dev/null || echo "[]")
    
    local backend_frontend_deps  
    backend_frontend_deps=$(gh issue list --repo "$REPO" \
        --search "label:backend (component OR frontend OR UI OR interface)" \
        --json number,title,labels --limit 20 2>/dev/null || echo "[]")
    
    local design_deps
    design_deps=$(gh issue list --repo "$REPO" \
        --search "label:design (component OR frontend OR template)" \
        --json number,title,labels --limit 20 2>/dev/null || echo "[]")
    
    # Report findings
    local fb_count=$(echo "$frontend_backend_deps" | jq length || echo "0")
    local bf_count=$(echo "$backend_frontend_deps" | jq length || echo "0") 
    local d_count=$(echo "$design_deps" | jq length || echo "0")
    
    if [[ "$fb_count" -gt 0 ]]; then
        info "🔗 Found $fb_count frontend issues that may depend on backend work:"
        echo "$frontend_backend_deps" | jq -r '.[] | "  #\(.number): \(.title)"' | head -5
    fi
    
    if [[ "$bf_count" -gt 0 ]]; then
        info "🔗 Found $bf_count backend issues that may depend on frontend work:"
        echo "$backend_frontend_deps" | jq -r '.[] | "  #\(.number): \(.title)"' | head -5
    fi
    
    if [[ "$d_count" -gt 0 ]]; then
        info "🎨 Found $d_count design issues that may need coordination:"
        echo "$design_deps" | jq -r '.[] | "  #\(.number): \(.title)"' | head -5
    fi
    
    # Check for blocked issues
    log "Checking for blocked issues across projects..."
    
    local blocked_issues
    blocked_issues=$(gh issue list --repo "$REPO" --search "blocked OR BLOCKED OR waiting" --json number,title,labels --limit 10 2>/dev/null || echo "[]")
    
    local blocked_count=$(echo "$blocked_issues" | jq length || echo "0")
    
    if [[ "$blocked_count" -gt 0 ]]; then
        warning "Found $blocked_count potentially blocked issues:"
        echo "$blocked_issues" | jq -r '.[] | "  #\(.number): \(.title)"'
        echo
        info "Consider using 'create-dependency' to link blocking issues"
    fi
    
    success "Status synchronization complete"
}

# Find cross-project dependencies
find_dependencies() {
    header "Finding Cross-Project Dependencies"
    
    log "Analyzing issues for dependency patterns..."
    
    # Common dependency patterns
    local patterns=(
        "API.*component"
        "component.*API"
        "frontend.*backend"
        "backend.*frontend"
        "template.*component"
        "design.*implement"
    )
    
    local found_deps=()
    
    for pattern in "${patterns[@]}"; do
        log "Searching for pattern: $pattern"
        
        local matches
        matches=$(gh issue list --repo "$REPO" \
            --search "$pattern" \
            --json number,title,labels,body \
            --limit 10 2>/dev/null || echo "[]")
        
        local match_count=$(echo "$matches" | jq length || echo "0")
        
        if [[ "$match_count" -gt 0 ]]; then
            info "Found $match_count issues matching pattern '$pattern':"
            echo "$matches" | jq -r '.[] | "  #\(.number): \(.title)"'
            echo
        fi
    done
    
    # Look for explicit dependency mentions
    log "Searching for explicit dependency mentions..."
    
    local dependency_mentions
    dependency_mentions=$(gh issue list --repo "$REPO" \
        --search "depends on OR blocks OR requires OR needs" \
        --json number,title,body --limit 15 2>/dev/null || echo "[]")
    
    local dep_count=$(echo "$dependency_mentions" | jq length || echo "0")
    
    if [[ "$dep_count" -gt 0 ]]; then
        info "Found $dep_count issues with explicit dependency language:"
        echo "$dependency_mentions" | jq -r '.[] | "  #\(.number): \(.title)"'
        echo
    fi
    
    success "Dependency analysis complete"
    info "Use 'create-dependency ISSUE1 ISSUE2' to establish formal dependency links"
}

# Create dependency link
create_dependency() {
    local blocker_issue="$1"
    local blocked_issue="$2"
    
    if [[ -z "$blocker_issue" || -z "$blocked_issue" ]]; then
        error "Usage: create-dependency BLOCKER_ISSUE BLOCKED_ISSUE"
    fi
    
    header "Creating Dependency Link"
    
    log "Creating dependency: Issue #$blocked_issue depends on Issue #$blocker_issue"
    
    # Add comment to blocked issue
    gh issue comment "$blocked_issue" --repo "$REPO" \
        --body "🚫 **Blocked by**: Issue #$blocker_issue

This issue cannot proceed until #$blocker_issue is completed.

**Dependency created**: $(date +'%Y-%m-%d %H:%M:%S')
**Status**: Waiting for blocker resolution"
    
    # Add comment to blocker issue
    gh issue comment "$blocker_issue" --repo "$REPO" \
        --body "⚠️ **Blocking**: Issue #$blocked_issue

This issue blocks progress on #$blocked_issue. Consider prioritizing for resolution.

**Dependency created**: $(date +'%Y-%m-%d %H:%M:%S')
**Impact**: Blocking other work"
    
    success "Dependency link created between #$blocker_issue → #$blocked_issue"
    info "Both issues have been updated with dependency information"
}

# Balance workload across projects
balance_workload() {
    header "Workload Balance Analysis"
    
    log "Analyzing workload distribution across projects..."
    
    # Get issue counts by project
    local frontend_open=$(gh issue list --repo "$REPO" --search "label:frontend is:open" --json number --limit 100 2>/dev/null | jq length || echo "0")
    local backend_open=$(gh issue list --repo "$REPO" --search "label:backend is:open" --json number --limit 100 2>/dev/null | jq length || echo "0")
    local design_open=$(gh issue list --repo "$REPO" --search "label:design is:open" --json number --limit 100 2>/dev/null | jq length || echo "0")
    
    # Get PR counts by project  
    local frontend_prs=$(gh pr list --repo "$REPO" --search "label:frontend" --json number --limit 50 2>/dev/null | jq length || echo "0")
    local backend_prs=$(gh pr list --repo "$REPO" --search "label:backend" --json number --limit 50 2>/dev/null | jq length || echo "0")
    local design_prs=$(gh pr list --repo "$REPO" --search "label:design" --json number --limit 50 2>/dev/null | jq length || echo "0")
    
    # Display workload analysis
    echo
    info "📊 Current Workload Distribution"
    echo "  Frontend Project:"
    echo "    📋 Open Issues: $frontend_open"
    echo "    🔄 Active PRs: $frontend_prs"
    echo
    echo "  Backend Project:"
    echo "    📋 Open Issues: $backend_open"
    echo "    🔄 Active PRs: $backend_prs"
    echo
    echo "  Design Project:"
    echo "    📋 Open Issues: $design_open"
    echo "    🔄 Active PRs: $design_prs"
    
    # Calculate total workload
    local total_issues=$((frontend_open + backend_open + design_open))
    local total_prs=$((frontend_prs + backend_prs + design_prs))
    
    echo
    info "📈 Total Workload: $total_issues open issues, $total_prs active PRs"
    
    # Identify imbalances
    if [[ "$total_issues" -gt 0 ]]; then
        local frontend_pct=$((frontend_open * 100 / total_issues))
        local backend_pct=$((backend_open * 100 / total_issues))
        local design_pct=$((design_open * 100 / total_issues))
        
        echo
        info "📊 Workload Distribution:"
        echo "  Frontend: $frontend_pct% ($frontend_open issues)"
        echo "  Backend: $backend_pct% ($backend_open issues)"
        echo "  Design: $design_pct% ($design_open issues)"
        
        # Identify imbalances
        local max_load=$frontend_open
        local min_load=$frontend_open
        local overloaded_project="Frontend"
        local underloaded_project="Frontend"
        
        if [[ "$backend_open" -gt "$max_load" ]]; then
            max_load=$backend_open
            overloaded_project="Backend"
        fi
        
        if [[ "$design_open" -gt "$max_load" ]]; then
            max_load=$design_open
            overloaded_project="Design"
        fi
        
        if [[ "$backend_open" -lt "$min_load" ]]; then
            min_load=$backend_open
            underloaded_project="Backend"
        fi
        
        if [[ "$design_open" -lt "$min_load" ]]; then
            min_load=$design_open
            underloaded_project="Design"
        fi
        
        local load_diff=$((max_load - min_load))
        
        if [[ "$load_diff" -gt 5 ]]; then
            warning "Workload imbalance detected!"
            echo "  Overloaded: $overloaded_project ($max_load issues)"
            echo "  Underloaded: $underloaded_project ($min_load issues)"
            echo "  Difference: $load_diff issues"
            echo
            info "Consider redistributing some tasks or adjusting agent assignments"
        else
            success "Workload is relatively balanced across projects"
        fi
    fi
}

# Story coordination
story_coordination() {
    local story_number="$1"
    
    if [[ -z "$story_number" ]]; then
        error "Story number is required. Usage: story-coordination STORY_NUMBER"
    fi
    
    header "Story $story_number Cross-Project Coordination"
    
    log "Analyzing Story $story_number across all projects..."
    
    # Find all issues related to this story
    local story_issues
    story_issues=$(gh issue list --repo "$REPO" \
        --search "story-$story_number OR \"Story $story_number\"" \
        --json number,title,labels,state --limit 50 2>/dev/null || echo "[]")
    
    local issue_count=$(echo "$story_issues" | jq length || echo "0")
    
    if [[ "$issue_count" -eq 0 ]]; then
        warning "No issues found for Story $story_number"
        info "Use 'process-story' to create GitHub Project tasks for this story"
        return
    fi
    
    success "Found $issue_count issues for Story $story_number"
    
    # Categorize by project type
    local frontend_issues=$(echo "$story_issues" | jq '[.[] | select(.labels[]?.name == "frontend")]')
    local backend_issues=$(echo "$story_issues" | jq '[.[] | select(.labels[]?.name == "backend")]')
    local design_issues=$(echo "$story_issues" | jq '[.[] | select(.labels[]?.name == "design")]')
    local integration_issues=$(echo "$story_issues" | jq '[.[] | select(.labels[]?.name == "integration")]')
    
    local frontend_count=$(echo "$frontend_issues" | jq length)
    local backend_count=$(echo "$backend_issues" | jq length)
    local design_count=$(echo "$design_issues" | jq length)
    local integration_count=$(echo "$integration_issues" | jq length)
    
    echo
    info "📊 Story $story_number Distribution:"
    echo "  Frontend tasks: $frontend_count"
    echo "  Backend tasks: $backend_count"
    echo "  Design tasks: $design_count"
    echo "  Integration tasks: $integration_count"
    
    # Check completion status
    local open_issues=$(echo "$story_issues" | jq '[.[] | select(.state == "open")] | length')
    local closed_issues=$(echo "$story_issues" | jq '[.[] | select(.state == "closed")] | length')
    
    echo
    info "📈 Story $story_number Progress:"
    echo "  Open: $open_issues"
    echo "  Closed: $closed_issues"
    echo "  Completion: $((closed_issues * 100 / issue_count))%"
    
    # Identify coordination needs
    if [[ "$frontend_count" -gt 0 && "$backend_count" -gt 0 ]]; then
        info "🔄 Cross-project coordination needed between Frontend and Backend teams"
    fi
    
    if [[ "$design_count" -gt 0 && "$frontend_count" -gt 0 ]]; then
        info "🎨 Coordination needed between Design and Frontend teams"
    fi
    
    if [[ "$integration_count" -gt 0 ]]; then
        info "🔗 Integration tasks require coordination across multiple teams"
    fi
    
    success "Story $story_number coordination analysis complete"
}

# Main function
main() {
    local command="$1"
    shift
    
    # Handle help
    case "$command" in
        "-h"|"--help"|"help"|"")
            show_help
            exit 0
            ;;
    esac
    
    # Check prerequisites
    if ! command -v gh &> /dev/null; then
        error "GitHub CLI (gh) is not installed"
    fi
    
    if ! gh auth status &> /dev/null; then
        error "GitHub CLI is not authenticated. Run 'gh auth login'"
    fi
    
    # Execute command
    case "$command" in
        "project-overview")
            project_overview
            ;;
        "sync-status")
            sync_status
            ;;
        "find-dependencies") 
            find_dependencies
            ;;
        "create-dependency")
            create_dependency "$1" "$2"
            ;;
        "balance-workload")
            balance_workload
            ;;
        "story-coordination")
            story_coordination "$1"
            ;;
        *)
            error "Unknown command: $command. Use --help to see available commands."
            ;;
    esac
}

# Run main function
main "$@"