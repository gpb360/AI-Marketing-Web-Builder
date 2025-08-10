# AI Marketing Web Builder - Clean Architecture

## 🏗️ Architecture Overview

**Philosophy**: Clean separation between frontend and backend for independent development, deployment, and scaling.

## 📁 Project Structure

```
AI-Marketing-Web-Builder/
├── backend/                    # 🚀 SINGLE UNIFIED BACKEND
│   ├── app/
│   │   ├── api/v1/endpoints/
│   │   │   ├── auth.py         # Authentication
│   │   │   ├── crm.py          # CRM features
│   │   │   ├── templates.py    # Template management
│   │   │   ├── workflows.py    # Workflow automation
│   │   │   ├── publishing.py   # Site publishing (NEW)
│   │   │   └── collaboration.py # Real-time collaboration (NEW)
│   │   ├── models/             # All data models
│   │   ├── services/           # Business logic
│   │   └── main.py             # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   └── docker-compose.yml      # Backend services
│
├── web-builder/                # 🎨 FRONTEND ONLY
│   ├── src/
│   │   ├── app/                # Next.js pages
│   │   ├── components/         # React components
│   │   └── lib/                # Frontend utilities
│   ├── package.json            # Node.js dependencies
│   └── next.config.ts          # Next.js configuration
│
└── .claude/agents/             # 🤖 AI Agent System
    ├── engineering/            # Technical development agents
    ├── design/                 # UI/UX and template agents  
    ├── project-management/     # Coordination and delivery agents
    └── [specialized folders]/  # Marketing, operations, testing agents
```

## ✅ Benefits of This Architecture

### Clean Separation
- **Backend**: Independent FastAPI service on port 8000
- **Frontend**: Independent Next.js application on port 3000
- **Agent System**: Specialized AI agents with embedded specifications
- **No coupling**: Each layer can be developed, tested, and deployed separately

### Development Benefits
- ✅ **Agent-Driven Development**: Specialized agents with complete specifications
- ✅ **Teams can work independently** with clear agent boundaries
- ✅ **Different tech stacks** (Python/FastAPI vs Node/Next.js)
- ✅ **Independent scaling** (scale backend/frontend separately)
- ✅ **Embedded Documentation**: Specifications live within agent files
- ✅ **Single Source of Truth**: No sync issues between docs and agents

### Deployment Benefits
- ✅ **Separate containers** (backend + frontend)
- ✅ **Independent CI/CD pipelines**
- ✅ **Environment-specific configs**
- ✅ **Load balancing flexibility**

## 🚀 Development Workflow

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
**Available at**: http://localhost:8000
**API Docs**: http://localhost:8000/docs

### Frontend Development  
```bash
cd web-builder
npm install
npm run dev
```
**Available at**: http://localhost:3000

### Full Stack Development
```bash
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2: Frontend  
cd web-builder && npm run dev
```

## 📡 API Communication

**Frontend → Backend**: HTTP API calls
- **Base URL**: `http://localhost:8000/api/v1/`
- **Endpoints**: `/auth`, `/crm`, `/templates`, `/workflows`, `/publishing`, `/collaboration`
- **Authentication**: JWT tokens
- **Real-time**: WebSocket for collaboration features

## 🧹 What Was Removed

**Old Problematic Structure:**
```
❌ web-builder/backend/    # REMOVED - caused confusion
❌ Duplicate main.py files
❌ Conflicting requirements.txt
❌ Mixed frontend/backend concerns
```

## 🔧 Team Responsibilities

### Backend Team (`/backend/`)
- FastAPI development
- Database models and migrations
- API endpoints and business logic
- Authentication and security
- Site publishing system
- Real-time collaboration features

### Frontend Team (`/web-builder/`)
- Next.js/React development
- UI components and pages
- State management
- API integration
- User experience

## 🚨 Important Rules

1. **NO backend code in `/web-builder/`** - Frontend only
2. **NO frontend code in `/backend/`** - Backend only  
3. **Communication via API only** - No direct imports
4. **Independent deployments** - Each service standalone
5. **Separate dependency management** - requirements.txt vs package.json

## 📊 Health Checks

### Backend Health
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

### Frontend Health
```bash
curl http://localhost:3000/api/health  
# Should return Next.js status
```

## 🎯 Next Steps

1. ✅ Backend consolidated with all features
2. 🔄 Remove `/web-builder/backend/` entirely 
3. 🔄 Update team documentation
4. 🔄 Test full stack integration
5. 🔄 Deploy with clean architecture

---

**This architecture ensures clean separation, independent development, and scalable deployment.**