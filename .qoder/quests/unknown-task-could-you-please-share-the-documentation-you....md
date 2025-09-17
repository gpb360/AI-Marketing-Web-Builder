# AI Marketing Web Builder - Development Specification

## Overview

The AI Marketing Web Builder is a unified platform combining drag-and-drop website building with intelligent workflow automation. It merges visual design capabilities with powerful automation features, enabling users to build, customize, and deploy fully automated marketing websites in under 30 minutes.

### Core Value Proposition
- **30-minute Magic Moment**: Template selection to live website deployment
- **AI-Powered Customization**: Natural language component editing and optimization
- **Magic Connector**: One-click automation linking between website components and workflows
- **Integrated CRM**: Built-in customer relationship management and email campaigns
- **Real-time Collaboration**: Team-based website building and workflow management

## Architecture

### System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 14 App]
        B[React Components]
        C[Tailwind CSS]
        D[React DnD Builder]
        E[State Management]
    end
    
    subgraph "Backend Layer"
        F[FastAPI Application]
        G[SQLAlchemy ORM]
        H[Business Logic Services]
        I[API Endpoints]
    end
    
    subgraph "AI Services"
        J[GPT-4 Turbo]
        K[Claude 3.5 Sonnet]
        L[Gemini 1.5 Flash]
        M[Custom ML Models]
    end
    
    subgraph "Infrastructure"
        N[PostgreSQL Database]
        O[Redis Cache/Queue]
        P[Celery Workers]
        Q[Docker Containers]
    end
    
    A --> F : HTTP API
    F --> N : Data Storage
    F --> O : Caching/Jobs
    P --> O : Task Queue
    F --> J : AI Processing
    F --> K : AI Processing
    F --> L : AI Processing
    H --> M : Predictions
```

### Clean Architecture Principles

**Frontend (Port 3000)**
- Next.js 14 with App Router
- Independent deployment and scaling
- API communication only with backend
- No direct database access

**Backend (Port 8000)**
- FastAPI with automatic OpenAPI documentation
- Single unified backend service
- All business logic and data models
- AI service orchestration

**Communication**
- RESTful HTTP APIs for standard operations
- WebSocket connections for real-time features
- JWT authentication for security
- JSON data format

## Technology Stack

### Frontend Technologies
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js | 14 |
| Language | TypeScript | Latest |
| Styling | Tailwind CSS | Latest |
| State Management | Zustand | Latest |
| Drag & Drop | React DnD | Latest |
| Workflow UI | React Flow | Latest |
| Testing | Playwright | Latest |

### Backend Technologies
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | FastAPI | Latest |
| Language | Python | 3.11+ |
| Database | PostgreSQL | Latest |
| ORM | SQLAlchemy | Latest |
| Caching | Redis | Latest |
| Task Queue | Celery | Latest |
| Migration | Alembic | Latest |

### AI/ML Infrastructure
| Service | Model | Use Case |
|---------|-------|----------|
| GPT-4 Turbo | OpenAI | Template generation, performance analysis |
| Claude 3.5 Sonnet | Anthropic | Workflow creation, complex logic |
| Gemini 1.5 Flash | Google | Component suggestions, general queries |
| Custom Models | Internal | Performance prediction, optimization |

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker and Docker Compose
- pnpm package manager
- PostgreSQL
- Redis

### Quick Start
```bash
# Clone repository
git clone https://github.com/your-repo/AI-Marketing-Web-Builder.git
cd AI-Marketing-Web-Builder

# Start infrastructure
cd backend
docker-compose up -d

# Setup backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup frontend
cd ../web-builder
pnpm install

# Start development servers
bash ../dev-start.sh
```

### Development Commands
```bash
# Start all services
bash dev-start.sh

# Check service status
bash dev-status.sh

# Stop all services
bash dev-stop.sh

# Backend only
cd backend && uvicorn app.main:app --reload

