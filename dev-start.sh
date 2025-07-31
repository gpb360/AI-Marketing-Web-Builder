#!/bin/bash
# AI Marketing Web Builder - Development Startup Script
# Starts both backend and frontend services for testing

echo "🚀 Starting AI Marketing Web Builder Development Environment..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Kill existing processes on ports 8000 and 3000
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
pkill -f "uvicorn.*8000" 2>/dev/null || true
pkill -f "next.*3000" 2>/dev/null || true
sleep 2

# Start Backend (FastAPI on port 8000)
echo -e "${BLUE}🔧 Starting Backend (FastAPI)...${NC}"
cd backend

# Check if Python dependencies are installed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    export PATH=$PATH:/home/gboyd/.local/bin
    pip3 install --user fastapi uvicorn pydantic-settings python-dotenv
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚙️ Creating backend .env file...${NC}"
    cat > .env << EOF
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=sqlite:///./dev.db
ENVIRONMENT=development
DEBUG=true
EOF
fi

# Start backend in background
echo -e "${GREEN}🚀 Launching Backend on http://localhost:8000${NC}"
export PATH=$PATH:/home/gboyd/.local/bin
nohup python3 test_basic.py > backend.log 2>&1 &
BACKEND_PID=$!

# Give backend time to start
sleep 3

# Check if backend started successfully
if check_port 8000; then
    echo -e "${GREEN}✅ Backend running on port 8000${NC}"
else
    echo -e "${RED}❌ Backend failed to start. Check backend.log${NC}"
fi

# Start Frontend (Next.js on port 3000)
echo -e "${BLUE}🎨 Starting Frontend (Next.js)...${NC}"
cd ../web-builder

# Check if node_modules exists and has next
if [ ! -f "node_modules/.bin/next" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install --silent
fi

# Start frontend in background
echo -e "${GREEN}🚀 Launching Frontend on http://localhost:3000${NC}"
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Give frontend time to start
sleep 5

# Check if frontend started successfully
if check_port 3000; then
    echo -e "${GREEN}✅ Frontend running on port 3000${NC}"
else
    echo -e "${RED}❌ Frontend failed to start. Check frontend.log${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Development Environment Started!${NC}"
echo ""
echo -e "${BLUE}📍 Services:${NC}"
echo -e "   • Backend API:  ${GREEN}http://localhost:8000${NC}"
echo -e "   • Frontend App: ${GREEN}http://localhost:3000${NC}"
echo -e "   • API Docs:     ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}📋 Management:${NC}"
echo -e "   • View backend logs: ${GREEN}tail -f backend.log${NC}"
echo -e "   • View frontend logs: ${GREEN}tail -f frontend.log${NC}"
echo -e "   • Stop all services: ${GREEN}./dev-stop.sh${NC}"
echo ""
echo -e "${BLUE}🔧 Process IDs:${NC}"
echo -e "   • Backend PID: $BACKEND_PID"
echo -e "   • Frontend PID: $FRONTEND_PID"

# Save PIDs for stop script
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo ""
echo -e "${GREEN}✨ Ready for development! Press Ctrl+C to stop or run ./dev-stop.sh${NC}"

# Wait for user interrupt
trap 'echo -e "\n${YELLOW}🛑 Stopping services...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT
wait