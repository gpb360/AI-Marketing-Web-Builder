#!/bin/bash

# Install Git hooks for agent isolation compliance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo -e "${BLUE}🔧 Installing Agent Isolation Git Hooks${NC}"
echo "========================================"

# Check if we're in a git repository
if [[ ! -d "$PROJECT_ROOT/.git" ]]; then
    echo -e "${RED}❌ Not in a git repository${NC}"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Install pre-commit hook
echo -e "\n${BLUE}📝 Installing pre-commit hook...${NC}"
PRE_COMMIT_HOOK="$HOOKS_DIR/pre-commit"

cat > "$PRE_COMMIT_HOOK" << 'EOF'
#!/bin/bash

# Agent Isolation Pre-commit Hook
# Automatically run agent isolation compliance checks

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AGENT_CHECK_SCRIPT="$PROJECT_ROOT/.claude/scripts/pre-commit-agent-check.sh"

# Check if agent check script exists
if [[ -f "$AGENT_CHECK_SCRIPT" ]]; then
    # Run agent isolation check
    bash "$AGENT_CHECK_SCRIPT" "$1"
    exit_code=$?
    
    if [[ $exit_code -ne 0 ]]; then
        echo ""
        echo "🔒 Agent isolation compliance check failed"
        echo "Commit blocked to prevent conflicts"
        echo ""
        echo "💡 Run compliance check manually:"
        echo "   .claude/scripts/branch-isolation-check.sh"
        exit 1
    fi
else
    echo "⚠️  Agent isolation check script not found"
    echo "Proceeding without agent isolation validation"
fi

# If we get here, all checks passed
exit 0
EOF

chmod +x "$PRE_COMMIT_HOOK"
echo -e "${GREEN}✅ Pre-commit hook installed${NC}"

# Install prepare-commit-msg hook for automatic commit message formatting
echo -e "\n${BLUE}📝 Installing prepare-commit-msg hook...${NC}"
PREPARE_COMMIT_HOOK="$HOOKS_DIR/prepare-commit-msg"

cat > "$PREPARE_COMMIT_HOOK" << 'EOF'
#!/bin/bash

# Agent Isolation Prepare Commit Message Hook
# Automatically format commit messages with agent prefix

COMMIT_MSG_FILE="$1"
COMMIT_SOURCE="$2"
COMMIT_SHA="$3"

# Only modify message for regular commits (not merges, rebases, etc.)
if [[ "$COMMIT_SOURCE" != "" ]] && [[ "$COMMIT_SOURCE" != "message" ]]; then
    exit 0
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Skip for main/develop branches
if [[ $CURRENT_BRANCH == "main" ]] || [[ $CURRENT_BRANCH == "develop" ]]; then
    exit 0
fi

# Extract agent name from branch if it follows convention
if [[ $CURRENT_BRANCH =~ ^[^/]+/([^/]+)/.+$ ]]; then
    AGENT_NAME="${BASH_REMATCH[1]}"
    AGENT_PREFIX="[${AGENT_NAME^^}]"
    
    # Read current commit message
    CURRENT_MSG=$(cat "$COMMIT_MSG_FILE")
    
    # Only add prefix if it's not already there
    if [[ ! "$CURRENT_MSG" =~ ^\[${AGENT_NAME^^}\] ]]; then
        # If message is empty or just whitespace/comments, add template
        if [[ -z "$(echo "$CURRENT_MSG" | grep -v '^#' | tr -d '[:space:]')" ]]; then
            cat > "$COMMIT_MSG_FILE" << EOL
$AGENT_PREFIX Brief description of changes

- Specific change 1
- Specific change 2
- Files modified: [list key files]

# Agent: $AGENT_NAME
# Branch: $CURRENT_BRANCH
# 
# Commit message format:
# [$AGENT_PREFIX] Brief description
# 
# - Use bullet points for specific changes
# - List key files modified
# - Keep under 72 characters per line
#
# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
EOL
        else
            # Prepend agent prefix to existing message
            echo "$AGENT_PREFIX $CURRENT_MSG" > "$COMMIT_MSG_FILE"
        fi
    fi
fi

exit 0
EOF

chmod +x "$PREPARE_COMMIT_HOOK"
echo -e "${GREEN}✅ Prepare-commit-msg hook installed${NC}"

# Install post-commit hook for automatic compliance reporting
echo -e "\n${BLUE}📝 Installing post-commit hook...${NC}"
POST_COMMIT_HOOK="$HOOKS_DIR/post-commit"

cat > "$POST_COMMIT_HOOK" << 'EOF'
#!/bin/bash

# Agent Isolation Post-commit Hook
# Report successful commits and provide next steps

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Skip for main/develop branches
if [[ $CURRENT_BRANCH == "main" ]] || [[ $CURRENT_BRANCH == "develop" ]]; then
    exit 0
fi

# Extract agent info from branch
if [[ $CURRENT_BRANCH =~ ^([^/]+)/([^/]+)/(.+)$ ]]; then
    AGENT_TYPE="${BASH_REMATCH[1]}"
    AGENT_NAME="${BASH_REMATCH[2]}"
    FEATURE_DESC="${BASH_REMATCH[3]}"
    
    echo ""
    echo -e "${GREEN}✅ Commit successful for agent: $AGENT_NAME${NC}"
    echo -e "Branch: ${YELLOW}$CURRENT_BRANCH${NC}"
    
    # Get commit info
    COMMIT_HASH=$(git rev-parse --short HEAD)
    COMMIT_MSG=$(git log -1 --pretty=%s)
    
    echo -e "Commit: ${YELLOW}$COMMIT_HASH${NC} - $COMMIT_MSG"
    
    # Show next steps
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "1. Continue working on your agent domain files"
    echo -e "2. Run compliance check: .claude/scripts/branch-isolation-check.sh"
    echo -e "3. When ready, create PR with title: [$AGENT_NAME] Feature: $FEATURE_DESC"
    echo -e "4. Use PR template with agent isolation checklist"
    echo ""
