#!/bin/bash

# Agent Branch Creation Script
# Creates properly named agent branches with validation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Agent configuration
declare -A AGENT_TYPES=(
    ["frontend-builder"]="frontend"
    ["backend-architect"]="backend"
    ["template-designer"]="template"
    ["ai-services-specialist"]="ai"
    ["integration-coordinator"]="integration"
    ["performance-optimizer"]="performance"
    ["workflow-automation-expert"]="workflow"
    ["deployment-manager"]="deployment"
)

declare -A AGENT_DOMAINS=(
    ["frontend-builder"]="Frontend UI components, drag-drop builder, component library"
    ["backend-architect"]="Backend APIs, database, authentication, workflows"
    ["template-designer"]="Premium templates, template system, design patterns"
    ["ai-services-specialist"]="AI integrations, component suggestions, automation"
    ["integration-coordinator"]="System integrations, workflow connections, APIs"
    ["performance-optimizer"]="Performance improvements, optimization, caching"
    ["workflow-automation-expert"]="Workflow automation, triggers, process optimization"
    ["deployment-manager"]="CI/CD, deployment, infrastructure, DevOps"
)

echo -e "${BLUE}🚀 Agent Branch Creation Tool${NC}"
echo "=============================="

# Show available agents
show_agents() {
    echo -e "\n${BLUE}Available Agents:${NC}"
    echo "=================="
    
    for agent in "${!AGENT_TYPES[@]}"; do
        agent_type="${AGENT_TYPES[$agent]}"
        domain="${AGENT_DOMAINS[$agent]}"
        echo -e "${YELLOW}$agent${NC} (${agent_type})"
        echo -e "   Domain: $domain"
        echo ""
    done
}

# Validate inputs
validate_inputs() {
    local agent_name="$1"
    local feature_desc="$2"
    
    if [[ -z "$agent_name" ]]; then
        echo -e "${RED}❌ Agent name is required${NC}"
        return 1
    fi
    
    if [[ -z "$feature_desc" ]]; then
        echo -e "${RED}❌ Feature description is required${NC}"
        return 1
    fi
    
    # Check if agent exists
    if [[ -z "${AGENT_TYPES[$agent_name]}" ]]; then
        echo -e "${RED}❌ Unknown agent: $agent_name${NC}"
        echo -e "Available agents: ${YELLOW}${!AGENT_TYPES[*]}${NC}"
        return 1
    fi
    
    # Validate feature description format (kebab-case)
    if [[ ! "$feature_desc" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
        echo -e "${RED}❌ Feature description must be in kebab-case format${NC}"
        echo -e "   Example: fix-drag-drop-performance"
        return 1
    fi
    
    return 0
}

# Create agent branch
create_agent_branch() {
    local agent_name="$1"
    local feature_desc="$2"
    
    local agent_type="${AGENT_TYPES[$agent_name]}"
    local branch_name="${agent_type}/${agent_name}/${feature_desc}"
    
    echo -e "\n${BLUE}Creating Agent Branch:${NC}"
    echo -e "Agent: ${YELLOW}$agent_name${NC}"
    echo -e "Type: ${YELLOW}$agent_type${NC}"
    echo -e "Feature: ${YELLOW}$feature_desc${NC}"
    echo -e "Branch: ${YELLOW}$branch_name${NC}"
    echo -e "Domain: ${AGENT_DOMAINS[$agent_name]}"
    
    # Check if branch already exists
    if git show-ref --verify --quiet "refs/heads/$branch_name"; then
        echo -e "${RED}❌ Branch '$branch_name' already exists locally${NC}"
        return 1
    fi
    
    if git show-ref --verify --quiet "refs/remotes/origin/$branch_name"; then
        echo -e "${RED}❌ Branch '$branch_name' already exists on remote${NC}"
        return 1
    fi
    
    # Ensure we're starting from latest main
    echo -e "\n${BLUE}📥 Updating main branch...${NC}"
    git checkout main
    git pull origin main
    
    # Create and checkout new branch
    echo -e "\n${BLUE}🌿 Creating branch...${NC}"
    git checkout -b "$branch_name"
    
    # Push branch to remote and set upstream
    echo -e "\n${BLUE}📤 Pushing to remote...${NC}"
    git push -u origin "$branch_name"
    
    echo -e "\n${GREEN}✅ Agent branch created successfully!${NC}"
    echo -e "\n${BLUE}Next Steps:${NC}"
    echo -e "1. Work only on files within your agent domain"
    echo -e "2. Use commit messages with [${agent_name^^}] prefix"
    echo -e "3. Create PR with title: [${agent_name^^}] Feature: $feature_desc"
    echo -e "4. Run compliance check: .claude/scripts/branch-isolation-check.sh"
    
    return 0
}

# Interactive mode
interactive_mode() {
    echo -e "\n${BLUE}🎯 Interactive Branch Creation${NC}"
    echo "==============================="
    
    show_agents
    
    # Get agent name
    echo -e "${BLUE}Select agent name:${NC}"
    read -p "Agent: " agent_name
    
    if [[ -z "$agent_name" ]]; then
        echo -e "${RED}❌ Agent name cannot be empty${NC}"
        return 1
    fi
    
    # Check if agent exists
    if [[ -z "${AGENT_TYPES[$agent_name]}" ]]; then
        echo -e "${RED}❌ Unknown agent: $agent_name${NC}"
        return 1
    fi
    
    # Show agent domain
    echo -e "\n${YELLOW}Agent Domain:${NC} ${AGENT_DOMAINS[$agent_name]}"
    
    # Get feature description
    echo -e "\n${BLUE}Enter feature description (kebab-case):${NC}"
    echo "Examples: fix-drag-drop-ui, add-user-auth, create-saas-templates"
    read -p "Feature: " feature_desc
    
    if ! validate_inputs "$agent_name" "$feature_desc"; then
        return 1
    fi
    
    # Confirm creation
    local branch_name="${AGENT_TYPES[$agent_name]}/${agent_name}/${feature_desc}"
    echo -e "\n${BLUE}Confirm branch creation:${NC}"
    echo -e "Branch: ${YELLOW}$branch_name${NC}"
    read -p "Create this branch? (y/N): " confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        create_agent_branch "$agent_name" "$feature_desc"
    else
        echo -e "${YELLOW}❌ Branch creation cancelled${NC}"
        return 1
    fi
}

# Usage help
show_usage() {
    echo "Usage: $0 [agent-name] [feature-description]"
    echo ""
    echo "Arguments:"
    echo "  agent-name         Name of the agent (required)"
    echo "  feature-description Feature in kebab-case (required)"
    echo ""
    echo "Examples:"
    echo "  $0 frontend-builder fix-drag-drop-ui"
    echo "  $0 backend-architect user-authentication-api"
    echo "  $0 template-designer saas-templates-batch-3"
    echo ""
    echo "Options:"
    echo "  -h, --help        Show this help message"
    echo "  -i, --interactive Run in interactive mode"
    echo "  -l, --list        List available agents"
    echo ""
}

# Main execution
main() {
    local agent_name=""
    local feature_desc=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -i|--interactive)
                interactive_mode
                exit $?
                ;;
            -l|--list)
                show_agents
                exit 0
                ;;
            -*)
                echo -e "${RED}❌ Unknown option: $1${NC}"
                show_usage
                exit 1
                ;;
            *)
                if [[ -z "$agent_name" ]]; then
                    agent_name="$1"
                elif [[ -z "$feature_desc" ]]; then
                    feature_desc="$1"
                else
                    echo -e "${RED}❌ Too many arguments${NC}"
                    show_usage
                    exit 1
                fi
                ;;
        esac
        shift
    done
    
    # If no arguments provided, run interactive mode
    if [[ -z "$agent_name" ]] && [[ -z "$feature_desc" ]]; then
        interactive_mode
        exit $?
    fi
    
    # Validate and create branch
    if validate_inputs "$agent_name" "$feature_desc"; then
        create_agent_branch "$agent_name" "$feature_desc"
        exit $?
    else
        exit 1
    fi
}

# Run if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi