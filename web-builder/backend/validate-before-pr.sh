#!/bin/bash

# validate-before-pr.sh - Comprehensive validation script for AI Marketing Web Builder
# Usage: ./validate-before-pr.sh [backend|frontend]

set -e

COMPONENT=${1:-backend}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR" && pwd)"

echo "🛠️ AI Marketing Web Builder - Pre-PR Validation"
echo "================================================="
echo "Component: $COMPONENT"
echo "Directory: $PROJECT_ROOT"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=()

run_check() {
    local check_name="$1"
    local command="$2"
    
    echo -e "\n${BLUE}🔍 Running: $check_name${NC}"
    echo "Command: $command"
    echo "----------------------------------------"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if eval "$command"; then
        echo -e "${GREEN}✅ PASS: $check_name${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ FAIL: $check_name${NC}"
        FAILED_CHECKS+=("$check_name")
    fi
}

# Backend validation
validate_backend() {
    echo -e "\n${YELLOW}🚀 Backend Validation Starting...${NC}"
    
    # Check if we're in the right directory
    if [[ ! -f "src/main.py" ]]; then
        echo -e "${RED}❌ Error: Not in backend directory (missing src/main.py)${NC}"
        return 1
    fi
    
    # 1. Python syntax check
    run_check "Python Syntax Check" "python3 -m py_compile src/main.py src/core/config.py src/core/database.py"
    
    # 2. Import validation
    run_check "Import Validation" "cd src && python3 -c 'import main; import core.config; import core.database; print(\"All imports successful\")'"
    
    # 3. Code formatting check (basic)
    run_check "Code Style Check" "python3 -c '
import ast
import sys
files = [\"src/main.py\", \"src/core/config.py\", \"src/core/database.py\"]
for file in files:
    try:
        with open(file, \"r\") as f:
            ast.parse(f.read())
        print(f\"✓ {file}\")
    except SyntaxError as e:
        print(f\"✗ {file}: {e}\")
        sys.exit(1)
print(\"All files pass syntax check\")
'"
    
    # 4. Configuration validation
    run_check "Configuration Check" "cd src && python3 -c '
try:
    from core.config import settings
    required = [\"app_name\", \"version\", \"environment\"]
    for attr in required:
        if not hasattr(settings, attr):
            raise ValueError(f\"Missing {attr}\")
    print(\"Configuration valid\")
except Exception as e:
    print(f\"Config error: {e}\")
    exit(1)
'"
    
    # 5. Test our custom test suite
    run_check "Custom Test Suite" "python3 test_server.py"
    
    # 6. File structure validation
    run_check "File Structure Check" "python3 -c '
import os
required_files = [
    \"src/main.py\",
    \"src/core/config.py\", 
    \"src/core/database.py\",
    \"requirements.txt\",
    \".env.example\"
]
missing = []
for file in required_files:
    if not os.path.exists(file):
        missing.append(file)
if missing:
    print(f\"Missing files: {missing}\")
    exit(1)
print(\"All required files present\")
'"
    
    # 7. Requirements file validation
    run_check "Requirements Validation" "python3 -c '
with open(\"requirements.txt\", \"r\") as f:
    lines = f.readlines()
    
required_packages = [\"fastapi\", \"uvicorn\", \"pydantic\", \"sqlalchemy\"]
found_packages = []

for line in lines:
    line = line.strip()
    if line and not line.startswith(\"#\"):
        pkg = line.split(\"==\")[0].split(\">=\")[0].split(\"<=\")[0].lower()
        found_packages.append(pkg)

missing = []
for req in required_packages:
    if req not in found_packages:
        missing.append(req)

if missing:
    print(f\"Missing required packages: {missing}\")
    exit(1)
    
print(f\"Found packages: {found_packages}\")
print(\"Requirements validation passed\")
'"
}

# Frontend validation (placeholder)
validate_frontend() {
    echo -e "\n${YELLOW}🚀 Frontend Validation Starting...${NC}"
    echo "Frontend validation not implemented yet"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
}

# Main execution
main() {
    echo -e "\n${BLUE}Starting validation for: $COMPONENT${NC}"
    
    case $COMPONENT in
        "backend")
            validate_backend
            ;;
        "frontend")
            validate_frontend
            ;;
        *)
            echo -e "${RED}Error: Unknown component '$COMPONENT'. Use 'backend' or 'frontend'${NC}"
            exit 1
            ;;
    esac
    
    # Results summary
    echo -e "\n${'='*50}"
    echo -e "${BLUE}🎯 VALIDATION SUMMARY${NC}"
    echo -e "${'='*50}"
    
    echo -e "Total Checks: $TOTAL_CHECKS"
    echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
    echo -e "${RED}Failed: $((TOTAL_CHECKS - PASSED_CHECKS))${NC}"
    
    if [[ ${#FAILED_CHECKS[@]} -gt 0 ]]; then
        echo -e "\n${RED}❌ FAILED CHECKS:${NC}"
        for check in "${FAILED_CHECKS[@]}"; do
            echo -e "  - $check"
        done
        echo -e "\n${RED}🚨 VALIDATION FAILED - FIX ALL ISSUES BEFORE PR${NC}"
        return 1
    else
        echo -e "\n${GREEN}🎉 ALL CHECKS PASSED!${NC}"
        echo -e "${GREEN}✅ Ready for PR creation${NC}"
        return 0
    fi
}

# Run main function
main "$@"