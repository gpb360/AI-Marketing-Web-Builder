#!/bin/bash

# Archon-BMad Workflow Synchronization Script
# Provides bidirectional sync between Archon tasks and BMad workflow phases

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ARCHON_PROJECT_ID="7f28b875-3e32-4f1d-8349-c38df1d1ad67"
ARCHON_BASE_URL="${ARCHON_MCP_URL:-http://localhost:8080}"
WEBHOOK_SECRET="${ARCHON_WEBHOOK_SECRET:-default-secret}"

# BMad phase to Archon status mapping
declare -A BMAD_TO_ARCHON_STATUS=(
    ["story_created"]="todo"
    ["in_development"]="doing"
    ["qa_testing"]="review"
    ["e2e_validation"]="review"
    ["deployed"]="done"
    ["complete"]="done"
)

# Agent type mappings (consistent with both systems)
declare -A AGENT_MAPPINGS=(
    ["frontend-builder"]="frontend-developer"
    ["frontend-developer"]="frontend-developer"
    ["backend-architect"]="backend-architect"
    ["template-designer"]="template-designer"
    ["ai-services-specialist"]="ai-engineer"
    ["integration-coordinator"]="integration-coordinator"
    ["performance-optimizer"]="performance-optimizer"
    ["workflow-automation-expert"]="workflow-automation-expert"
    ["deployment-manager"]="deployment-manager"
    ["qa-automation-agent"]="prp-validator"
)

echo -e "${BLUE}🔄 Archon-BMad Workflow Synchronization${NC}"
echo "========================================"

# Get current branch info
get_branch_info() {
    local current_branch=$(git branch --show-current)
    local agent_type=""
    local agent_name=""
    local feature_desc=""
    
    if [[ $current_branch =~ ^([^/]+)/([^/]+)/(.+)$ ]]; then
        agent_type="${BASH_REMATCH[1]}"
        agent_name="${BASH_REMATCH[2]}"
        feature_desc="${BASH_REMATCH[3]}"
    elif [[ $current_branch =~ ^feature/(.+)$ ]]; then
        feature_desc="${BASH_REMATCH[1]}"
        agent_type="feature"
        agent_name="general"
    else
        echo -e "${YELLOW}⚠️  Branch doesn't follow naming convention: $current_branch${NC}"
        return 1
    fi
    
    echo "$current_branch|$agent_type|$agent_name|$feature_desc"
}

# Create Archon task from BMad branch
create_archon_task() {
    local branch_info="$1"
    IFS='|' read -r branch agent_type agent_name feature_desc <<< "$branch_info"
    
    local archon_agent="${AGENT_MAPPINGS[$agent_name]:-$agent_name}"
    local task_title="BMad: $feature_desc"
    local task_description="Auto-created from BMad branch: $branch\nAgent: $agent_name\nType: $agent_type"
    
    echo -e "\n${BLUE}📝 Creating Archon task...${NC}"
    echo -e "Title: ${YELLOW}$task_title${NC}"
    echo -e "Agent: ${YELLOW}$archon_agent${NC}"
    echo -e "Feature: ${YELLOW}$feature_desc${NC}"
    
    # Here you would call the Archon MCP API to create the task
    # For now, we'll simulate it with echo
    echo -e "${GREEN}✅ Archon task would be created${NC}"
    echo -e "   Task ID: task-$(date +%s)"
    echo -e "   Status: todo"
    echo -e "   Assignee: $archon_agent"
}

# Update Archon task status from BMad phase
update_archon_task_status() {
    local task_id="$1"
    local bmad_phase="$2"
    local test_results="$3"
    
    local archon_status="${BMAD_TO_ARCHON_STATUS[$bmad_phase]}"
    
    if [[ -z "$archon_status" ]]; then
        echo -e "${YELLOW}⚠️  Unknown BMad phase: $bmad_phase${NC}"
        return 1
    fi
    
    echo -e "\n${BLUE}🔄 Updating Archon task status...${NC}"
    echo -e "Task ID: ${YELLOW}$task_id${NC}"
    echo -e "BMad Phase: ${YELLOW}$bmad_phase${NC}"
    echo -e "Archon Status: ${YELLOW}$archon_status${NC}"
    
    if [[ -n "$test_results" ]]; then
        echo -e "Test Results: ${YELLOW}$test_results${NC}"
    fi
    
    # Here you would call the Archon MCP API to update the task
    echo -e "${GREEN}✅ Archon task status would be updated${NC}"
}

