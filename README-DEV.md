# 🚀 AI Marketing Web Builder - Development Guide

## Quick Start Commands

### Start Both Services
```bash
bash dev-start.sh
```
**Starts:**
- Backend API on http://localhost:8000
- Frontend App on http://localhost:3000

### Check Status
```bash
bash dev-status.sh
```
**Shows:**
- Service status (running/stopped)
- Health checks
- Process IDs
- Log file information

### Stop All Services
```bash  
bash dev-stop.sh
```
**Stops:**
- All backend processes
- All frontend processes
- Cleans up logs and PID files

## Services Overview

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Backend API** | 8000 | http://localhost:8000 | FastAPI backend |
| **Frontend App** | 3000 | http://localhost:3000 | Next.js frontend |
| **API Docs** | 8000 | http://localhost:8000/docs | Interactive API docs |

## Architecture

```
┌─────────────────┐    HTTP API    ┌─────────────────┐
│   Frontend      │◄──────────────►│    Backend      │
│   (Next.js)     │    Port 3000   │   (FastAPI)     │
│   Port 3000     │                │   Port 8000     │
└─────────────────┘                └─────────────────┘
```

## Development Workflow

1. **Start Development**: `bash dev-start.sh`
2. **Check Status**: `bash dev-status.sh`  
3. **View Logs**: `tail -f backend.log` or `tail -f frontend.log`
4. **Stop Services**: `bash dev-stop.sh`

## Manual Service Management

### Backend Only
```bash
cd backend
export PATH=$PATH:/home/gboyd/.local/bin
python3 test_basic.py
```

### Frontend Only  
```bash
cd web-builder
npm run dev
```

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on port 8000 (backend)
pkill -f "uvicorn.*8000"

# Kill processes on port 3000 (frontend)  
pkill -f "next.*3000"
```

### Dependencies Missing
```bash
# Backend dependencies
pip3 install --user fastapi uvicorn pydantic-settings

# Frontend dependencies
cd web-builder && npm install
```

### Check Logs
```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log
```

## Environment Files

### Backend `.env` (auto-created)
```env
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=sqlite:///./dev.db
ENVIRONMENT=development
DEBUG=true
```

## Development Features

- 🔄 **Auto-restart** on code changes
- 📊 **Health checks** for both services
- 📋 **Centralized logging** to files
- 🧹 **Clean shutdown** and cleanup
- 🔍 **Process monitoring** with PID tracking

## Team Usage

Perfect for:
- ✅ **Full-stack testing**
- ✅ **API integration testing**  
- ✅ **End-to-end development**
- ✅ **Team demonstrations**
- ✅ **CI/CD pipeline testing**