# Backend Service Guide - Magic Connector Sprint

## 🎯 Sprint Objective
Verify and complete Magic Connector backend service integration, ensuring AI services and database connections are properly configured.

## ✅ Current Backend Status

### Magic Connector Service Implementation
**File**: `/backend/app/services/magic_connector_service.py`
- ✅ **Service Architecture**: Complete MagicConnectorService class
- ✅ **AI Integration**: GPT-4 and Claude service integration
- ✅ **Caching System**: Redis cache integration for performance
- ✅ **Component Analysis**: AI-powered component analysis logic

### API Endpoints Ready
**File**: `/backend/app/api/v1/endpoints/magic_connector.py`
- ✅ **Analyze Component**: `/api/v1/magic-connector/analyze-component`
- ✅ **Create Workflow**: `/api/v1/magic-connector/create-workflow-from-suggestion`
- ✅ **Magic Moment Status**: `/api/v1/magic-connector/magic-moment-status`
- ✅ **Workflow Templates**: `/api/v1/magic-connector/templates/{trigger_type}`

## 🔧 Verification Steps

### Step 1: Service Dependencies Check (1 hour)
```bash
# Verify backend environment
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Check service imports
python -c "from app.services.magic_connector_service import MagicConnectorService; print('✅ Magic Connector Service OK')"
python -c "from app.services.ai_service import AIService; print('✅ AI Service OK')"
python -c "from app.cache.redis_cache import RedisCache; print('✅ Redis Cache OK')"
```

### Step 2: Database Connection Verification (30 minutes)
```bash
# Test database models
python -c "from app.models.component import Component; print('✅ Component Model OK')"
python -c "from app.models.workflow import Workflow; print('✅ Workflow Model OK')"

# Run database migrations if needed
alembic upgrade head
```

### Step 3: AI Service Configuration (1 hour)
**Environment Variables Required**:
```bash
# Add to .env file
OPENAI_API_KEY=your_gpt4_key_here
ANTHROPIC_API_KEY=your_claude_key_here
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost/dbname
```

**AI Service Test**:
```python
# Test AI service integration
from app.services.ai_service import AIService
from app.core.config import get_settings

settings = get_settings()
ai_service = AIService()

# Test component analysis
result = await ai_service.analyze_component_for_workflows({
    "type": "contact-form",
    "properties": {"fields": ["name", "email"]}
})
print("✅ AI Analysis Working:", result)
```

### Step 4: API Endpoint Testing (1 hour)
```bash
# Start backend server
uvicorn app.main:app --reload --port 8000

# Test health endpoint
curl http://localhost:8000/health

# Test Magic Connector endpoints (requires authentication)
curl -X POST http://localhost:8000/api/v1/magic-connector/analyze-component \
  -H "Content-Type: application/json" \
  -d '{"component_type": "contact-form", "component_data": {}}'
```

## 🚨 Common Issues & Solutions

### Issue 1: AI Service Configuration
**Problem**: AI services not responding
**Solution**: 
1. Verify API keys in environment
2. Check network connectivity to OpenAI/Anthropic
3. Test with simple API calls first

### Issue 2: Database Connection
**Problem**: Database models not working
**Solution**:
1. Run `alembic upgrade head` to create tables
2. Verify DATABASE_URL in environment
3. Check PostgreSQL service is running

### Issue 3: Redis Cache Issues
**Problem**: Cache service not working
**Solution**:
1. Start Redis server: `redis-server`
2. Verify REDIS_URL configuration
3. Test connection: `redis-cli ping`

## 📊 Service Performance Targets

### Response Time Requirements
- **Component Analysis**: <5 seconds (target: 2 seconds)
- **Workflow Creation**: <10 seconds (target: 5 seconds)  
- **Template Retrieval**: <1 second (cached)
- **Magic Moment Status**: <500ms

### AI Service Optimization
- **Cache Hit Rate**: >90% for repeated component analyses
- **Token Usage**: Optimized prompts to reduce costs
- **Fallback System**: Graceful degradation if AI services unavailable

## 🧪 Backend Testing Checklist

### Service Integration Tests
- [ ] MagicConnectorService initializes without errors
- [ ] AI services (GPT-4, Claude) respond to test queries
- [ ] Redis cache stores and retrieves data correctly
- [ ] Database models save and query successfully

### API Endpoint Tests
- [ ] Health endpoint returns 200 OK
- [ ] Magic Connector endpoints accept requests
- [ ] Authentication middleware works correctly
- [ ] Error responses are properly formatted

### Performance Tests
- [ ] Component analysis completes within 5 seconds
- [ ] Concurrent requests handled properly
- [ ] Memory usage remains stable under load
- [ ] Cache performance meets targets

## 🔒 Security Verification

### Authentication & Authorization
- [ ] JWT token validation working
- [ ] User permissions properly enforced
- [ ] API rate limiting configured
- [ ] Input validation on all endpoints

### AI Service Security
- [ ] API keys stored securely in environment
- [ ] No sensitive data logged
- [ ] Prompt injection protection implemented
- [ ] User data properly sanitized

## 📁 Key Backend Files

**Service Layer**:
- `/backend/app/services/magic_connector_service.py` (main service)
- `/backend/app/services/ai_service.py` (AI integration)
- `/backend/app/cache/redis_cache.py` (caching)

**API Layer**:
- `/backend/app/api/v1/endpoints/magic_connector.py` (endpoints)
- `/backend/app/schemas/magic_connector.py` (data validation)

**Data Layer**:
- `/backend/app/models/component.py` (component models)
- `/backend/app/models/workflow.py` (workflow models)

**Configuration**:
- `/backend/app/core/config.py` (settings)
- `/backend/.env` (environment variables)

---

**Estimated Timeline**: 3.5 hours  
**Dependencies**: AI service API keys, Database setup, Redis server  
**Risk Level**: Medium (external service dependencies)