# Frontend only
cd web-builder && pnpm dev
```

### Service Endpoints
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Core Features Architecture

### Magic Connector System

The Magic Connector is the core innovation bridging visual building with workflow automation.

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Analyzer
    participant AI
    participant Workflow
    
    User->>Component: Places component
    Component->>Analyzer: Request analysis
    Analyzer->>AI: Send component features
    AI->>AI: Analyze semantic purpose
    AI->>Analyzer: Return suggestions
    Analyzer->>User: Display workflow options
    User->>Analyzer: Select suggestion
    Analyzer->>Workflow: Create automation
    Workflow-->>User: Confirmation
```

**Key Components:**
- Component Analyzer: Semantic analysis of website elements
- AI Service Router: Intelligent model selection
- Workflow Builder: Visual automation creation
- Magic Connector Interface: One-click linking

### AI-Powered Features

**Multi-Model AI Strategy:**
- **Task Routing**: Optimal model selection based on complexity
- **Performance Optimization**: Cost and latency management
- **Fallback Handling**: Graceful degradation when services unavailable
- **Context Awareness**: Business context integration

**AI Capabilities:**
- Natural language component customization
- Template recommendations based on business context
- Workflow automation suggestions
- Performance prediction and optimization
- Content generation and adaptation

### Workflow Automation Engine

```mermaid
graph TD
    A[Visual Builder] --> B[Workflow Engine]
    B --> C[Trigger Detection]
    C --> D[Action Execution]
    D --> E[CRM Integration]
    D --> F[Email Campaigns]
    D --> G[Analytics Tracking]
    B --> H[Real-time Debugging]
    H --> I[Performance Monitoring]
```

**Architecture Features:**
- WebSocket-based real-time communication
- Celery background job processing
- Visual debugging and monitoring
- SLA optimization and reliability
- Error handling and recovery

## Development Workflow

### Git Workflow
```bash
# Feature development
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Regular commits
git add .
git commit -m "feat: implement feature with business value"

# Push and create PR
git push origin feature/your-feature-name
```

### Pull Request Requirements
- ✅ All automated tests passing
- ✅ Code review approval required
- ✅ Documentation updated if needed
- ✅ Performance benchmarks met
- ✅ Magic Moment journey tested

### Quality Standards

**Performance Requirements:**
- Magic Moment journey: <30 minutes
- AI customization response: <5 seconds
- Platform interactions: <2 seconds
- Template loading: <3 seconds
- Component handling: 100+ without degradation

**Testing Requirements:**
- 95% E2E test success rate
- Unit test coverage for new features
- Integration tests for API endpoints
- Performance regression testing
- Security vulnerability scanning

## Data Models & Database

### Core Models
```mermaid
erDiagram
    User ||--o{ Project : owns
    Project ||--o{ Site : contains
    Site ||--o{ Component : includes
    User ||--o{ Workflow : creates
    Workflow ||--o{ WorkflowNode : contains
    Component ||--o{ WorkflowNode : triggers
    User ||--o{ CrmContact : manages
    Project ||--o{ Analytics : tracks
```

**Key Entities:**
- **User**: Authentication, permissions, team management
- **Project**: Website projects and collaboration
- **Site**: Published websites and configurations
- **Component**: Website elements and properties
- **Workflow**: Automation sequences and logic
- **CrmContact**: Customer relationship data
- **Analytics**: Performance metrics and insights

### Database Schema Organization
```
backend/app/models/
├── user.py          # User authentication and profiles
├── project.py       # Project and site management
├── template.py      # Template definitions and metadata
├── workflow.py      # Workflow automation models
├── crm.py           # CRM and contact management
├── analytics.py     # Performance tracking
└── business_context.py # AI context models
```

## API Design

### REST Endpoints Structure
```
/api/v1/
├── /auth              # Authentication and user management
├── /projects          # Project CRUD operations
├── /templates         # Template management and generation
├── /workflows         # Workflow automation
├── /crm               # Customer relationship management
├── /analytics         # Performance metrics
└── /ai                # AI services and customization
```

