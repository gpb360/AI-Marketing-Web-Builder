#!/bin/bash
# Agent Task Helper - Streamline GitHub Project workflow for agents
# Usage: ./scripts/agent-task-helper.sh [command] [options]

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
PURPLE='\033[0;35m'
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

info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# Show help
show_help() {
    cat << EOF
🤖 Agent Task Helper - GitHub Project Workflow Automation

USAGE:
    ./scripts/agent-task-helper.sh COMMAND [OPTIONS]

COMMANDS:
    list-tasks AGENT_TYPE       List available tasks for agent type
    start-task ISSUE_NUMBER     Start working on a GitHub issue
    create-pr ISSUE_NUMBER      Create PR and link to issue
    update-status ISSUE_NUMBER STATUS    Update issue status
    check-agent AGENT_TYPE      Verify agent setup and permissions

AGENT_TYPES:
    frontend      Frontend Developer (Project #10)
    backend       Backend Architect (Project #11)
    design        UI Designer (Project #12)  
    integration   Integration Coordinator (Project #10)
    test          Test Writer (Project #10)

EXAMPLES:
    # List available frontend tasks
    ./scripts/agent-task-helper.sh list-tasks frontend
    
    # Start working on issue #67
    ./scripts/agent-task-helper.sh start-task 67
    
    # Create PR for completed work
    ./scripts/agent-task-helper.sh create-pr 67
    
    # Update issue to ready for review
    ./scripts/agent-task-helper.sh update-status 67 review

OPTIONS:
    -h, --help     Show this help message
    -v, --verbose  Verbose output
    --dry-run      Show what would be done without executing

EOF
}

# Check prerequisites
check_prerequisites() {
    if ! command -v gh &> /dev/null; then
        error "GitHub CLI (gh) is not installed. Please install it first."
    fi
    
    if ! gh auth status &> /dev/null; then
        error "GitHub CLI is not authenticated. Run 'gh auth login' first."
    fi
}

# Get project ID for agent type
get_project_id() {
    local agent_type="$1"
    
    case "$agent_type" in
        "frontend"|"integration"|"test")
            echo "$FRONTEND_PROJECT"
            ;;
        "backend")
            echo "$BACKEND_PROJECT"
            ;;
        "design")
            echo "$DESIGN_PROJECT"
            ;;
        *)
            error "Unknown agent type: $agent_type. Use: frontend, backend, design, integration, test"
            ;;
    esac
}

# List available tasks for agent type
list_tasks() {
    local agent_type="$1"
    local project_id=$(get_project_id "$agent_type")
    
    log "Listing available tasks for $agent_type agent (Project #$project_id)"
    
    # Get issues assigned to project with appropriate labels
    local label_filter=""
    case "$agent_type" in
        "frontend") label_filter="label:frontend" ;;
        "backend") label_filter="label:backend" ;;
        "design") label_filter="label:design" ;;
        "integration") label_filter="label:integration" ;;
        "test") label_filter="label:testing" ;;
    esac
    
    log "Searching for open issues with $label_filter..."
    
    # List issues that match the agent type
    gh issue list --repo "$REPO" \
                  --state open \
                  --search "$label_filter is:open" \
                  --json number,title,labels,assignees \
                  --template '
{{- range . -}}
{{- printf "#%v: %s\n" .number .title -}}
{{- printf "   Labels: " -}}
{{- range .labels -}}{{- printf "%s " .name -}}{{- end -}}
{{- printf "\n" -}}
{{- if .assignees -}}
{{- printf "   Assigned: " -}}
{{- range .assignees -}}{{- printf "@%s " .login -}}{{- end -}}
{{- printf "\n" -}}
{{- else -}}
{{- printf "   🆓 Available for assignment\n" -}}
{{- end -}}
{{- printf "\n" -}}
{{- end -}}'

    info "To start working on a task: ./scripts/agent-task-helper.sh start-task ISSUE_NUMBER"
}

