#!/bin/bash

# Pre-commit hook for agent isolation compliance
# Prevents commits that violate agent isolation rules

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
    ["backend-architect"]="backend"
    ["template-designer"]="template"
    ["ai-services-specialist"]="ai"
    ["integration-coordinator"]="integration"
    ["performance-optimizer"]="performance"
    ["workflow-automation-expert"]="workflow"
    ["deployment-manager"]="deployment"
)

# File ownership patterns (same as in branch-isolation-check.sh)
declare -A FILE_OWNERSHIP=(
    ["frontend-builder"]="web-builder/src/components/builder/|web-builder/src/components/ui/|web-builder/src/hooks/|web-builder/src/lib/"
    ["backend-architect"]="backend/|web-builder/src/app/api/"
    ["template-designer"]="web-builder/src/components/templates/|web-builder/src/lib/templates/|web-builder/src/data/templates/"
    ["ai-services-specialist"]="web-builder/src/lib/ai/|web-builder/src/app/api/ai/"
    ["integration-coordinator"]="web-builder/src/lib/integrations/|web-builder/src/components/integrations/"
    ["performance-optimizer"]="web-builder/src/lib/performance/|web-builder/src/utils/optimization/"
    ["workflow-automation-expert"]="web-builder/src/lib/workflow/|web-builder/src/app/api/workflow/"
    ["deployment-manager"]="docker/|.github/|deployment/|infrastructure/"
)

echo -e "${BLUE}🔒 Pre-commit Agent Isolation Check${NC}"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Skip checks for main/develop branches
if [[ $CURRENT_BRANCH == "main" ]] || [[ $CURRENT_BRANCH == "develop" ]]; then
    echo -e "${GREEN}✅ On main/develop branch - skipping agent isolation checks${NC}"
    exit 0
fi

# Check if branch follows agent naming convention
if [[ ! $CURRENT_BRANCH =~ ^(frontend|backend|template|ai|integration|performance|workflow|deployment)/([^/]+)/(.+)$ ]]; then
    echo -e "${RED}❌ COMMIT BLOCKED: Branch name doesn't follow agent isolation convention${NC}"
    echo -e "   Current branch: ${YELLOW}$CURRENT_BRANCH${NC}"
    echo -e "   Expected format: {agent-type}/{agent-name}/{feature-description}"
    echo -e "   Examples:"
    echo -e "     frontend/frontend-builder/fix-drag-drop"
    echo -e "     backend/backend-architect/user-auth-api"
    echo -e "     template/template-designer/saas-templates"
    echo ""
    echo -e "${BLUE}💡 Use the branch creation tool:${NC}"
    echo -e "   .claude/scripts/agent-branch-create.sh"
    exit 1
fi

AGENT_TYPE="${BASH_REMATCH[1]}"
AGENT_NAME="${BASH_REMATCH[2]}"
FEATURE_DESC="${BASH_REMATCH[3]}"

# Validate agent name matches type
if [[ "${AGENT_TYPES[$AGENT_NAME]}" != "$AGENT_TYPE" ]]; then
    echo -e "${RED}❌ COMMIT BLOCKED: Agent name '$AGENT_NAME' doesn't match type '$AGENT_TYPE'${NC}"
    echo -e "   Expected type for $AGENT_NAME: ${YELLOW}${AGENT_TYPES[$AGENT_NAME]}${NC}"
    exit 1
fi

# Get staged files
STAGED_FILES=$(git diff --cached --name-only)

if [[ -z "$STAGED_FILES" ]]; then
    echo -e "${GREEN}✅ No staged files to check${NC}"
    exit 0
fi

# Check file ownership compliance
VIOLATIONS=0
OWNERSHIP_PATTERN="${FILE_OWNERSHIP[$AGENT_NAME]}"

if [[ -n "$OWNERSHIP_PATTERN" ]]; then
    echo -e "Agent: ${YELLOW}$AGENT_NAME${NC} (${AGENT_TYPE})"
    echo -e "Checking staged files against ownership rules..."
    echo ""
    
    while IFS= read -r file; do
        if [[ -n "$file" ]]; then
            # Check if file matches any ownership pattern
            if echo "$file" | grep -qE "$OWNERSHIP_PATTERN"; then
                echo -e "${GREEN}✅ $file${NC}"
            else
                echo -e "${RED}❌ $file${NC} (OUTSIDE agent domain)"
                ((VIOLATIONS++))
            fi
        fi
    done <<< "$STAGED_FILES"
    
    if [[ $VIOLATIONS -gt 0 ]]; then
        echo ""
        echo -e "${RED}❌ COMMIT BLOCKED: $VIOLATIONS file ownership violations${NC}"
        echo -e "Agent '$AGENT_NAME' is trying to modify files outside their domain"
        echo ""
        echo -e "${BLUE}Allowed file patterns for $AGENT_NAME:${NC}"
        echo -e "   ${YELLOW}${OWNERSHIP_PATTERN/|/$'\n   '}${NC}"
        echo ""
        echo -e "${BLUE}💡 Solutions:${NC}"
        echo -e "1. Remove files outside your domain from staging:"
        echo -e "   git reset HEAD <file>"
        echo -e "2. Coordinate with the appropriate agent for those files"
        echo -e "3. Use handoff procedure if work needs to continue"
        exit 1
    fi
fi

# Check commit message format
COMMIT_MSG_FILE="$1"
if [[ -n "$COMMIT_MSG_FILE" ]] && [[ -f "$COMMIT_MSG_FILE" ]]; then
    COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")
    EXPECTED_PREFIX="[${AGENT_NAME^^}]"
    
    if [[ ! "$COMMIT_MSG" =~ ^\[${AGENT_NAME^^}\] ]]; then
        echo -e "${YELLOW}⚠️  WARNING: Commit message should start with ${EXPECTED_PREFIX}${NC}"
        echo -e "   Current message: ${YELLOW}$COMMIT_MSG${NC}"
        echo -e "   Recommended format: ${EXPECTED_PREFIX} Brief description"
        echo ""
        echo -e "${BLUE}💡 Example commit messages:${NC}"
        echo -e "   [${AGENT_NAME^^}] Fix drag-drop performance issues"
        echo -e "   [${AGENT_NAME^^}] Add user authentication endpoints"
        echo -e "   [${AGENT_NAME^^}] Create premium SaaS templates"
        echo ""
        # Don't block for message format, just warn
    fi
fi

# Check for large files or suspicious changes
check_file_safety() {
    local max_size=1048576  # 1MB in bytes
    local violations=0
    
    while IFS= read -r file; do
        if [[ -n "$file" ]] && [[ -f "$file" ]]; then
            # Check file size
            local file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
            if [[ $file_size -gt $max_size ]]; then
                echo -e "${YELLOW}⚠️  Large file: $file ($(($file_size / 1024))KB)${NC}"
                ((violations++))
            fi
            
            # Check for sensitive patterns
            if grep -qE "(password|secret|key|token)" "$file" 2>/dev/null; then
                echo -e "${YELLOW}⚠️  Potential sensitive data in: $file${NC}"
            fi
        fi
    done <<< "$STAGED_FILES"
    
    if [[ $violations -gt 0 ]]; then
        echo -e "${YELLOW}⚠️  Found $violations large files (>1MB)${NC}"
        echo -e "Consider using Git LFS for large assets"
    fi
}

check_file_safety

echo ""
echo -e "${GREEN}✅ Agent isolation compliance check passed${NC}"
echo -e "Proceeding with commit for agent: ${YELLOW}$AGENT_NAME${NC}"

exit 0