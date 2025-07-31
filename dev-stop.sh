#!/bin/bash
# AI Marketing Web Builder - Stop Development Services

echo "🛑 Stopping AI Marketing Web Builder Development Environment..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Kill processes by PID if files exist
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${YELLOW}🔧 Stopping Backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID
    fi
    rm -f .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${YELLOW}🎨 Stopping Frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID
    fi
    rm -f .frontend.pid
fi

# Kill any remaining processes on ports 8000 and 3000
echo -e "${YELLOW}🧹 Cleaning up any remaining processes...${NC}"
pkill -f "uvicorn.*8000" 2>/dev/null || true
pkill -f "next.*3000" 2>/dev/null || true
pkill -f "python3.*test_basic" 2>/dev/null || true

# Clean up log files
rm -f backend.log frontend.log

echo -e "${GREEN}✅ All services stopped successfully!${NC}"
echo -e "${GREEN}🎯 Development environment is clean.${NC}"