### Authentication Flow
```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth
    participant Database
    
    Client->>API: Login request
    API->>Auth: Validate credentials
    Auth->>Database: Check user
    Database-->>Auth: User data
    Auth-->>API: JWT token
    API-->>Client: Token response
    
    Client->>API: Authenticated request
    API->>Auth: Validate token
    Auth-->>API: User context
    API->>Database: Execute operation
    Database-->>API: Result
    API-->>Client: Response
```

## Testing Strategy

### Test Pyramid
```
┌─────────────────────┐
│   E2E Tests         │  ← Playwright, Magic Moment journey
├─────────────────────┤
│   Integration Tests │  ← API endpoints, AI services
├─────────────────────┤
│   Unit Tests        │  ← Components, services, utilities
└─────────────────────┘
```

### Critical Test Scenarios
1. **Magic Moment Journey**: Template selection to live site
2. **AI Customization**: Component modification via natural language
3. **Workflow Creation**: Drag-and-drop automation building
4. **Real-time Collaboration**: Multi-user editing
5. **Performance Under Load**: 100+ components, concurrent users

### Test Commands
```bash
# Run all tests
pnpm test

# E2E tests
pnpm test:e2e

# Integration tests
cd backend && pytest

# Performance tests
pnpm test:performance
```

## Deployment & Infrastructure

### Container Architecture
```yaml
# docker-compose.yml structure
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://...
  
  frontend:
    build: ./web-builder
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
  
  database:
    image: postgres:latest
    
  redis:
    image: redis:latest
```

### Environment Configuration
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=...

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
```

### Health Monitoring
```bash
# Service health checks
curl http://localhost:8000/health
curl http://localhost:3000/api/health

# Log monitoring
tail -f backend.log
tail -f frontend.log
```

## Security Considerations

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- Session management via Redis
- API rate limiting

### Data Protection
- Environment-based secret management
- Database encryption at rest
- HTTPS in production
- Input validation and sanitization

### AI Service Security
- API key rotation policies
- Request rate limiting
- Content filtering
- Error message sanitization

## Performance Optimization

### Frontend Optimization
- Next.js App Router for SSR
- Component lazy loading
- Bundle splitting and optimization
- Image optimization
- CDN deployment via Vercel

### Backend Optimization
- Database query optimization
- Redis caching strategy
- Asynchronous task processing
- Connection pooling
- API response compression

### AI Service Optimization
- Model routing for cost efficiency
- Response caching
- Batch processing where possible
- Timeout and retry policies

## Troubleshooting Guide

### Common Issues

**Port Conflicts:**
```bash
# Kill processes on ports
pkill -f "uvicorn.*8000"
pkill -f "next.*3000"
```

**Database Connection:**
```bash
# Check PostgreSQL status
docker-compose ps
docker-compose logs database
```

**AI Service Failures:**
```bash
# Check API key configuration
echo $OPENAI_API_KEY
echo $CLAUDE_API_KEY

# Review service logs
tail -f backend.log | grep "ai_service"
```

**Build Failures:**
```bash
# Clean and rebuild
rm -rf node_modules package-lock.json
pnpm install

# Backend dependencies
pip install --upgrade -r requirements.txt
```

### Log Analysis
```bash
# Error tracking
grep ERROR backend.log
grep WARN frontend.log

# Performance monitoring
grep "response_time" backend.log
grep "bundle_size" frontend.log
```

## Contributing Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled
- **Python**: Black formatting, MyPy type checking
- **ESLint**: Enforced linting rules
- **Commit Messages**: Conventional commits format

### Documentation Requirements
- API endpoint documentation
- Component usage examples
- Architecture decision records
- Performance benchmark updates

### Review Process
1. Automated quality gates must pass
2. Code review approval required
3. Magic Moment journey tested
4. Performance impact assessed
5. Documentation updated

This specification provides the foundation for consistent, high-quality development of the AI Marketing Web Builder platform.