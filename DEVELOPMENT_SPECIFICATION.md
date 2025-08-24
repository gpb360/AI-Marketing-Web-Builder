# AI Marketing Web Builder - Development Specification

## Executive Summary

The AI Marketing Web Builder is a unified platform that bridges beautiful drag-and-drop website building with intelligent workflow automation. This specification provides comprehensive guidance for developers working on this project, consolidating architecture decisions, quality standards, development workflows, and technical requirements.

**Core Value Proposition**: Enable users to go from template selection to live automated marketing website in under 30 minutes through the innovative "Magic Connector" system that uses AI to link website components with workflow automation.

## Project Architecture Overview

### System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer (Port 3000)"
        A[Next.js 14 App Router]
        B[React Components + TypeScript]
        C[Tailwind CSS + shadcn/ui]
        D[React DnD Builder]
        E[Zustand State Management]
        F[Magic Connector UI]
    end
    
    subgraph "Backend Layer (Port 8000)"
        G[FastAPI Application]
        H[SQLAlchemy ORM]
        I[Business Logic Services]
        J[AI Service Router]
        K[Workflow Engine]
    end
    
    subgraph "AI Services"
        L[GPT-4 Turbo]
        M[Claude 3.5 Sonnet]
        N[Gemini 1.5 Flash]
        O[Custom ML Models]
    end
    
    subgraph "Infrastructure"
        P[PostgreSQL Database]
        Q[Redis Cache/Queue]
        R[Celery Workers]
        S[Docker Containers]
    end
    
    A --> G : HTTP API
    G --> P : Data Storage
    G --> Q : Caching/Jobs
    R --> Q : Task Queue
    J --> L : Component Analysis
    J --> M : Workflow Logic
    J --> N : General Queries
    K --> O : Performance Prediction
```

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | Next.js | 14 | App framework with App Router |
| | TypeScript | Latest | Type safety and developer experience |
| | Tailwind CSS | Latest | Utility-first styling |
| | shadcn/ui | Latest | Component library |
| | React DnD | Latest | Drag-and-drop functionality |
| | Zustand | Latest | State management |
| | Playwright | Latest | E2E testing |
| **Backend** | FastAPI | Latest | High-performance API framework |
| | Python | 3.11+ | Backend language |
| | PostgreSQL | Latest | Primary database |
| | SQLAlchemy | Latest | ORM and data modeling |
| | Redis | Latest | Caching and task queue |
| | Celery | Latest | Background job processing |
| | Alembic | Latest | Database migrations |
| **AI/ML** | GPT-4 Turbo | OpenAI | Component customization, performance analysis |
| | Claude 3.5 Sonnet | Anthropic | Workflow creation, complex logic |
| | Gemini 1.5 Flash | Google | Component suggestions, general queries |
| | Custom Models | Internal | Performance prediction, optimization |

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL
- Redis

### Quick Start Commands
```bash
# Clone and setup
git clone https://github.com/your-repo/AI-Marketing-Web-Builder.git
cd AI-Marketing-Web-Builder

# Start all services (Windows)
dev-start.bat

# Start all services (Unix/Linux)
bash dev-start.sh

# Check service status
bash dev-status.sh

# Stop all services
bash dev-stop.sh
```

### Individual Service Commands
```bash
# Backend only
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend only
cd web-builder
npm install
npm run dev

# Manual backend test
cd backend
python test_basic.py
```

### Service Endpoints
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Critical Quality Standards

### Theme Consistency Requirements (CRITICAL)

**Problem Identified**: 50% of pages use light theme instead of dark brand theme, creating jarring user experience.

**Solution Requirements**:
```typescript
// FORBIDDEN: Hardcoded theme values
❌ className="bg-white text-gray-900"          // Light theme
❌ className="bg-blue-500"                     // Wrong brand color
❌ className="p-4 m-2"                         // Hardcoded spacing