fi

exit 0
EOF

chmod +x "$POST_COMMIT_HOOK"
echo -e "${GREEN}✅ Post-commit hook installed${NC}"

# Create pre-push hook to prevent pushing non-compliant branches
echo -e "\n${BLUE}📝 Installing pre-push hook...${NC}"
PRE_PUSH_HOOK="$HOOKS_DIR/pre-push"

cat > "$PRE_PUSH_HOOK" << 'EOF'
#!/bin/bash

# Agent Isolation Pre-push Hook
# Final compliance check before pushing to remote

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPLIANCE_SCRIPT="$PROJECT_ROOT/.claude/scripts/branch-isolation-check.sh"

echo -e "${BLUE}🔒 Pre-push Agent Isolation Check${NC}"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Skip for main/develop branches
if [[ $CURRENT_BRANCH == "main" ]] || [[ $CURRENT_BRANCH == "develop" ]]; then
    echo -e "${GREEN}✅ Pushing main/develop branch - no isolation check needed${NC}"
    exit 0
fi

# Run full compliance check if script exists
if [[ -f "$COMPLIANCE_SCRIPT" ]]; then
    if ! bash "$COMPLIANCE_SCRIPT"; then
        echo ""
        echo -e "${RED}❌ PUSH BLOCKED: Agent isolation compliance failed${NC}"
        echo -e "Please fix compliance issues before pushing"
        echo ""
        echo -e "${BLUE}💡 Common fixes:${NC}"
        echo -e "1. Ensure branch name follows convention: {agent-type}/{agent-name}/{feature}"
        echo -e "2. Only modify files within your agent domain"
        echo -e "3. Coordinate with other agents for shared files"
        echo -e "4. Use handoff procedure for cross-agent work"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Compliance script not found - proceeding without full check${NC}"
fi

echo -e "${GREEN}✅ Agent isolation compliance passed - pushing to remote${NC}"
exit 0
EOF

chmod +x "$PRE_PUSH_HOOK"
echo -e "${GREEN}✅ Pre-push hook installed${NC}"

# Make all scripts executable
echo -e "\n${BLUE}🔧 Setting script permissions...${NC}"
chmod +x "$SCRIPT_DIR"/*.sh
echo -e "${GREEN}✅ All scripts are now executable${NC}"

# Create symlinks for easy access
echo -e "\n${BLUE}🔗 Creating convenience symlinks...${NC}"
PROJECT_ROOT_SCRIPTS="$PROJECT_ROOT/scripts"
mkdir -p "$PROJECT_ROOT_SCRIPTS"

ln -sf "../.claude/scripts/agent-branch-create.sh" "$PROJECT_ROOT_SCRIPTS/create-agent-branch"
ln -sf "../.claude/scripts/branch-isolation-check.sh" "$PROJECT_ROOT_SCRIPTS/check-isolation"
ln -sf "../.claude/scripts/install-hooks.sh" "$PROJECT_ROOT_SCRIPTS/install-hooks"

echo -e "${GREEN}✅ Convenience symlinks created in scripts/directory${NC}"

# Test hook installation
echo -e "\n${BLUE}🧪 Testing hook installation...${NC}"

# Test if hooks are executable and have correct shebang
HOOKS_INSTALLED=0
for hook in pre-commit prepare-commit-msg post-commit pre-push; do
    hook_file="$HOOKS_DIR/$hook"
    if [[ -x "$hook_file" ]] && head -1 "$hook_file" | grep -q "#!/bin/bash"; then
        echo -e "${GREEN}✅ $hook hook is properly installed${NC}"
        ((HOOKS_INSTALLED++))
    else
        echo -e "${RED}❌ $hook hook installation failed${NC}"
    fi
done

echo ""
echo -e "${BLUE}📊 Installation Summary${NC}"
echo "======================="
echo -e "Hooks installed: ${GREEN}$HOOKS_INSTALLED${NC}/4"
echo -e "Scripts location: ${YELLOW}$SCRIPT_DIR${NC}"
echo -e "Convenience scripts: ${YELLOW}$PROJECT_ROOT_SCRIPTS${NC}"

if [[ $HOOKS_INSTALLED -eq 4 ]]; then
    echo ""
    echo -e "${GREEN}🎉 Agent Isolation System Successfully Installed!${NC}"
    echo ""
    echo -e "${BLUE}Quick Start:${NC}"
    echo -e "1. Create agent branch: ${YELLOW}scripts/create-agent-branch${NC}"
    echo -e "2. Work on files in your domain only"
    echo -e "3. Commit with automatic agent prefix"
    echo -e "4. Check compliance: ${YELLOW}scripts/check-isolation${NC}"
    echo -e "5. Push when ready (automatic final check)"
    echo ""
    echo -e "${BLUE}All commits and pushes will now be automatically validated!${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Some hooks failed to install properly${NC}"
    echo -e "Manual installation may be required"
fi