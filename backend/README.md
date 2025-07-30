# AI Marketing Web Builder - Backend API

A FastAPI-based backend for the AI Marketing Web Builder Platform, featuring template management, workflow automation, and built-in CRM functionality.

## Features

- **FastAPI Framework**: High-performance async API with automatic OpenAPI documentation
- **Template Management**: 30+ premium website templates with component system
- **Workflow Engine**: n8n-style visual workflow automation
- **Built-in CRM**: Contact management, lead scoring, and email campaigns
- **User Authentication**: JWT-based authentication with role-based access
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **Caching**: Redis for session management and background job queues
- **Background Tasks**: Celery for workflow execution and email processing

## Architecture

```
FastAPI Application
├── /api/templates         # Template management and storage
├── /api/components        # Smart component CRUD and workflow connections
├── /api/workflows         # n8n-style visual workflow engine
├── /api/crm              # Built-in CRM and contact management
├── /api/ai               # AI workflow suggestions and component analysis
├── /api/automation       # Workflow execution and monitoring
├── /api/analytics        # Component and workflow performance tracking
└── /api/publishing       # Site publishing and domain management
```

## Quick Start

### Using Docker (Recommended)

1. **Clone and setup**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Start services**:
   ```bash
   make up
   ```

3. **Run migrations**:
   ```bash
   make migrate
   ```

4. **Access the API**:
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

### Manual Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Setup database** (PostgreSQL required):
   ```bash
   createdb ai_marketing_builder
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run migrations**:
   ```bash
   alembic upgrade head
   ```

5. **Start the server**:
   ```bash
   python run.py
   ```

## Development

### Available Commands

```bash
make help          # Show all available commands
make dev           # Run development server
make test          # Run tests
make lint          # Run linting
make format        # Format code
make migrate       # Run database migrations
make shell         # Open container shell
```

### Project Structure

```
backend/
├── app/
│   ├── api/v1/endpoints/     # API endpoints
│   ├── core/                 # Core configuration and security
│   ├── db/                   # Database configuration
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic schemas
│   ├── services/             # Business logic services
│   └── utils/                # Utility functions
├── alembic/                  # Database migrations
├── tests/                    # Test files
└── requirements.txt          # Python dependencies
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token

### Templates
- `GET /api/v1/templates/` - List templates
- `GET /api/v1/templates/{id}` - Get template details
- `POST /api/v1/templates/` - Create template (admin)
- `PUT /api/v1/templates/{id}` - Update template (admin)

### Workflows
- `GET /api/v1/workflows/` - List user workflows
- `POST /api/v1/workflows/` - Create workflow
- `POST /api/v1/workflows/{id}/trigger` - Trigger workflow
- `GET /api/v1/workflows/{id}/executions` - Execution history

### CRM
- `GET /api/v1/crm/contacts` - List contacts
- `POST /api/v1/crm/contacts` - Create contact
- `PUT /api/v1/crm/contacts/{id}` - Update contact
- `GET /api/v1/crm/campaigns` - List email campaigns

## Database Models

### Core Models
- **User**: Authentication and user profiles
- **Template**: Website template definitions
- **Project**: User-created websites
- **Workflow**: Automation workflows with n8n-style nodes
- **CRMContact**: Contact and lead management
- **EmailCampaign**: Email marketing campaigns

### Relationships
- Users can have multiple projects and workflows
- Templates can be used by multiple projects
- Workflows can be triggered by various events
- CRM contacts can have multiple activities

## Configuration

Key environment variables:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External Services
OPENAI_API_KEY=your-openai-key
```

## Testing

Run the test suite:

```bash
make test
```

Run with coverage:

```bash
pytest --cov=app tests/
```

## Deployment

### Production Setup

1. **Environment Configuration**:
   ```bash
   export ENVIRONMENT=production
   export DEBUG=false
   ```

2. **Database Setup**:
   ```bash
   # Setup production PostgreSQL
   alembic upgrade head
   ```

3. **Run with Gunicorn**:
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Performance

- **API Response Time**: <300ms average
- **Database Connections**: Pooled with configurable limits
- **Caching**: Redis for frequently accessed data
- **Background Processing**: Celery for heavy operations

## Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy
- Rate limiting middleware

## Monitoring

- Health check endpoint: `/health`
- Structured logging with configurable levels
- Database query logging in development
- Error tracking with optional Sentry integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and formatting
6. Submit a pull request

## License

This project is proprietary and confidential.