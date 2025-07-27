# Backend Team Specification - AI Marketing Web Builder Platform

## Team Responsibilities

**Primary Focus:** n8n-style workflow engine, built-in CRM, and AI service orchestration  
**Technology Stack:** FastAPI, Python 3.11+, PostgreSQL, Redis, Celery, React Flow  
**Team Size:** 3-4 developers + 1 DevOps engineer  

## Core Objectives

### Phase 1 (0-4 months): Workflow Engine + CRM Foundation
Build visual workflow automation system with built-in CRM and template management.

### Phase 2 (4-8 months): Advanced Automation & Integrations  
Develop sophisticated workflow capabilities and third-party integrations.

### Phase 3 (8-12 months): Enterprise & Analytics
Complete platform backend with advanced analytics, team features, and enterprise capabilities.

## Technical Requirements

### Architecture
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

### Core Systems Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                  🎨 TEMPLATE ENGINE                         │
│   • 30+ Premium Template Storage                            │
│   • Template Customization API                              │
│   • Component Library Management                            │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                 🔗 WORKFLOW ENGINE                          │
│   • n8n-Style Visual Workflow Execution                     │
│   • Trigger-Action-Condition Processing                     │
│   • Real-time Workflow Monitoring                           │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   📊 CRM ENGINE                             │
│   • Contact Management & Segmentation                       │
│   • Email Automation Sequences                              │
│   • Lead Scoring & Analytics                                │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                 ⚙️ EXECUTION ENGINE                         │
│   • Background Job Processing                               │
│   • Real-time Event Handling                               │
│   • Performance Monitoring                                  │
└─────────────────────────────────────────────────────────────┘
```

### Database Design
```sql
-- Core Platform Tables
users (id, email, auth_data, subscription_tier, created_at)
sites (id, user_id, name, domain, template_id, published_at)
components (id, site_id, type, config, position, workflows_connected)
templates (id, name, category, components_data, preview_image)

-- Workflow System Tables
workflows (id, site_id, name, trigger_config, actions_config, active)
workflow_executions (id, workflow_id, trigger_data, status, executed_at)
workflow_nodes (id, workflow_id, type, config, position, connections)

-- CRM System Tables
contacts (id, user_id, email, name, source_component, created_at)
contact_activities (id, contact_id, type, data, timestamp)
email_campaigns (id, user_id, subject, content, workflow_id, status)
email_sends (id, campaign_id, contact_id, status, sent_at, opened_at)

-- Analytics Tables
component_analytics (id, component_id, views, interactions, conversions)
workflow_analytics (id, workflow_id, executions, success_rate, avg_duration)
site_analytics (id, site_id, visitors, page_views, conversion_rate)
```

## Phase Breakdown

### Sprint 1 (Days 1-14): Foundation + Template System

#### Days 1-3: Core Infrastructure (72 hours)
**15-minute intervals: 0-288**

**Hours 0-12: Backend Foundation**
- 00:00-02:00: FastAPI project setup with SQLAlchemy
- 02:00-04:00: PostgreSQL database setup and migrations
- 04:00-06:00: Redis setup for caching and job queues
- 06:00-08:00: Celery configuration for background tasks
- 08:00-10:00: Authentication system with JWT
- 10:00-12:00: Basic API structure and error handling

**Hours 12-24: Database Schema & Models**
- 12:00-15:00: User and site management models
- 15:00-18:00: Template and component models
- 18:00-21:00: Workflow system models
- 21:00-24:00: CRM and contact models

**Hours 24-36: Template Management System**
- 24:00-27:00: Template CRUD operations
- 27:00-30:00: Template categorization and search
- 30:00-33:00: Template instantiation API
- 33:00-36:00: Component library management

**Hours 36-48: Component System**
- 36:00-39:00: Smart component CRUD operations
- 39:00-42:00: Component configuration and styling
- 42:00-45:00: Component positioning and layout
- 45:00-48:00: Component-workflow connection tracking

**Hours 48-60: Site Management**
- 48:00-51:00: Site creation and management APIs
- 51:00-54:00: Site publishing and preview system
- 54:00-57:00: Custom domain management
- 57:00-60:00: Site analytics foundation

**Hours 60-72: API Security & Validation**
- 60:00-63:00: Input validation and sanitization
- 63:00-66:00: Rate limiting and security headers
- 66:00-69:00: API documentation with OpenAPI
- 69:00-72:00: Testing framework setup

#### Days 4-7: Workflow Engine Foundation (96 hours)
**15-minute intervals: 288-672**

**Hours 72-84: Workflow Core Architecture**
- 72:00-75:00: Workflow definition and storage system
- 75:00-78:00: Node-based workflow representation
- 78:00-81:00: Workflow validation and parsing
- 81:00-84:00: Workflow version control and history

**Hours 84-96: Trigger System**
- 84:00-87:00: Form submission trigger processing
- 87:00-90:00: Page interaction trigger detection
- 90:00-93:00: Time-based trigger scheduling
- 93:00-96:00: Custom event trigger system

**Hours 96-108: Action System**
- 96:00-99:00: Email sending action implementation
- 99:00-102:00: CRM update action processing
- 102:00-105:00: Webhook and API call actions
- 105:00-108:00: Conditional logic and branching

**Hours 108-120: Workflow Execution Engine**
- 108:00-111:00: Celery-based workflow execution
- 111:00-114:00: Real-time execution monitoring
- 114:00-117:00: Error handling and retry mechanisms
- 117:00-120:00: Execution logging and analytics

**Hours 120-132: Workflow Management APIs**
- 120:00-123:00: Workflow CRUD operations
- 123:00-126:00: Workflow testing and simulation
- 126:00-129:00: Workflow activation and deactivation
- 129:00-132:00: Workflow performance monitoring

**Hours 132-144: Integration with Components**
- 132:00-135:00: Component-workflow connection API
- 135:00-138:00: Automatic workflow suggestion system
- 138:00-141:00: Workflow template matching
- 141:00-144:00: Component interaction tracking

**Hours 144-156: Workflow Analytics**
- 144:00-147:00: Execution metrics collection
- 147:00-150:00: Success rate and performance tracking
- 150:00-153:00: Workflow optimization recommendations
- 153:00-156:00: Real-time monitoring dashboard data

**Hours 156-168: Testing & Optimization**
- 156:00-162:00: Workflow execution testing
- 162:00-165:00: Performance optimization
- 165:00-168:00: Scalability and load testing

#### Days 8-14: CRM System & Email Automation (168 hours)
**15-minute intervals: 672-1344**

**Hours 168-192: Contact Management System**
- 168:00-174:00: Contact CRUD operations and data model
- 174:00-180:00: Contact import/export and bulk operations
- 180:00-186:00: Contact segmentation and tagging
- 186:00-192:00: Contact activity timeline and tracking

**Hours 192-216: Email System Foundation**
- 192:00-198:00: Email template system and editor
- 198:00-204:00: Email sending infrastructure (SMTP/SendGrid)
- 204:00-210:00: Email tracking (opens, clicks, bounces)
- 210:00-216:00: Unsubscribe and compliance management

**Hours 216-240: Email Automation Sequences**
- 216:00-222:00: Drip campaign creation and scheduling
- 222:00-228:00: Conditional email sequences
- 228:00-234:00: Personalization and dynamic content
- 234:00-240:00: A/B testing for email campaigns

**Hours 240-264: Lead Scoring & Analytics**
- 240:00-246:00: Lead scoring algorithm implementation
- 246:00-252:00: Contact behavior tracking
- 252:00-258:00: Conversion attribution system
- 258:00-264:00: ROI and performance analytics

**Hours 264-288: CRM Workflow Integration**
- 264:00-270:00: CRM action integration with workflows
- 270:00-276:00: Contact lifecycle automation
- 276:00-282:00: Sales pipeline management
- 282:00-288:00: Customer journey tracking

**Hours 288-312: Advanced CRM Features**
- 288:00-294:00: Custom fields and contact properties
- 294:00-300:00: Contact duplicate detection and merging
- 300:00-306:00: Contact source attribution
- 306:00-312:00: Advanced search and filtering

**Hours 312-336: CRM APIs & Integration**
- 312:00-318:00: Contact management APIs
- 318:00-324:00: Email campaign APIs
- 324:00-330:00: Analytics and reporting APIs
- 330:00-336:00: Third-party CRM export capabilities

### Sprint 2 (Days 15-28): AI Integration + Advanced Workflows

#### Days 15-21: AI Workflow Assistant (168 hours)

**Hours 336-384: Component Analysis AI**
- Component type analysis for workflow suggestions
- Industry-specific automation recommendations
- User goal mapping to workflow templates
- Intelligent workflow generation

**Hours 384-432: Workflow Optimization AI**
- Performance analysis and recommendations
- Automated A/B testing suggestions
- Conversion rate optimization
- Workflow refinement based on data

#### Days 22-28: Advanced Workflow Features (168 hours)

**Hours 432-480: Complex Workflow Logic**
- Advanced conditional branching
- Loop and iteration support
- Multi-step sequences with delays
- Parallel workflow execution

**Hours 480-528: Third-party Integrations**
- Zapier-style webhook integrations
- Stripe payment processing
- Slack and Discord notifications
- Social media posting automation

### Sprint 3 (Days 29-42): Analytics + Enterprise Features

#### Days 29-35: Advanced Analytics (168 hours)

**Hours 528-576: Component Performance Analytics**
- Real-time component interaction tracking
- Conversion funnel analysis
- Heat mapping data collection
- User behavior pattern recognition

**Hours 576-624: Workflow Performance Analytics**
- Execution time and success rate monitoring
- Bottleneck identification and optimization
- ROI calculation for automated workflows
- Predictive analytics for workflow performance

#### Days 36-42: Enterprise & Publishing (168 hours)

**Hours 624-672: Team Collaboration**
- Multi-user workspace management
- Permission and role-based access control
- Comment and approval workflows
- Activity logging and audit trails

**Hours 672-720: Publishing & Domain Management**
- Custom domain setup and SSL
- CDN integration for performance
- SEO optimization and meta management
- Site backup and restore functionality

## API Specifications

### Workflow Engine APIs

#### Workflow Management
```python
POST /api/workflows
{
    "site_id": "uuid",
    "name": "Contact Form Follow-up",
    "trigger": {
        "type": "form_submission",
        "component_id": "contact-form-1",
        "conditions": []
    },
    "actions": [
        {
            "type": "send_email",
            "template_id": "welcome-email",
            "delay": 0
        },
        {
            "type": "add_to_crm",
            "list_id": "prospects",
            "delay": 0
        }
    ]
}

