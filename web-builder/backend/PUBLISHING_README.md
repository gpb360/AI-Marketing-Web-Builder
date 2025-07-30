# AI Marketing Web Builder - Site Publishing System

Complete site generation and publishing functionality for the AI Marketing Web Builder Platform.

## 🚀 Features

### Static Site Generation
- **Component-to-HTML conversion** from canvas state
- **CSS optimization** with Tailwind compilation and purging
- **JavaScript bundling** for interactive components
- **Image optimization** with WebP conversion and resizing
- **SEO optimization** with meta tags, sitemaps, and schema markup

### Hosting & Deployment
- **CDN integration** for global fast delivery (AWS S3 + CloudFront)
- **Custom domain support** with automatic SSL certificates
- **Preview URLs** for staging and testing
- **Version control** with rollback capabilities
- **Performance optimization** with caching and compression

### Domain Management
- **Custom domain connection** with DNS configuration
- **SSL certificate automation** via Let's Encrypt or AWS ACM
- **Subdomain provisioning** for quick deployments
- **Domain verification** and health monitoring

## 🏗️ Architecture

### Backend Components

```
Publishing System
├── Site Generator (src/services/site_generator.py)
│   ├── Component-to-HTML conversion
│   ├── CSS/JS optimization
│   ├── Image processing
│   └── SEO file generation
├── Domain Manager (src/services/domain_manager.py)  
│   ├── DNS configuration
│   ├── SSL certificate management
│   └── Domain verification
├── Publishing Service (src/services/publishing_service.py)
│   ├── Pipeline orchestration
│   ├── Deployment management
│   └── Status tracking
└── Background Tasks (src/services/tasks.py)
    ├── Celery task definitions
    ├── Periodic monitoring
    └── Performance optimization
```

### Database Models

```sql
-- Published site deployment information
CREATE TABLE published_sites (
    id UUID PRIMARY KEY,
    site_id UUID REFERENCES sites(id),
    domain VARCHAR(255) NOT NULL,
    custom_domain VARCHAR(255),
    ssl_status ssl_status_enum DEFAULT 'PENDING',
    domain_status domain_status_enum DEFAULT 'PENDING',
    build_status build_status_enum DEFAULT 'PENDING',
    cdn_url VARCHAR(500),
    preview_url VARCHAR(500),
    seo_settings JSONB DEFAULT '{}',
    performance_score INTEGER,
    ssl_expires_at TIMESTAMP,
    build_size INTEGER,
    build_hash VARCHAR(64),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Deployment history and version control
CREATE TABLE deployment_history (
    id UUID PRIMARY KEY,
    published_site_id UUID REFERENCES published_sites(id),
    version VARCHAR(50) NOT NULL,
    build_time TIMESTAMP NOT NULL,
    build_duration INTEGER,
    build_status build_status_enum NOT NULL,
    build_logs TEXT,
    rollback_data JSONB,
    is_rollback BOOLEAN DEFAULT FALSE,
    performance_score INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 API Endpoints

### Site Publishing
```http
POST /api/v1/sites/{site_id}/publish
Content-Type: application/json

{
    "custom_domain": "example.com",
    "seo_settings": {
        "meta_title": "My Site",
        "meta_description": "Site description"
    },
    "performance_optimization": true
}
```

### Publishing Status
```http
GET /api/v1/sites/{site_id}/publish/status
```

### Domain Management
```http
POST /api/v1/domains/verify
Content-Type: application/json

{
    "domain": "example.com"
}
```

### Deployment History
```http
GET /api/v1/sites/{site_id}/deployments?limit=10
```

### Rollback
```http
POST /api/v1/sites/{site_id}/rollback?target_version=v20250730-120000
```

## 🛠️ Setup & Development

### Prerequisites
- Python 3.11+
- PostgreSQL 13+
- Redis 6+
- Docker & Docker Compose (optional)

### Environment Variables
```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/aiwebbuilder
DATABASE_URL_SYNC=postgresql://user:pass@localhost:5432/aiwebbuilder

# Redis & Celery
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# AWS Services
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=aiwebbuilder-sites
CLOUDFRONT_DISTRIBUTION_ID=your_distribution_id

# Domain Management
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ZONE_ID=your_zone_id
DEFAULT_DOMAIN=aiwebbuilder.com

# SSL Certificates
ACME_DIRECTORY_URL=https://acme-v02.api.letsencrypt.org/directory
ACME_CONTACT_EMAIL=ssl@aiwebbuilder.com

# Build System
BUILD_TIMEOUT=600
MAX_BUILD_SIZE=104857600
CONCURRENT_BUILDS=5
```

### Development Setup

1. **Using Docker Compose (Recommended)**
```bash
cd backend/
docker-compose up -d
```

2. **Manual Setup**
```bash
# Install dependencies
pip install -r requirements.txt -r requirements-publishing.txt

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Start Celery worker (in another terminal)
celery -A src.services.tasks worker --loglevel=info

# Start Celery beat scheduler (in another terminal)
celery -A src.services.tasks beat --loglevel=info
```

### Monitoring
- **API Documentation**: http://localhost:8000/docs
- **Celery Flower**: http://localhost:5555
- **Health Check**: http://localhost:8000/health

## 📊 Publishing Pipeline

### 1. Site Generation
```python
# Triggered via API or background task
result = await site_generator.generate_site(site)
```
- Component-to-HTML conversion
- CSS compilation and minification
- JavaScript bundling
- Image optimization
- SEO file generation (sitemap.xml, robots.txt)

### 2. CDN Upload
```python
# Upload to S3 with CloudFront distribution
cdn_url = await site_generator.upload_to_cdn(build_dir, site)
```
- Static file upload to S3
- CloudFront cache invalidation
- Performance optimization headers

### 3. Domain Configuration
```python
# Setup custom domain (if provided)
domain_result = await domain_manager.setup_dns_records(domain, cdn_url)
```
- DNS record configuration
- Domain ownership verification
- SSL certificate request

### 4. SSL Certificate
```python
# Automatic SSL certificate via Let's Encrypt or AWS ACM
ssl_result = await domain_manager.request_ssl_certificate(domain)
```
- Certificate generation
- Domain validation
- Automatic renewal scheduling

### 5. Validation
```python
# Comprehensive deployment validation
validation = await domain_manager.validate_domain_configuration(domain)
```
- DNS resolution testing
- SSL certificate verification
- Performance scoring
- Security header validation

## 🔄 Background Tasks

### Periodic Tasks
- **SSL Certificate Monitoring**: Check expiring certificates every 6 hours
- **Deployment Validation**: Validate all deployments daily
- **Cleanup**: Remove failed builds every 12 hours

### On-Demand Tasks
- **Site Publishing**: Complete site generation and deployment
- **Domain Verification**: DNS and ownership validation
- **Performance Optimization**: Asset optimization and CDN warming
- **Analytics Generation**: Comprehensive site analytics reports

## 🚨 Monitoring & Alerts

### Health Checks
- Database connectivity
- Redis availability
- S3/CDN accessibility
- SSL certificate status

### Performance Metrics
- Build success rate: >99%
- Average build time: <5 minutes
- Site load time: <2 seconds globally
- SSL certificate uptime: 100%

### Error Handling
- Automatic retry for failed builds
- Graceful degradation for CDN issues
- Comprehensive logging and alerting
- Rollback capabilities for failed deployments

## 🔐 Security

### SSL/TLS
- Automatic HTTPS enforcement
- Modern TLS configuration
- Certificate transparency logging
- HSTS header implementation

### Content Security
- Security headers (CSP, HSTS, etc.)
- XSS protection
- Content type validation
- Rate limiting

### Access Control
- Domain ownership verification
- API authentication
- Resource isolation
- Audit logging

## 📈 Performance Optimization

### Build Optimization
- Parallel processing
- Incremental builds
- Asset caching
- Background processing

### Runtime Performance
- CDN distribution
- Gzip compression
- Image optimization
- Cache-Control headers

### Monitoring
- Core Web Vitals tracking
- Performance budgets
- Real user monitoring
- Lighthouse integration

## 🤝 Integration Points

### Frontend Integration
```javascript
// Publishing UI in builder toolbar
const publishSite = async (siteId, customDomain) => {
    const response = await fetch(`/api/v1/sites/${siteId}/publish`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({custom_domain: customDomain})
    });
    return response.json();
};
```

### Workflow Integration
```python
# Connect to n8n workflow system
workflow_trigger = {
    "event": "site_published",
    "site_id": site_id,
    "domain": published_site.primary_url
}
```

### Analytics Integration
```python
# Track publishing events
analytics.track("site_published", {
    "site_id": site_id,
    "build_time": build_duration,
    "performance_score": performance_score
})
```

## 🎯 Success Metrics

- **Publishing Success Rate**: 99%+ successful deployments
- **Build Performance**: <5 minute average build time
- **Global Performance**: <2 second load times worldwide
- **SSL Uptime**: 100% certificate availability
- **User Experience**: One-click publishing from builder

## 🔮 Future Enhancements

- **Multi-region deployment** for improved global performance
- **Advanced caching strategies** with edge computing
- **Real-time collaboration** during publishing process
- **A/B testing integration** for published sites
- **Advanced analytics** with conversion tracking