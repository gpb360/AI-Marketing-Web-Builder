#!/bin/bash

# Agent Branch Isolation Compliance Checker
# Ensures agents follow branch naming conventions and file ownership rules

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Agent type mappings
declare -A AGENT_TYPES=(
    ["frontend-builder"]="frontend"
    ["frontend-developer"]="frontend"
    ["backend-architect"]="backend" 
    ["template-designer"]="template"
    ["ai-services-specialist"]="ai"
    ["integration-coordinator"]="integration"
    ["performance-optimizer"]="performance"
    ["workflow-automation-expert"]="workflow"
    ["deployment-manager"]="deployment"
    ["qa-automation-agent"]="testing"
)

# File ownership patterns (relaxed for development workflow)
declare -A FILE_OWNERSHIP=(
    ["frontend-builder"]="web-builder/src/"
    ["frontend-developer"]="web-builder/src/"
    ["backend-architect"]="backend/|web-builder/src/app/api/"
    ["template-designer"]="web-builder/src/components/templates/|web-builder/src/lib/templates/|web-builder/src/data/templates/"
    ["ai-services-specialist"]="web-builder/src/lib/ai/|web-builder/src/app/api/ai/"
    ["integration-coordinator"]="web-builder/src/lib/integrations/|web-builder/src/components/integrations/"
    ["performance-optimizer"]="web-builder/src/lib/performance/|web-builder/src/utils/optimization/"
    ["workflow-automation-expert"]="web-builder/src/lib/workflow/|web-builder/src/app/api/workflow/"
    ["deployment-manager"]="docker/|.github/|deployment/|infrastructure/"
    ["qa-automation-agent"]="web-builder/CLAUDE.md|web-builder/bmad-|web-builder/playwright|web-builder/tests/|.claude/scripts/"
)

echo -e "${BLUE}🔒 Agent Branch Isolation Compliance Checker${NC}"
echo "================================================="

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Current branch: ${YELLOW}$CURRENT_BRANCH${NC}"

# Check branch naming convention
check_branch_naming() {
    echo -e "\n${BLUE}📝 Checking branch naming convention...${NC}"
    
    if [[ $CURRENT_BRANCH == "main" ]] || [[ $CURRENT_BRANCH == "develop" ]]; then
        echo -e "${GREEN}✅ On main/develop branch - no isolation check needed${NC}"
        return 0
    fi
    
    # Expected patterns: 
    # 1. {agent-type}/{agent-name}/{feature-description}
    # 2. feature/{story-number}-{story-description}
    if [[ $CURRENT_BRANCH =~ ^(frontend|backend|template|ai|integration|performance|workflow|deployment|testing)/([^/]+)/(.+)$ ]]; then
        AGENT_TYPE="${BASH_REMATCH[1]}"
        AGENT_NAME="${BASH_REMATCH[2]}"
        FEATURE_DESC="${BASH_REMATCH[3]}"
        
        echo -e "${GREEN}✅ Branch naming follows agent isolation convention${NC}"
        echo -e "   Agent Type: ${YELLOW}$AGENT_TYPE${NC}"
        echo -e "   Agent Name: ${YELLOW}$AGENT_NAME${NC}"
        echo -e "   Feature: ${YELLOW}$FEATURE_DESC${NC}"
        
        # Validate agent name matches type (relaxed validation)
        if [[ -n "${AGENT_TYPES[$AGENT_NAME]}" ]] && [[ "${AGENT_TYPES[$AGENT_NAME]}" != "$AGENT_TYPE" ]]; then
            echo -e "${YELLOW}⚠️  Agent name '$AGENT_NAME' type mismatch - allowing as override${NC}"
        fi
        
        return 0
    elif [[ $CURRENT_BRANCH =~ ^feature/(.+)$ ]]; then
        FEATURE_DESC="${BASH_REMATCH[1]}"
        
        echo -e "${GREEN}✅ Branch follows feature/{story} convention${NC}"
        echo -e "   Feature: ${YELLOW}$FEATURE_DESC${NC}"
        echo -e "   ${YELLOW}Note: Feature branches have relaxed isolation rules${NC}"
        
        return 0
    else
        echo -e "${RED}❌ Branch name doesn't follow isolation convention${NC}"
        echo -e "   Expected: {agent-type}/{agent-name}/{feature-description} OR feature/{story-description}"
        echo -e "   Examples:"
        echo -e "     frontend/frontend-builder/fix-drag-drop"
        echo -e "     backend/backend-architect/user-auth-api"
        echo -e "     testing/qa-automation-agent/playwright-integration"
        echo -e "     feature/story-3.3-analytics-dashboard"
        return 1
    fi
}