GET /api/workflows/{workflow_id}/analytics
# Returns workflow performance metrics

POST /api/workflows/{workflow_id}/execute
{
    "trigger_data": {
        "form_data": {"email": "user@example.com", "name": "John Doe"},
        "source_component": "contact-form-1"
    }
}
```

#### AI Workflow Suggestions
```python
POST /api/ai/suggest-workflows
{
    "component_type": "contact_form",
    "component_config": {
        "fields": ["name", "email", "message"],
        "submit_text": "Get In Touch"
    },
    "site_context": {
        "industry": "professional_services",
        "goals": ["lead_generation", "client_acquisition"]
    }
}

# Response
{
    "suggestions": [
        {
            "name": "Professional Services Lead Follow-up",
            "description": "Send welcome email, add to CRM, notify team",
            "confidence": 0.92,
            "workflow_template": {
                "trigger": {...},
                "actions": [...]
            }
        }
    ]
}
```

### CRM System APIs

#### Contact Management
```python
POST /api/crm/contacts
{
    "email": "user@example.com",
    "name": "John Doe",
    "source_component": "contact-form-1",
    "custom_fields": {
        "company": "Acme Corp",
        "phone": "+1234567890"
    }
}

GET /api/crm/contacts?segment=prospects&limit=50
# Returns segmented contact list

POST /api/crm/contacts/{contact_id}/activities
{
    "type": "page_view",
    "data": {
        "page": "/pricing",
        "duration": 45,
        "timestamp": "2024-01-01T10:30:00Z"
    }
}
```

#### Email Campaigns
```python
POST /api/crm/campaigns
{
    "name": "Welcome Sequence",
    "type": "drip",
    "emails": [
        {
            "subject": "Welcome to our platform!",
            "template_id": "welcome-email",
            "delay_hours": 0
        },
        {
            "subject": "Getting started guide",
            "template_id": "onboarding-email",
            "delay_hours": 24
        }
    ],
    "trigger_workflow_id": "contact-form-workflow"
}