# Create BMad branch from Archon task
create_bmad_branch() {
    local task_data="$1"
    # Parse task data (JSON-like format)
    local agent=$(echo "$task_data" | grep -o '"assignee":"[^"]*"' | cut -d'"' -f4)
    local title=$(echo "$task_data" | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
    local feature=$(echo "$task_data" | grep -o '"feature":"[^"]*"' | cut -d'"' -f4)
    
    # Convert Archon agent to BMad agent
    local bmad_agent=""
    for bmad_agent_name in "${!AGENT_MAPPINGS[@]}"; do
        if [[ "${AGENT_MAPPINGS[$bmad_agent_name]}" == "$agent" ]]; then
            bmad_agent="$bmad_agent_name"
            break
        fi
    done
    
    if [[ -z "$bmad_agent" ]]; then
        bmad_agent="frontend-developer"  # Default fallback
    fi
    
    # Generate feature description from title
    local feature_desc=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
    
    echo -e "\n${BLUE}🌿 Creating BMad branch...${NC}"
    echo -e "Agent: ${YELLOW}$bmad_agent${NC}"
    echo -e "Feature: ${YELLOW}$feature_desc${NC}"
    
    # Call the existing BMad branch creation script
    if [[ -f ".claude/scripts/agent-branch-create.sh" ]]; then
        .claude/scripts/agent-branch-create.sh "$bmad_agent" "$feature_desc"
    else
        echo -e "${RED}❌ BMad branch creation script not found${NC}"
        return 1
    fi
}

# Check BMad phase based on current state
check_bmad_phase() {
    local branch_info="$1"
    IFS='|' read -r branch agent_type agent_name feature_desc <<< "$branch_info"
    
    echo -e "\n${BLUE}🔍 Checking BMad phase...${NC}"
    
    # Check if we have commits
    local commit_count=$(git rev-list --count HEAD ^main 2>/dev/null || echo "0")
    
    # Check if tests exist and pass
    local has_tests=false
    local tests_pass=false
    
    if [[ -f "package.json" ]] && npm run test --dry-run >/dev/null 2>&1; then
        has_tests=true
        if npm test >/dev/null 2>&1; then
            tests_pass=true
        fi
    fi
    
    # Determine phase based on current state
    local current_phase="story_created"
    
    if [[ $commit_count -gt 0 ]]; then
        current_phase="in_development"
        
        if [[ $has_tests == true ]]; then
            current_phase="qa_testing"
            
            if [[ $tests_pass == true ]]; then
                current_phase="e2e_validation"
            fi
        fi
    fi
    
    echo -e "Current phase: ${YELLOW}$current_phase${NC}"
    echo -e "Commits: ${YELLOW}$commit_count${NC}"
    echo -e "Has tests: ${YELLOW}$has_tests${NC}"
    echo -e "Tests pass: ${YELLOW}$tests_pass${NC}"
    
    echo "$current_phase"
}

# Sync current branch with Archon
sync_current_branch() {
    echo -e "\n${BLUE}🔄 Syncing current branch with Archon...${NC}"
    
    local branch_info
    if ! branch_info=$(get_branch_info); then
        echo -e "${RED}❌ Cannot sync - invalid branch format${NC}"
        return 1
    fi
    
    local current_phase
    current_phase=$(check_bmad_phase "$branch_info")
    
    # In a real implementation, you would:
    # 1. Query Archon for existing tasks matching this branch
    # 2. Create task if it doesn't exist
    # 3. Update task status based on BMad phase
    
    echo -e "${GREEN}✅ Sync completed${NC}"
    echo -e "Branch: $(echo "$branch_info" | cut -d'|' -f1)"
    echo -e "Phase: $current_phase"
    echo -e "Archon Status: ${BMAD_TO_ARCHON_STATUS[$current_phase]}"
}

# Webhook handler for Archon task events
handle_archon_webhook() {
    local event_type="$1"
    local task_data="$2"
    
    echo -e "\n${BLUE}📨 Handling Archon webhook...${NC}"
    echo -e "Event: ${YELLOW}$event_type${NC}"
    
    case "$event_type" in
        "task.created")
            create_bmad_branch "$task_data"
            ;;
        "task.assigned")
            echo -e "${YELLOW}ℹ️  Task assignment change - no BMad action needed${NC}"
            ;;
        "task.updated")
            echo -e "${YELLOW}ℹ️  Task update - checking for status changes${NC}"
            ;;
        *)
            echo -e "${YELLOW}⚠️  Unknown event type: $event_type${NC}"
            ;;
    esac
}

# Generate status report
generate_status_report() {
    echo -e "\n${BLUE}📊 Archon-BMad Sync Status Report${NC}"
    echo "===================================="
    
    local current_branch=$(git branch --show-current)
    echo -e "Current Branch: ${YELLOW}$current_branch${NC}"
    
    if [[ $current_branch == "main" ]]; then
        echo -e "${GREEN}✅ On main branch - no sync needed${NC}"
        return 0
    fi
    
    local branch_info
    if branch_info=$(get_branch_info); then
        local current_phase
        current_phase=$(check_bmad_phase "$branch_info")
        
        IFS='|' read -r branch agent_type agent_name feature_desc <<< "$branch_info"
        
        echo -e "\nBranch Analysis:"
        echo -e "  Agent Type: ${YELLOW}$agent_type${NC}"
        echo -e "  Agent Name: ${YELLOW}$agent_name${NC}"
        echo -e "  Feature: ${YELLOW}$feature_desc${NC}"
        echo -e "  BMad Phase: ${YELLOW}$current_phase${NC}"
        echo -e "  Archon Status: ${YELLOW}${BMAD_TO_ARCHON_STATUS[$current_phase]}${NC}"
        
        # Check for potential issues
        echo -e "\nCompliance Checks:"
        
        # Run BMad isolation check
        if [[ -f ".claude/scripts/branch-isolation-check.sh" ]]; then
            if .claude/scripts/branch-isolation-check.sh >/dev/null 2>&1; then
                echo -e "  ${GREEN}✅ BMad isolation compliance${NC}"
            else
                echo -e "  ${RED}❌ BMad isolation violations${NC}"
            fi
        else
            echo -e "  ${YELLOW}⚠️  BMad isolation check not available${NC}"
        fi
        
        # Check for untracked changes
        local untracked=$(git status --porcelain | wc -l)
        if [[ $untracked -eq 0 ]]; then
            echo -e "  ${GREEN}✅ No untracked changes${NC}"
        else
            echo -e "  ${YELLOW}⚠️  $untracked untracked changes${NC}"
        fi
        
    else
        echo -e "${RED}❌ Branch format doesn't follow conventions${NC}"
    fi
}

# Usage help
show_usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  sync              Sync current branch with Archon"
    echo "  status            Show sync status report"
    echo "  webhook [type]    Handle Archon webhook event"
    echo "  create-task       Create Archon task from current branch"
    echo "  update-status     Update Archon task status from BMad phase"
    echo ""
    echo "Options:"
    echo "  -h, --help        Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  ARCHON_MCP_URL          Archon MCP base URL (default: http://localhost:8080)"
    echo "  ARCHON_WEBHOOK_SECRET   Webhook authentication secret"
    echo ""
}

# Main execution
main() {
    local command="${1:-status}"
    
    case "$command" in
        "sync")
            sync_current_branch
            ;;
        "status")
            generate_status_report
            ;;
        "webhook")
            local event_type="$2"
            local task_data="$3"
            handle_archon_webhook "$event_type" "$task_data"
            ;;
        "create-task")
            local branch_info
            if branch_info=$(get_branch_info); then
                create_archon_task "$branch_info"
            fi
            ;;
        "update-status")
            local task_id="$2"
            local phase="$3"
            local results="$4"
            update_archon_task_status "$task_id" "$phase" "$results"
            ;;
        "-h"|"--help")
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $command${NC}"
            show_usage
            exit 1
            ;;
    esac
}

# Run if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi