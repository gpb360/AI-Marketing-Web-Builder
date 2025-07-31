#!/bin/bash
# AI Marketing Web Builder - Check Development Status

echo "📊 AI Marketing Web Builder - Development Status"
echo "================================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check Backend Status
echo -e "${BLUE}🔧 Backend Status:${NC}"
if check_port 8000; then
    echo -e "   • Port 8000: ${GREEN}✅ RUNNING${NC}"
    echo -e "   • API: ${GREEN}http://localhost:8000${NC}"
    echo -e "   • Docs: ${GREEN}http://localhost:8000/docs${NC}"
    
    # Test API endpoint
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo -e "   • Health Check: ${GREEN}✅ HEALTHY${NC}"
    else
        echo -e "   • Health Check: ${YELLOW}⚠️ NO RESPONSE${NC}"
    fi
else
    echo -e "   • Port 8000: ${RED}❌ NOT RUNNING${NC}"
fi

echo ""

# Check Frontend Status  
echo -e "${BLUE}🎨 Frontend Status:${NC}"
if check_port 3000; then
    echo -e "   • Port 3000: ${GREEN}✅ RUNNING${NC}"
    echo -e "   • App: ${GREEN}http://localhost:3000${NC}"
    
    # Test frontend endpoint
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "   • Health Check: ${GREEN}✅ RESPONSIVE${NC}"
    else
        echo -e "   • Health Check: ${YELLOW}⚠️ NO RESPONSE${NC}"
    fi
else
    echo -e "   • Port 3000: ${RED}❌ NOT RUNNING${NC}"
fi

echo ""

# Check Process Status
echo -e "${BLUE}🔄 Process Status:${NC}"
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "   • Backend Process: ${GREEN}✅ RUNNING (PID: $BACKEND_PID)${NC}"
    else
        echo -e "   • Backend Process: ${RED}❌ DEAD (PID: $BACKEND_PID)${NC}"
    fi
else
    echo -e "   • Backend Process: ${YELLOW}⚠️ NO PID FILE${NC}"
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "   • Frontend Process: ${GREEN}✅ RUNNING (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "   • Frontend Process: ${RED}❌ DEAD (PID: $FRONTEND_PID)${NC}"
    fi
else
    echo -e "   • Frontend Process: ${YELLOW}⚠️ NO PID FILE${NC}"
fi

echo ""

# Check Log Files
echo -e "${BLUE}📋 Logs:${NC}"
if [ -f backend.log ]; then
    BACKEND_LOG_SIZE=$(wc -l < backend.log)
    echo -e "   • Backend Log: ${GREEN}✅ AVAILABLE (${BACKEND_LOG_SIZE} lines)${NC}"
    echo -e "     View with: ${YELLOW}tail -f backend.log${NC}"
else
    echo -e "   • Backend Log: ${YELLOW}⚠️ NOT FOUND${NC}"
fi

if [ -f frontend.log ]; then
    FRONTEND_LOG_SIZE=$(wc -l < frontend.log)
    echo -e "   • Frontend Log: ${GREEN}✅ AVAILABLE (${FRONTEND_LOG_SIZE} lines)${NC}"
    echo -e "     View with: ${YELLOW}tail -f frontend.log${NC}"
else
    echo -e "   • Frontend Log: ${YELLOW}⚠️ NOT FOUND${NC}"
fi

echo ""

# Overall Status
BACKEND_OK=$(check_port 8000 && echo "1" || echo "0")
FRONTEND_OK=$(check_port 3000 && echo "1" || echo "0")

if [ "$BACKEND_OK" = "1" ] && [ "$FRONTEND_OK" = "1" ]; then
    echo -e "${GREEN}🎉 Overall Status: FULLY OPERATIONAL${NC}"
elif [ "$BACKEND_OK" = "1" ] || [ "$FRONTEND_OK" = "1" ]; then
    echo -e "${YELLOW}⚠️ Overall Status: PARTIALLY RUNNING${NC}"
else
    echo -e "${RED}❌ Overall Status: NOT RUNNING${NC}"
    echo -e "${YELLOW}💡 Start with: ./dev-start.sh${NC}"
fi

echo ""