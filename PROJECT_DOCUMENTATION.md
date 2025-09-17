# AI Marketing Web Builder Platform - Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Key Features & Components](#key-features--components)
4. [Authentication System](#authentication-system)
5. [BMAD Framework Integration](#bmad-framework-integration)
6. [Technology Stack](#technology-stack)
7. [Project Structure](#project-structure)
8. [Development Workflow](#development-workflow)
9. [API Documentation](#api-documentation)
10. [Quality Standards](#quality-standards)
11. [Deployment & Infrastructure](#deployment--infrastructure)

## Project Overview

### What It Does

The AI Marketing Web Builder is a unified platform that combines beautiful drag-and-drop website building with intelligent workflow automation. It bridges the gap between website creation tools (like Simvoly) and marketing automation platforms (like GoHighLevel) by offering:

- **30+ Premium Templates** across multiple industries
- **AI-Powered Component Customization** using natural language
- **Magic Connector System** that intelligently links components to workflows
- **Built-in CRM & Email Automation**
- **Template-to-Live-Site in under 30 minutes**

### Core Value Proposition

The platform's unique selling point is the "Magic Connector" - an AI system that analyzes website components and automatically suggests relevant workflow automations. When a user adds a contact form, the AI instantly suggests email follow-up sequences, CRM integrations, and team notifications.

### Target Market

- **Primary**: Small to medium businesses needing professional websites with marketing automation
- **Secondary**: Marketing agencies managing multiple client websites
- **Tertiary**: Freelancers and consultants needing lead generation systems

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  🎨 FRONTEND (Next.js 14)                  │
│   • Drag-and-Drop Builder                                   │
│   • Template Library & Customization                       │
│   • Visual Workflow Builder                                │
│   • Real-time Collaboration                                │
└─────────────────────────────────────────────────────────────┘
                                │
                           HTTP API Calls
                                │
┌─────────────────────────────────────────────────────────────┐
│                  🚀 BACKEND (FastAPI)                      │
│   • Authentication & User Management                       │
│   • Template & Component Management                        │
│   • Workflow Engine (n8n-style)                           │
│   • CRM & Email Systems                                   │
│   • AI Service Integration                                │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                  🧠 AI SERVICES                            │
│   • Component Analysis (GPT-4)                             │
│   • Workflow Generation (Claude)                           │
│   • Performance Prediction (Custom ML)                     │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                  📊 DATA LAYER                             │
│   • PostgreSQL (Primary Data)                              │
│   • Redis (Cache & Job Queue)                             │
│   • Celery (Background Processing)                         │
└─────────────────────────────────────────────────────────────┘
```

### Clean Separation Architecture

The project follows a clean separation architecture:

- **Frontend** (`/web-builder/`): Independent Next.js 14 application on port 3000
- **Backend** (`/backend/`): Independent FastAPI application on port 8000
- **AI Services**: Integrated through the backend API layer
- **BMAD Framework** (`.bmad-core/`): AI-driven development methodology

## Key Features & Components

### 1. Template Engine
- **30+ Premium Templates** across 6 categories:
  - SaaS & Technology
  - Local Business & Services  
  - E-commerce & Retail
  - Professional Services
  - Creative & Portfolio
  - Non-profit & Community

### 2. Magic Connector System
The platform's core innovation that differentiates it from competitors:

```python
# Example Magic Connector Flow
def analyze_component_for_workflows(component_data):
    """
    AI analyzes component and suggests relevant workflows
    """
    # 1. Component Analysis
    analysis = ai_service.analyze_component(
        component_type=component_data.type,
        fields=component_data.fields,
        context=site_context
    )
    
    # 2. Workflow Suggestions
    suggestions = workflow_generator.suggest_workflows(
        analysis=analysis,
        industry=site_context.industry,
        goals=site_context.goals
    )
    
    # 3. One-Click Implementation
    return {
        "suggestions": suggestions,
        "confidence_scores": analysis.confidence,
        "implementation_templates": workflow_templates
    }
```

### 3. Visual Workflow Builder
- **n8n-style interface** for creating automation workflows
- **Trigger-Action-Condition** logic system
- **Real-time workflow execution** with monitoring
- **Background job processing** using Celery

### 4. Built-in CRM System
- Contact management and segmentation
- Lead scoring and activity tracking  
- Email campaign automation
- Integration with workflow system

### 5. AI Component Customization
- **Natural language editing**: "Make this more modern and blue"
- **Multiple variation generation**
- **Brand consistency enforcement**
- **Accessibility compliance checking**

## Authentication System

The authentication system was recently implemented (as evidenced by recent commits) and includes:

### Backend Authentication (`/backend/app/api/v1/endpoints/auth.py`)

```python
# Key Authentication Endpoints
POST /api/v1/auth/register    # User registration
POST /api/v1/auth/login       # User login (returns JWT)
POST /api/v1/auth/login/form  # OAuth2 compatible login
POST /api/v1/auth/refresh     # Token refresh
```

### Authentication Features

1. **JWT Token-Based Authentication**
   - Secure token generation and validation
   - Configurable token expiration
   - Refresh token support

2. **User Model** (`/backend/app/models/user.py`)
   ```python
   class User(Base, TimestampMixin, UUIDMixin):
       email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
       hashed_password: Mapped[str] = mapped_column(String(255))
       first_name: Mapped[Optional[str]]
       last_name: Mapped[Optional[str]]
       is_active: Mapped[bool] = mapped_column(Boolean, default=True)
       is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
       is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
       
       # Profile fields
       company: Mapped[Optional[str]]
       phone: Mapped[Optional[str]]
       bio: Mapped[Optional[str]]
       avatar_url: Mapped[Optional[str]]
   ```

3. **Frontend Authentication** (`/web-builder/src/app/auth/`)
   - Login and registration pages
   - Authentication forms with validation
   - Protected routes and middleware

4. **Security Features**
   - Password hashing using secure algorithms
   - Email uniqueness validation
   - Active user status checking
   - CORS configuration for security

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /auth/login
    Backend->>Database: Validate user
    Database-->>Backend: User data
    Backend->>Backend: Generate JWT token
    Backend-->>Frontend: {access_token, user}
    Frontend->>Frontend: Store token
    Frontend-->>User: Redirect to dashboard
    
    Note over Frontend,Backend: Subsequent requests include JWT in headers
    Frontend->>Backend: API calls with Authorization: Bearer <token>
    Backend->>Backend: Validate JWT token
    Backend-->>Frontend: Protected resource data
```

## BMAD Framework Integration

The project integrates the BMad (AI-driven development) framework for structured development workflows:

### What is BMAD?

BMAD is an AI-driven development methodology that provides:
- **Structured planning workflows** from idea to implementation
- **Specialized AI agents** for different roles (PM, Architect, Dev, QA, etc.)
- **Document-driven development** with automated sharding
- **Quality gates and test architecture**

### BMAD Directory Structure (`.bmad-core/`)

```
.bmad-core/
├── agent-teams/              # Team configurations
│   ├── team-all.yaml        # Full team setup
│   ├── team-fullstack.yaml  # Frontend + Backend teams
│   └── team-no-ui.yaml      # Backend-only teams
├── agents/                  # Individual agent specifications
│   ├── pm.md               # Product Manager agent
│   ├── architect.md        # System Architect agent
│   ├── dev.md              # Developer agent  
│   ├── qa.md               # QA/Test Architect agent
│   └── bmad-master.md      # Master orchestrator agent
├── workflows/              # Development workflows
│   ├── greenfield-fullstack.yaml
│   └── brownfield-service.yaml
├── templates/              # Document templates
│   ├── prd-tmpl.yaml      # Product Requirements Document
│   ├── architecture-tmpl.yaml
│   └── story-tmpl.yaml    # User story template
└── core-config.yaml       # BMAD configuration
```

### BMAD Workflow Integration

The project uses BMAD for:

1. **Planning Phase**: AI agents help create PRDs, architecture documents, and user stories
2. **Development Phase**: Structured story implementation with quality gates
3. **Quality Assurance**: Automated test design and risk assessment
4. **Documentation**: Automatic sharding and maintenance of project docs

### Key BMAD Agents Used

1. **PM (Product Manager)**: Creates PRDs and user stories
2. **Architect**: Designs system architecture and technical decisions
3. **Dev**: Implements features following architecture guidelines  
4. **QA (Test Architect)**: Designs test strategies and quality gates
5. **BMad-Master**: Can perform any role, ideal for smaller teams

### Using BMAD Commands

```bash
# In IDE with BMAD integration
@pm Create user stories for authentication
@architect Design the workflow engine architecture  
@dev Implement the Magic Connector API
@qa *risk-profile epic-4-story-2  # Risk assessment
@qa *test-design epic-4-story-2   # Test strategy
@qa *review epic-4-story-2        # Full quality review
```

## Technology Stack

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Drag & Drop**: React DnD
- **Workflow UI**: React Flow
- **Testing**: Jest, React Testing Library, Playwright E2E

### Backend Stack  
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Caching**: Redis
- **Background Jobs**: Celery
- **Authentication**: JWT tokens
- **API Documentation**: OpenAPI/Swagger (auto-generated)
- **Testing**: pytest, pytest-asyncio

### AI & ML Stack
- **Primary AI**: GPT-4 Turbo for component analysis
- **Secondary AI**: Claude 3.5 Sonnet for workflow generation  
- **Fast AI**: Gemini 1.5 Flash for quick operations
- **Custom Models**: Performance prediction and optimization

### Infrastructure Stack
- **Containerization**: Docker & Docker Compose
- **Frontend Hosting**: Vercel
- **Backend Hosting**: AWS/Railway
- **Database**: PostgreSQL (managed service)
- **Cache**: Redis (managed service)
- **CI/CD**: GitHub Actions
- **Monitoring**: Custom logging and health checks

## Project Structure

### Root Directory Layout

```
AI-Marketing-Web-Builder/
├── backend/                    # 🚀 FastAPI Backend (Port 8000)
│   ├── app/
│   │   ├── api/v1/endpoints/   # API route handlers
│   │   │   ├── auth.py         # Authentication endpoints
│   │   │   ├── crm.py          # CRM management
│   │   │   ├── templates.py    # Template operations  
│   │   │   ├── workflows.py    # Workflow automation
│   │   │   ├── publishing.py   # Site publishing
│   │   │   └── ai_features.py  # AI service integration
│   │   ├── models/             # SQLAlchemy database models
│   │   │   ├── user.py         # User authentication model
│   │   │   ├── sites.py        # Website/project models
│   │   │   ├── crm.py          # CRM data models
│   │   │   ├── template.py     # Template models
│   │   │   └── workflows.py    # Workflow models
│   │   ├── services/           # Business logic layer
│   │   ├── core/               # Configuration and security
│   │   └── main.py             # FastAPI application entry
│   ├── alembic/                # Database migrations
│   ├── tests/                  # Backend tests
│   └── requirements.txt        # Python dependencies
│
├── web-builder/                # 🎨 Next.js Frontend (Port 3000)
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── (builder)/      # Builder interface pages
│   │   │   ├── auth/           # Authentication pages
│   │   │   ├── api/            # API route handlers
│   │   │   └── layout.tsx      # Root layout
│   │   ├── components/         # React components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── builder/        # Drag & drop builder
│   │   │   ├── templates/      # Template components
│   │   │   ├── workflows/      # Workflow builder UI
│   │   │   └── ui/             # shadcn/ui components
│   │   └── lib/                # Utilities and stores
│   ├── public/                 # Static assets
│   ├── tests/                  # Frontend tests
│   ├── package.json            # Node.js dependencies
│   └── next.config.ts          # Next.js configuration
│
├── .bmad-core/                 # 🤖 BMAD AI Framework
│   ├── agents/                 # AI agent specifications
│   ├── workflows/              # Development workflows  
│   ├── templates/              # Document templates
│   └── core-config.yaml        # BMAD configuration
│
├── docs/                       # 📚 Project Documentation
│   ├── architecture/           # Architecture documents
│   ├── prd/                   # Product requirements (sharded)
│   ├── stories/               # User stories
│   └── qa/                    # Quality assurance docs
│
├── scripts/                    # 🔧 Utility Scripts
├── .github/workflows/          # CI/CD pipelines
└── README.md                   # Project overview
```

### Key Configuration Files

- **Backend Config**: `backend/app/core/config.py` - Environment variables and settings
- **Frontend Config**: `web-builder/next.config.ts` - Next.js configuration
- **Database Config**: `backend/alembic.ini` - Database migration settings
- **BMAD Config**: `.bmad-core/core-config.yaml` - AI development framework settings
- **Docker Config**: `backend/docker-compose.yml` - Development services

## Development Workflow

### Local Development Setup

1. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

2. **Frontend Setup**:
   ```bash
   cd web-builder  
   npm install
   npm run dev
   ```

3. **Full Stack Development**:
   ```bash
   # Terminal 1: Backend
   cd backend && uvicorn app.main:app --reload
   
   # Terminal 2: Frontend
   cd web-builder && npm run dev
   ```

### Development Workflow with BMAD

The project follows the BMAD methodology for structured development:

1. **Planning Phase** (Web UI or Powerful IDE):
   - Analyst creates project brief and research
   - PM creates PRD with features, requirements, and user stories
   - Architect designs system architecture
   - UX Expert creates frontend specifications (optional)
   - PO validates document alignment

2. **Development Phase** (IDE):
   - SM drafts stories from sharded epics
   - QA performs risk assessment and test design (optional)
   - PO validates story drafts (optional)
   - Dev implements tasks with tests
   - QA performs quality gates and reviews
   - Continuous integration and deployment

### Git Workflow

The project uses a **Pull Request workflow**:

1. **Feature Branches**: `git checkout -b feature/your-feature-name`
2. **Development**: Follow coding standards, commit frequently
3. **Pull Request**: Use PR template, ensure all checks pass
4. **Code Review**: Minimum 1 approval required
5. **Automated Testing**: All quality gates must pass
6. **Merge**: Squash and merge after approval

### Recent Development Activity

Based on git history, recent focus areas include:
- ✅ **Authentication System Implementation** (Complete)
- ✅ **E2E Template-to-Published Site Workflow** (Complete) 
- ✅ **MVP Security Enhancements** (Complete)
- 🔄 **Authentication Integration with Frontend** (In Progress)

## API Documentation

### Authentication Endpoints

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}

Response: 201 Created
{
  "id": "uuid",
  "email": "user@example.com", 
  "first_name": "John",
  "last_name": "Doe",
  "is_active": true
}
```

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: 200 OK
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

### Core API Structure

```http
# Health Check
GET /health

# Authentication
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh

# Templates  
GET /api/v1/templates
POST /api/v1/templates
GET /api/v1/templates/{template_id}

# Sites/Projects
GET /api/v1/sites
POST /api/v1/sites  
GET /api/v1/sites/{site_id}
PUT /api/v1/sites/{site_id}

# CRM
GET /api/v1/crm/contacts
POST /api/v1/crm/contacts
GET /api/v1/crm/campaigns

# Workflows
GET /api/v1/workflows
POST /api/v1/workflows
GET /api/v1/workflows/{workflow_id}/execute

# AI Features
POST /api/v1/ai/analyze-component
POST /api/v1/ai/suggest-workflows
POST /api/v1/ai/customize-component

# Publishing
POST /api/v1/publishing/publish-site
GET /api/v1/publishing/sites/{site_id}/status
```

### Authentication Headers

All protected endpoints require JWT authentication:

```http
Authorization: Bearer <access_token>
```

## Quality Standards

### Performance Requirements
- **Template Loading**: <3 seconds
- **AI Customization**: <5 seconds  
- **Workflow Creation**: <10 seconds
- **Site Publishing**: <30 seconds
- **API Response Times**: <300ms for CRUD operations

### MVP Success Metrics
- [ ] Template to live site in <30 minutes
- [ ] >80% AI customization success rate
- [ ] >60% component-to-workflow connection rate  
- [ ] 99%+ workflow execution reliability
- [ ] 100+ active beta users

### Testing Standards
- **Backend**: pytest with 90%+ code coverage
- **Frontend**: Jest + React Testing Library for unit tests
- **E2E**: Playwright for critical user journeys
- **Quality Gates**: BMAD QA agent provides automated quality assessment

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint/Prettier**: Consistent code formatting
- **Python**: Black formatter, flake8 linting
- **Git Hooks**: Pre-commit checks for quality

## Deployment & Infrastructure

### Development Environment
- **Backend**: uvicorn development server on port 8000
- **Frontend**: Next.js development server on port 3000  
- **Database**: Local PostgreSQL or Docker container
- **Cache**: Local Redis instance

### Production Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway/AWS   │    │   PostgreSQL    │
│   (Frontend)    │───▶│   (Backend)     │───▶│   (Database)    │
│   Port 3000     │    │   Port 8000     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   Redis         │
                       │   (Cache/Queue) │
                       └─────────────────┘
```

### Deployment Process
1. **Frontend**: Automatic deployment to Vercel on main branch pushes
2. **Backend**: Containerized deployment to Railway/AWS
3. **Database**: Managed PostgreSQL service (AWS RDS/Railway)
4. **Cache**: Managed Redis service
5. **CI/CD**: GitHub Actions for testing and deployment

### Environment Configuration

**Backend (.env)**:
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Getting Started

### For New Developers

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd AI-Marketing-Web-Builder
   ```

2. **Set up the backend**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env  # Configure your environment
   alembic upgrade head  # Run database migrations
   uvicorn app.main:app --reload
   ```

3. **Set up the frontend**:
   ```bash
   cd web-builder
   npm install
   cp .env.local.example .env.local  # Configure your environment  
   npm run dev
   ```

4. **Install BMAD (optional)**:
   ```bash
   npx bmad-method install
   ```

5. **Access the applications**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### For Contributing

Please review:
- [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) - Development processes
- [COMMIT_AND_PR_WORKFLOW.md](./COMMIT_AND_PR_WORKFLOW.md) - Git workflow
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- `.bmad-core/user-guide.md` - BMAD framework usage

---

*This documentation reflects the current state of the AI Marketing Web Builder project as of the latest commits. For the most up-to-date information, please refer to the project's README.md and recent commit messages.*