GET /api/crm/campaigns/{campaign_id}/analytics
# Returns campaign performance metrics
```

### Template System APIs

#### Template Management
```python
GET /api/templates?category=saas&limit=10
# Returns templates with filtering

POST /api/templates/{template_id}/instantiate
{
    "site_id": "uuid",
    "customizations": {
        "primary_color": "#3B82F6",
        "company_name": "Acme Corp",
        "contact_email": "hello@acme.com"
    }
}

GET /api/templates/{template_id}/components
# Returns component structure for template
```

## Database Implementation

### Workflow System Models
```python
class Workflow(BaseModel):
    id: UUID
    site_id: UUID
    name: str
    description: Optional[str]
    trigger_config: Dict[str, Any]
    actions_config: List[Dict[str, Any]]
    active: bool = True
    created_at: datetime
    updated_at: datetime

class WorkflowExecution(BaseModel):
    id: UUID
    workflow_id: UUID
    trigger_data: Dict[str, Any]
    status: ExecutionStatus
    started_at: datetime
    completed_at: Optional[datetime]
    error_message: Optional[str]
    execution_log: List[Dict[str, Any]]

class WorkflowNode(BaseModel):
    id: UUID
    workflow_id: UUID
    type: NodeType  # trigger, action, condition
    config: Dict[str, Any]
    position: Dict[str, float]  # x, y coordinates
    connections: List[UUID]  # connected node IDs
```

### CRM System Models
```python
class Contact(BaseModel):
    id: UUID
    user_id: UUID
    email: EmailStr
    name: Optional[str]
    phone: Optional[str]
    source_component: Optional[str]
    source_workflow: Optional[UUID]
    tags: List[str] = []
    custom_fields: Dict[str, Any] = {}
    lead_score: int = 0
    status: ContactStatus = ContactStatus.ACTIVE
    created_at: datetime
    last_activity: Optional[datetime]

class ContactActivity(BaseModel):
    id: UUID
    contact_id: UUID
    type: ActivityType
    data: Dict[str, Any]
    timestamp: datetime
    source: str  # component_id, workflow_id, etc.

class EmailCampaign(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    subject: str
    content: str
    template_id: Optional[UUID]
    workflow_id: Optional[UUID]
    status: CampaignStatus
    scheduled_at: Optional[datetime]
    sent_at: Optional[datetime]
    recipients_count: int = 0
    opens_count: int = 0
    clicks_count: int = 0
```

## Background Job Processing

### Workflow Execution Jobs
```python
from celery import Celery

celery_app = Celery('workflow_engine')

@celery_app.task(bind=True)
def execute_workflow(self, workflow_id: str, trigger_data: dict):
    """Execute a complete workflow with all actions"""
    workflow = get_workflow(workflow_id)
    execution = create_execution_record(workflow_id, trigger_data)
    
    try:
        for action in workflow.actions_config:
            # Execute each action with delay if specified
            if action.get('delay', 0) > 0:
                execute_action_delayed.apply_async(
                    args=[execution.id, action],
                    countdown=action['delay'] * 60
                )
            else:
                execute_action(execution.id, action)
        
        update_execution_status(execution.id, 'completed')
        
    except Exception as exc:
        update_execution_status(execution.id, 'failed', str(exc))
        raise

@celery_app.task
def execute_action_delayed(execution_id: str, action_config: dict):
    """Execute a single workflow action with delay"""
    execute_action(execution_id, action_config)

@celery_app.task
def send_email_action(execution_id: str, email_config: dict):
    """Send email as part of workflow"""
    # Implementation for email sending
    pass

@celery_app.task
def update_crm_action(execution_id: str, crm_config: dict):
    """Update CRM as part of workflow"""
    # Implementation for CRM updates
    pass
```

### Email Campaign Jobs
```python
@celery_app.task
def send_campaign_emails(campaign_id: str):
    """Send emails for a campaign to all recipients"""
    campaign = get_campaign(campaign_id)
    contacts = get_campaign_recipients(campaign_id)
    
    for contact in contacts:
        send_campaign_email.delay(campaign_id, contact.id)

@celery_app.task
def send_campaign_email(campaign_id: str, contact_id: str):
    """Send individual campaign email"""
    # Implementation for individual email sending
    pass

@celery_app.task
def process_email_webhook(webhook_data: dict):
    """Process email service webhooks (opens, clicks, bounces)"""
    # Implementation for webhook processing
    pass
```

## Performance Optimization

### Database Optimization
```python
# Optimized queries with proper indexing
class WorkflowRepository:
    async def get_active_workflows_for_component(self, component_id: str):
        """Get workflows triggered by specific component"""
        return await self.db.execute(
            select(Workflow)
            .where(Workflow.active == True)
            .where(Workflow.trigger_config['component_id'].astext == component_id)
            .options(selectinload(Workflow.executions))
        )
    
    async def get_workflow_analytics(self, workflow_id: str, days: int = 30):
        """Get workflow performance analytics"""
        return await self.db.execute(
            select(
                func.count(WorkflowExecution.id).label('total_executions'),
                func.avg(
                    extract('epoch', WorkflowExecution.completed_at - WorkflowExecution.started_at)
                ).label('avg_duration'),
                func.sum(
                    case((WorkflowExecution.status == 'completed', 1), else_=0)
                ).label('successful_executions')
            )
            .where(WorkflowExecution.workflow_id == workflow_id)
            .where(WorkflowExecution.started_at >= datetime.utcnow() - timedelta(days=days))
        )
```

### Caching Strategy
```python
from functools import lru_cache
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

@lru_cache(maxsize=1000)
def get_workflow_template(workflow_type: str, industry: str) -> dict:
    """Cache workflow templates by type and industry"""
    cache_key = f"workflow_template:{workflow_type}:{industry}"
    cached = redis_client.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    template = generate_workflow_template(workflow_type, industry)
    redis_client.setex(cache_key, 3600, json.dumps(template))
    
    return template

async def cache_component_analytics(component_id: str, analytics_data: dict):
    """Cache component performance data"""
    cache_key = f"component_analytics:{component_id}"
    redis_client.setex(cache_key, 900, json.dumps(analytics_data))  # 15 min cache
```

## Success Metrics

### Technical Performance
- **Workflow Execution:** <2 seconds average execution time
- **API Response Times:** <300ms for CRUD operations  
- **Database Queries:** <100ms average response time
- **Email Delivery:** 99%+ delivery rate

### System Reliability
- **Workflow Success Rate:** >99% successful executions
- **Uptime:** 99.9% API availability
- **Error Recovery:** <5 minutes automatic recovery
- **Data Integrity:** 100% workflow execution logging

### Business Metrics
- **Workflow Adoption:** >80% of sites use workflows
- **Email Engagement:** >25% open rate, >5% click rate
- **CRM Data Quality:** >95% valid contact information
- **Processing Capacity:** 10,000+ workflow executions per hour

## Communication Protocols

### Backend Team Status (Every 4 hours)
```
BACKEND STATUS [TIMESTAMP]

System Performance:
- Workflow Executions: 8,420 in last 4h (avg: 35/min)
- API Response Time: 245ms average (target: <300ms)
- Database Performance: 85ms average queries (target: <100ms)
- Email Delivery Rate: 98.7% (target: >99%)

Feature Progress:
- Workflow Engine: 89% complete (target: 95% by end of sprint)
- CRM System: 76% complete (target: 85% by end of sprint)
- Template System: 94% complete (target: 100% by end of sprint)
- AI Integration: 67% complete (target: 75% by end of sprint)

Current Focus:
- [Specific workflow features being developed]
- [CRM automation sequences in progress]
- [Performance optimization areas]

Blockers:
- [AI service integration dependencies]
- [Third-party API limitations]
- [Database migration issues]

Next 4 Hours:
- [Workflow execution improvements planned]
- [CRM feature completions scheduled]
- [Integration testing milestones]
```

This updated backend specification focuses on the core workflow engine, built-in CRM, and template system that powers the unified platform approach.