// REQUIRED: Theme-based approach
✅ className={presets.landingPage}              // Unified preset
✅ className={colors.background.primary}       // Theme color
✅ className={spacing.component.padding}       // Theme spacing
```

**Critical Fix Areas**:
1. **Templates Page**: `/src/app/(builder)/templates/page.tsx` - Convert from light to dark theme
2. **Canvas Page**: `/src/app/(builder)/canvas/page.tsx` - Fix white backgrounds and light text
3. **Visual Builder**: `/src/components/builder/VisualBuilder.tsx` - Update light gray backgrounds

**Success Criteria**:
- ✅ 100% theme consistency across all pages (currently 50%)
- ✅ Zero hardcoded color values in production components
- ✅ Seamless visual transitions between all app sections

### Component Quality Tiers

#### Tier 1: Production-Ready Professional Components
```typescript
interface Tier1Component {
  // Visual Polish (10/10)
  themeConsistency: 100%,           // Perfect dark theme compliance
  brandColorUsage: 100%,            // Consistent yellow accents
  visualHierarchy: "clear",         // Obvious information hierarchy
  spacing: "8px-grid",              // Perfect grid alignment
  typography: "professional",       // Inter font, proper weights
  
  // Interaction Quality (10/10)
  animations: "smooth-60fps",       // Buttery smooth animations
  hoverStates: "subtle-professional", // Professional hover feedback
  loadingStates: "skeleton",        // Modern loading patterns
  errorHandling: "inline-graceful", // User-friendly error states
  
  // Technical Excellence (10/10)
  accessibility: "WCAG-2.1-AA",    // Full accessibility compliance
  performance: "<16ms-render",      // 60fps interaction performance
  responsiveDesign: "mobile-first", // Perfect mobile experience
  browserSupport: "modern-browsers", // Chrome/Firefox/Safari/Edge
  
  // Code Quality (10/10)
  typescript: "strict-mode",        // Full type safety
  testing: "unit-integration",      // Comprehensive test coverage
  documentation: "storybook",       // Component documentation
  reusability: ">80%",              // High reuse across templates
}
```

## Magic Connector System (Core Innovation)

### Architecture Overview
The Magic Connector is the platform's primary differentiator, enabling AI-powered component-to-workflow connections in under 30 seconds.

```typescript
interface MagicConnectorCore {
  // Ultra-fast component analysis (<2s response time)
  analyzeComponent(component: Component, context: BusinessContext): Promise<WorkflowSuggestions>;
  
  // One-click workflow creation (<5s setup time)
  createInstantWorkflow(suggestion: WorkflowSuggestion, user: User): Promise<ActiveWorkflow>;
  
  // Real-time workflow validation
  validateWorkflowSetup(workflow: Workflow, components: Component[]): ValidationResult;
}
```

### AI Service Integration Pattern
```typescript
class ComponentAnalysisAI {
  async analyzeForWorkflows(component: ComponentData): Promise<WorkflowAnalysis> {
    const optimizedPrompt = this.createConcisePrompt(component); // <500 tokens
    
    return this.gpt4Service.generateJSON({
      prompt: optimizedPrompt,
      maxTokens: 400, // Aggressive limit for speed
      temperature: 0.3, // Consistent results
      timeout: 3000, // Hard timeout
    });
  }
}
```

### Performance Requirements
- **Magic Moment Journey**: Template to live site in <30 minutes
- **AI Customization Response**: <5 seconds
- **Platform Interactions**: <2 seconds
- **Template Loading**: <3 seconds
- **Component Handling**: 100+ without degradation

## File Structure and Organization

### Project Root
```
AI-Marketing-Web-Builder/
├── backend/                    # FastAPI backend service
│   ├── app/
│   │   ├── api/v1/endpoints/  # API endpoints
│   │   ├── models/            # Database models
│   │   ├── services/          # Business logic
│   │   ├── core/              # Core configuration
│   │   └── main.py           # FastAPI app entry
│   ├── alembic/               # Database migrations
│   ├── requirements.txt       # Python dependencies
│   └── docker-compose.yml     # Backend services
├── web-builder/               # Next.js frontend application
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   ├── components/       # React components
│   │   │   ├── ui/           # Base design system
│   │   │   ├── builder/      # Builder-specific components
│   │   │   ├── templates/    # Template components
│   │   │   └── landing/      # Landing page components
│   │   ├── lib/              # Utilities and helpers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # Zustand state management
│   │   └── types/            # TypeScript definitions
│   ├── package.json          # Node dependencies
│   └── next.config.ts        # Next.js configuration
├── docs/                     # Project documentation
├── scripts/                  # Utility scripts
└── .bmad-core/               # BMad Method framework
```

### Component Architecture
```typescript
// REQUIRED: Component hierarchy
components/
├── ui/                          # Base design system components
│   ├── Button.tsx              # Professional button variants
│   ├── Card.tsx                # Modern card system  
│   ├── Input.tsx               # Form input components
│   └── Typography.tsx          # Text component system
├── builder/                     # Builder-specific components
│   ├── Canvas.tsx              # Main canvas (unified)
│   ├── ComponentRenderer.tsx   # Enhanced renderer
│   ├── Toolbar.tsx             # Professional toolbar
│   └── PropertyPanel.tsx       # Component properties
├── templates/                   # Template components
│   ├── Hero/                   # Hero section variants
│   ├── Navigation/             # Navigation components
│   ├── Forms/                  # Form components
│   └── Cards/                  # Card component library
└── landing/                     # Landing page components
    ├── HeroSection.tsx         # Landing hero
    ├── FeaturesSection.tsx     # Features showcase
    └── DemoSection.tsx         # Interactive demo
```

## Development Workflow

### BMad Method Integration
This project uses the BMad Method for agile AI-driven development:

**Agent Types**:
- **BMad-Master**: General purpose agent for any task except story implementation
- **BMad-Orchestrator**: Heavy-weight agent for web bundle facilitation (not for IDE use)

**Agent Commands** (varies by IDE):
```bash
# Cursor/Windsurf style
@pm Create user stories for Magic Connector
@architect Design component analysis system
@dev Implement theme consistency fixes

# Claude Code style
/pm Create user stories
/dev Fix the theme inconsistency
```

### Git Workflow
```bash
# Feature development
git checkout main
git pull origin main
git checkout -b feature/magic-connector-enhancement

# Regular commits with conventional format
git add .
git commit -m "feat: implement Magic Connector component analysis"

# Push and create PR
git push origin feature/magic-connector-enhancement
```

### Pull Request Requirements
- ✅ All automated tests passing (95% E2E test success rate)
- ✅ Code review approval required
- ✅ Documentation updated if needed
- ✅ Performance benchmarks met
- ✅ Magic Moment journey tested (<30 minutes)

### Testing Strategy

#### Test Pyramid
```
┌─────────────────────┐
│   E2E Tests         │  ← Playwright, Magic Moment journey
├─────────────────────┤
│   Integration Tests │  ← API endpoints, AI services
├─────────────────────┤
│   Unit Tests        │  ← Components, services, utilities
└─────────────────────┘
```

#### Critical Test Scenarios
1. **Magic Moment Journey**: Template selection to live site (<30 minutes)
2. **AI Customization**: Component modification via natural language (<5 seconds)
3. **Workflow Creation**: Drag-and-drop automation building
4. **Real-time Collaboration**: Multi-user editing
5. **Performance Under Load**: 100+ components, concurrent users
6. **Theme Consistency**: All pages use correct dark theme

#### Test Commands
```bash
# Run all tests
npm test

# E2E tests
npm run test:e2e

# Integration tests
cd backend && pytest

# Performance tests
npm run test:performance
```

## API Design Patterns

### REST Endpoints Structure
```
/api/v1/
├── /auth              # Authentication and user management
├── /projects          # Project CRUD operations
├── /templates         # Template management and generation
├── /workflows         # Workflow automation
├── /magic-connector   # Magic Connector analysis and suggestions
├── /crm               # Customer relationship management
├── /analytics         # Performance metrics
└── /ai                # AI services and customization
```

### Authentication Flow
```typescript
// JWT-based authentication pattern
interface AuthService {
  login(credentials: LoginRequest): Promise<AuthResponse>;
  refresh(token: string): Promise<AuthResponse>;
  logout(token: string): Promise<void>;
  validateToken(token: string): Promise<User>;
}
```

## Environment Configuration

### Backend Environment (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_marketing_db
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=...
GEMINI_API_KEY=...

# App Configuration
DEBUG=true
SECRET_KEY=dev-secret-key

# Workflow Engine
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### Frontend Environment (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_MAGIC_CONNECTOR_ENABLED=true
```

## Coding Standards

### Frontend Standards (Next.js/React)
```typescript
// REQUIRED: Functional components with hooks
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Use TypeScript strictly
  const [state, setState] = useState<StateType>(initialState);
  
  // Follow Next.js 14 app router conventions
  // Use Tailwind CSS for styling
  // Implement proper error boundaries
  
  return (
    <div className={cn("base-styles", className)}>
      {/* Component content */}
    </div>
  );
};

// REQUIRED: Proper TypeScript interfaces
interface ComponentProps {
  title: string;
  description?: string;
  onAction: (data: ActionData) => void;
  className?: string;
}
```

### Backend Standards (FastAPI)
```python
# REQUIRED: FastAPI conventions with type hints
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.models import ComponentModel
from app.schemas import ComponentResponse, ComponentCreate

router = APIRouter()

@router.post("/components/", response_model=ComponentResponse)
async def create_component(
    component: ComponentCreate,
    current_user: User = Depends(get_current_user)
) -> ComponentResponse:
    """Create a new component with proper error handling."""
    try:
        # Business logic here
        return ComponentResponse.from_orm(result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

## Troubleshooting Guide

### Common Development Issues

#### Port Conflicts
```bash
# Kill processes on development ports
pkill -f "uvicorn.*8000"  # Kill backend
pkill -f "next.*3000"     # Kill frontend
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose ps
docker-compose logs database

# Reset database
cd backend
alembic downgrade base
alembic upgrade head
```

#### AI Service Failures
```bash
# Check API key configuration
echo $OPENAI_API_KEY
echo $CLAUDE_API_KEY

# Review service logs
tail -f backend.log | grep "ai_service"
```

#### Build Failures
```bash
# Clean and rebuild frontend
cd web-builder
rm -rf node_modules package-lock.json
npm install

# Clean backend dependencies
cd backend
pip install --upgrade -r requirements.txt
```

#### Theme Consistency Issues
```bash
# Check for hardcoded theme values
grep -r "bg-white\|text-gray-900\|bg-blue" web-builder/src/

# Validate theme usage
npm run lint:theme
```

### Log Analysis
```bash
# Error tracking
grep ERROR backend.log
grep WARN web-builder.log

# Performance monitoring
grep "response_time" backend.log
grep "magic_connector" backend.log
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
- Image optimization (WebP/AVIF)
- CDN deployment via Vercel

### Backend Optimization
- Database query optimization
- Redis caching strategy
- Asynchronous task processing (Celery)
- Connection pooling
- API response compression

### AI Service Optimization
- Model routing for cost efficiency
- Response caching
- Batch processing where possible
- Timeout and retry policies
- Token optimization (70% reduction target)

## Success Metrics

### Technical KPIs
- **Magic Moment Achievement**: <30 minutes template to live site
- **AI Response Time**: <5 seconds for customization
- **Platform Performance**: <2 seconds for interactions
- **Theme Consistency**: 100% (currently 50%)
- **Test Success Rate**: 95% E2E tests passing
- **Uptime**: 99.9% availability

### Quality Metrics
- **Component Quality**: 80% Tier 1 components
- **User Satisfaction**: Net Promoter Score >50
- **Workflow Connection Rate**: >60% of users connect components
- **AI Customization Success**: >80% successful modifications

## Contributing Guidelines

### Code Review Checklist
- [ ] Theme consistency maintained (no hardcoded light theme)
- [ ] TypeScript strict mode compliance
- [ ] Component quality meets Tier 1 standards
- [ ] Magic Connector integration tested
- [ ] Performance benchmarks met
- [ ] Accessibility standards followed
- [ ] Tests added for new functionality
- [ ] Documentation updated

### Documentation Requirements
- API endpoint documentation for new endpoints
- Component usage examples in Storybook
- Architecture decision records for major changes
- Performance benchmark updates

This specification serves as the definitive guide for development on the AI Marketing Web Builder platform. It should be referenced for all development decisions and updated as the project evolves.