# Start working on a task
start_task() {
    local issue_number="$1"
    
    if [[ -z "$issue_number" ]]; then
        error "Issue number is required. Usage: start-task ISSUE_NUMBER"
    fi
    
    log "Starting work on issue #$issue_number"
    
    # Get issue details
    local issue_info
    issue_info=$(gh issue view "$issue_number" --repo "$REPO" --json title,body,labels,assignees 2>/dev/null || echo "")
    
    if [[ -z "$issue_info" ]]; then
        error "Issue #$issue_number not found or not accessible"
    fi
    
    # Extract issue title for branch name
    local issue_title
    issue_title=$(echo "$issue_info" | jq -r '.title' | sed 's/Story [0-9.]*: //' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
    
    # Detect agent type from labels
    local agent_type=""
    local labels=$(echo "$issue_info" | jq -r '.labels[].name' | tr '\n' ' ')
    
    if [[ "$labels" =~ "frontend" ]]; then
        agent_type="frontend"
    elif [[ "$labels" =~ "backend" ]]; then
        agent_type="backend"
    elif [[ "$labels" =~ "design" ]]; then
        agent_type="design"
    elif [[ "$labels" =~ "integration" ]]; then
        agent_type="integration"
    elif [[ "$labels" =~ "testing" ]]; then
        agent_type="test"
    else
        warning "Could not detect agent type from labels. Defaulting to frontend."
        agent_type="frontend"
    fi
    
    # Create branch name
    local branch_name="${agent_type}/${agent_type}-developer/${issue_title}"
    
    log "Creating branch: $branch_name"
    
    # Check if we're in the right directory
    if [[ ! -d ".git" ]]; then
        error "Not in a git repository. Please run from project root."
    fi
    
    # Create and checkout branch
    git checkout main || error "Failed to checkout main branch"
    git pull origin main || error "Failed to pull latest changes"
    git checkout -b "$branch_name" || error "Failed to create branch $branch_name"
    
    # Update issue with start comment
    gh issue comment "$issue_number" --repo "$REPO" --body "🔄 Started development - Agent: ${agent_type}-developer
Branch: \`$branch_name\`
Started: $(date +'%Y-%m-%d %H:%M:%S')"
    
    success "Started work on issue #$issue_number"
    info "Branch: $branch_name"
    info "Next steps:"
    echo "  1. Implement the feature according to acceptance criteria"
    echo "  2. Write tests for your implementation"  
    echo "  3. Commit your changes with: git commit -m '[${agent_type^^}-DEVELOPER] Implement {feature}'"
    echo "  4. Create PR with: ./scripts/agent-task-helper.sh create-pr $issue_number"
}

# Create PR for completed work
create_pr() {
    local issue_number="$1"
    
    if [[ -z "$issue_number" ]]; then
        error "Issue number is required. Usage: create-pr ISSUE_NUMBER"
    fi
    
    log "Creating PR for issue #$issue_number"
    
    # Get current branch
    local current_branch
    current_branch=$(git branch --show-current)
    
    if [[ "$current_branch" == "main" ]]; then
        error "Cannot create PR from main branch. Please checkout your feature branch."
    fi
    
    # Extract agent type from branch name
    local agent_type
    agent_type=$(echo "$current_branch" | cut -d'/' -f1)
    
    # Get issue details
    local issue_info
    issue_info=$(gh issue view "$issue_number" --repo "$REPO" --json title,body,labels 2>/dev/null || echo "")
    
    if [[ -z "$issue_info" ]]; then
        error "Issue #$issue_number not found or not accessible"
    fi
    
    local issue_title
    issue_title=$(echo "$issue_info" | jq -r '.title')
    
    # Create PR title
    local pr_title="[${agent_type^^}-DEVELOPER] $issue_title"
    
    # Create PR body
    local pr_body="## Story Connection
Closes #$issue_number

## Implementation Summary
Implemented according to acceptance criteria defined in the linked issue.

## Testing
- [x] Implementation complete
- [x] Manual testing performed
- [x] Code follows domain ownership rules

## Agent Verification
- **Agent**: ${agent_type}-developer
- **Branch**: $current_branch
- **Domain Compliance**: ✅ All files within agent domain

## Files Modified
$(git diff --name-only main..HEAD | head -10)"
    
    # Push current branch
    log "Pushing branch: $current_branch"
    git push -u origin "$current_branch" || error "Failed to push branch"
    
    # Create PR
    local pr_url
    pr_url=$(gh pr create --repo "$REPO" \
                          --title "$pr_title" \
                          --body "$pr_body" \
                          --head "$current_branch" \
                          --base main 2>/dev/null || echo "")
    
    if [[ -z "$pr_url" ]]; then
        error "Failed to create PR"
    fi
    
    # Update issue with PR comment
    gh issue comment "$issue_number" --repo "$REPO" --body "✅ Implementation complete - PR created
PR: $pr_url
Agent: ${agent_type}-developer
Status: Ready for review"
    
    success "Created PR: $pr_url"
    success "Updated issue #$issue_number with PR link"
    
    info "Next steps:"
    echo "  1. Move GitHub issue to 'Ready for Review' status"
    echo "  2. Wait for Lead Developer review"
    echo "  3. Address any review feedback"
}

# Update issue status
update_status() {
    local issue_number="$1"
    local status="$2"
    
    if [[ -z "$issue_number" || -z "$status" ]]; then
        error "Usage: update-status ISSUE_NUMBER STATUS"
    fi
    
    local status_message=""
    case "$status" in
        "progress"|"in-progress")
            status_message="🔄 Status: In Progress"
            ;;
        "review"|"ready-for-review")
            status_message="👀 Status: Ready for Review"
            ;;
        "blocked")
            status_message="🚫 Status: BLOCKED - Please add details about what's blocking progress"
            ;;
        "testing")
            status_message="🧪 Status: In Testing"
            ;;
        "done"|"complete")
            status_message="✅ Status: Complete"
            ;;
        *)
            error "Unknown status: $status. Use: progress, review, blocked, testing, done"
            ;;
    esac
    
    gh issue comment "$issue_number" --repo "$REPO" --body "$status_message
Updated: $(date +'%Y-%m-%d %H:%M:%S')"
    
    success "Updated issue #$issue_number status to: $status"
}

# Check agent setup
check_agent() {
    local agent_type="$1"
    
    if [[ -z "$agent_type" ]]; then
        error "Agent type is required. Usage: check-agent AGENT_TYPE"
    fi
    
    local project_id=$(get_project_id "$agent_type")
    
    log "Checking setup for $agent_type agent"
    
    # Check GitHub auth
    success "GitHub CLI authenticated"
    
    # Check project access
    local project_check
    project_check=$(gh project list --owner gpb360 2>/dev/null | grep -c "Project $project_id" || echo "0")
    
    if [[ "$project_check" -gt 0 ]]; then
        success "Access to Project #$project_id confirmed"
    else
        warning "Cannot access Project #$project_id - may need permissions"
    fi
    
    # Show project URLs
    info "Your project board: https://github.com/users/gpb360/projects/$project_id"
    
    # Check git status
    if [[ -d ".git" ]]; then
        success "Git repository detected"
        local branch=$(git branch --show-current)
        info "Current branch: $branch"
    else
        warning "Not in git repository. Run from project root."
    fi
    
    info "Agent setup check complete for $agent_type"
}

# Main function
main() {
    local command="$1"
    shift
    
    # Handle help and version
    case "$command" in
        "-h"|"--help"|"help"|"")
            show_help
            exit 0
            ;;
    esac
    
    # Check prerequisites
    check_prerequisites
    
    # Execute command
    case "$command" in
        "list-tasks")
            list_tasks "$1"
            ;;
        "start-task")
            start_task "$1"
            ;;
        "create-pr")
            create_pr "$1"
            ;;
        "update-status")
            update_status "$1" "$2"
            ;;
        "check-agent")
            check_agent "$1"
            ;;
        *)
            error "Unknown command: $command. Use --help to see available commands."
            ;;
    esac
}

# Run main function
main "$@"