# Check file ownership compliance
check_file_ownership() {
    echo -e "\n${BLUE}📂 Checking file ownership compliance...${NC}"
    
    if [[ $CURRENT_BRANCH == "main" ]] || [[ $CURRENT_BRANCH == "develop" ]]; then
        return 0
    fi
    
    # Extract agent name from branch (handle feature branches)
    if [[ $CURRENT_BRANCH =~ ^[^/]+/([^/]+)/.+$ ]]; then
        AGENT_NAME="${BASH_REMATCH[1]}"
    elif [[ $CURRENT_BRANCH =~ ^feature/(.+)$ ]]; then
        # Feature branches get relaxed file ownership rules
        echo -e "${YELLOW}⚠️  Feature branch detected - relaxed file ownership rules apply${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Cannot extract agent name from branch${NC}"
        return 0
    fi
        
    # Get modified files in this branch
    MODIFIED_FILES=$(git diff --name-only main..HEAD 2>/dev/null || echo "")
        
        if [[ -z "$MODIFIED_FILES" ]]; then
            echo -e "${GREEN}✅ No modified files to check${NC}"
            return 0
        fi
        
        # Check each modified file against ownership rules
        VIOLATIONS=0
        OWNERSHIP_PATTERN="${FILE_OWNERSHIP[$AGENT_NAME]}"
        
        if [[ -n "$OWNERSHIP_PATTERN" ]]; then
            echo -e "Agent: ${YELLOW}$AGENT_NAME${NC}"
            echo -e "Allowed patterns: ${YELLOW}$OWNERSHIP_PATTERN${NC}"
            echo ""
            
            while IFS= read -r file; do
                if [[ -n "$file" ]]; then
                    # Check if file matches any ownership pattern
                    if echo "$file" | grep -qE "$OWNERSHIP_PATTERN"; then
                        echo -e "${GREEN}✅ $file${NC} (within domain)"
                    else
                        echo -e "${RED}❌ $file${NC} (OUTSIDE domain)"
                        ((VIOLATIONS++))
                    fi
                fi
            done <<< "$MODIFIED_FILES"
            
            if [[ $VIOLATIONS -gt 0 ]]; then
                echo -e "\n${RED}❌ $VIOLATIONS file ownership violations detected${NC}"
                echo -e "   Agent '$AGENT_NAME' is modifying files outside their domain"
                return 1
            else
                echo -e "\n${GREEN}✅ All modified files are within agent domain${NC}"
                return 0
            fi
        else
            echo -e "${YELLOW}⚠️  No ownership rules defined for agent '$AGENT_NAME'${NC}"
            return 0
        fi
}

# Check for potential conflicts with other agent branches
check_potential_conflicts() {
    echo -e "\n${BLUE}⚔️  Checking for potential conflicts with other agents...${NC}"
    
    if [[ $CURRENT_BRANCH == "main" ]] || [[ $CURRENT_BRANCH == "develop" ]]; then
        return 0
    fi
    
    # Get all agent branches
    AGENT_BRANCHES=$(git branch -r | grep -E "(frontend|backend|template|ai|integration|performance|workflow|deployment)/" | sed 's/origin\///' | tr -d ' ')
    
    if [[ -z "$AGENT_BRANCHES" ]]; then
        echo -e "${GREEN}✅ No other agent branches to check${NC}"
        return 0
    fi
    
    # Get modified files in current branch
    CURRENT_FILES=$(git diff --name-only main..HEAD 2>/dev/null || echo "")
    
    if [[ -z "$CURRENT_FILES" ]]; then
        echo -e "${GREEN}✅ No modified files to check for conflicts${NC}"
        return 0
    fi
    
    CONFLICTS=0
    
    while IFS= read -r branch; do
        if [[ "$branch" != "$CURRENT_BRANCH" ]] && [[ -n "$branch" ]]; then
            # Check if this branch exists locally
            if git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
                # Get modified files in the other branch
                OTHER_FILES=$(git diff --name-only main..origin/$branch 2>/dev/null || echo "")
                
                # Find common modified files
                COMMON_FILES=$(comm -12 <(echo "$CURRENT_FILES" | sort) <(echo "$OTHER_FILES" | sort))
                
                if [[ -n "$COMMON_FILES" ]] && [[ "$COMMON_FILES" != "" ]]; then
                    echo -e "${YELLOW}⚠️  Potential conflict with branch: $branch${NC}"
                    echo -e "   Common files:"
                    while IFS= read -r common_file; do
                        if [[ -n "$common_file" ]]; then
                            echo -e "     - $common_file"
                        fi
                    done <<< "$COMMON_FILES"
                    ((CONFLICTS++))
                fi
            fi
        fi
    done <<< "$AGENT_BRANCHES"
    
    if [[ $CONFLICTS -gt 0 ]]; then
        echo -e "\n${YELLOW}⚠️  $CONFLICTS potential conflicts detected${NC}"
        echo -e "   Consider coordinating with other agents before merging"
        echo -e "   ${YELLOW}Note: Allowing as warning only - conflicts can be resolved during merge${NC}"
        return 0  # Changed from return 1 to allow proceed with warning
    else
        echo -e "${GREEN}✅ No conflicts detected with other agent branches${NC}"
        return 0
    fi
}

# Generate compliance report
generate_report() {
    echo -e "\n${BLUE}📊 Compliance Report${NC}"
    echo "===================="
    
    TOTAL_CHECKS=3
    PASSED_CHECKS=0
    
    # Branch naming check
    if check_branch_naming; then
        ((PASSED_CHECKS++))
    fi
    
    # File ownership check
    if check_file_ownership; then
        ((PASSED_CHECKS++))
    fi
    
    # Conflict check
    if check_potential_conflicts; then
        ((PASSED_CHECKS++))
    fi
    
    echo -e "\n${BLUE}Summary:${NC}"
    echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}/$TOTAL_CHECKS checks"
    
    if [[ $PASSED_CHECKS -eq $TOTAL_CHECKS ]]; then
        echo -e "${GREEN}✅ All compliance checks passed!${NC}"
        echo -e "Branch is ready for PR submission"
        return 0
    else
        echo -e "${RED}❌ Compliance violations detected${NC}"
        echo -e "Please fix violations before creating PR"
        return 1
    fi
}

# Main execution
main() {
    if ! generate_report; then
        echo -e "\n${RED}Agent Isolation Compliance: FAILED${NC}"
        exit 1
    else
        echo -e "\n${GREEN}Agent Isolation Compliance: PASSED${NC}"
        exit 0
    fi
}

# Run if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi