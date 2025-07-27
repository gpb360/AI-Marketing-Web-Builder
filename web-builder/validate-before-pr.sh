#!/bin/bash

# Frontend Validation Script - ZERO TOLERANCE FOR FAILING CHECKS
set -e

PROJECT_NAME=${1:-"frontend"}
echo "🛠️  VALIDATING $PROJECT_NAME - ZERO TOLERANCE FOR FAILURES"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check command success
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 PASSED${NC}"
    else
        echo -e "${RED}❌ $1 FAILED${NC}"
        echo -e "${RED}🚨 FIX THIS BEFORE PROCEEDING!${NC}"
        exit 1
    fi
}

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install
check_success "DEPENDENCY INSTALLATION"

echo -e "${YELLOW}🔨 Running build check...${NC}"
npm run build
check_success "BUILD"

echo -e "${YELLOW}🔍 Running lint check...${NC}"
npm run lint
check_success "LINT"

echo -e "${YELLOW}📝 Running type check...${NC}"
npm run type-check
check_success "TYPE CHECK"

echo -e "${YELLOW}🧪 Running tests...${NC}"
npm test -- --passWithNoTests
check_success "TESTS"

echo ""
echo -e "${GREEN}🎉 ALL CHECKS PASSED! READY FOR PR!${NC}"
echo -e "${GREEN}✅ Build: PASSED${NC}"
echo -e "${GREEN}✅ Lint: PASSED${NC}"
echo -e "${GREEN}✅ Type Check: PASSED${NC}"
echo -e "${GREEN}✅ Tests: PASSED${NC}"
echo ""
echo "🚀 Your code is ready for production!"