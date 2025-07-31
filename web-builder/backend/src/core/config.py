"""Application configuration using Pydantic settings."""

from typing import List, Optional
from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    app_name: str = "AI Web Builder Platform"
    version: str = "0.1.0"
    debug: bool = False
    environment: str = "development"
    
    # Database
    database_url: str = Field(..., description="PostgreSQL database URL")
    database_url_sync: str = Field(
        ..., description="Synchronous PostgreSQL database URL"
    )
    
    # Redis
    redis_url: str = Field(..., description="Redis connection URL")
    
    # Security
    secret_key: str = Field(..., description="Secret key for JWT tokens")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Email
    sendgrid_api_key: Optional[str] = None
    from_email: str = "noreply@aiwebbuilder.com"
    
    # Celery
    celery_broker_url: str = Field(..., description="Celery broker URL")
    celery_result_backend: str = Field(..., description="Celery result backend URL")
    
    # Logging
    log_level: str = "INFO"
    
    # AI Services
    openai_api_key: Optional[str] = None
    
    # Performance
    max_workflow_execution_time: int = 300  # 5 minutes
    max_concurrent_workflows: int = 100
    cache_ttl: int = 3600  # 1 hour
    
    # Site Publishing & CDN
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    s3_bucket_name: str = "aiwebbuilder-sites"
    cloudfront_distribution_id: Optional[str] = None
    
    # Domain Management
    cloudflare_api_token: Optional[str] = None
    cloudflare_zone_id: Optional[str] = None
    default_domain: str = "aiwebbuilder.com"
    
    # SSL Certificates
    acme_directory_url: str = "https://acme-v02.api.letsencrypt.org/directory"
    acme_contact_email: str = "ssl@aiwebbuilder.com"
    
    # Build System
    build_timeout: int = 600  # 10 minutes
    max_build_size: int = 100 * 1024 * 1024  # 100MB
    concurrent_builds: int = 5
    
    # Site Generation
    template_engine: str = "jinja2"
    css_minification: bool = True
    js_bundling: bool = True
    image_optimization: bool = True
    
    # Performance Monitoring
    lighthouse_api_key: Optional[str] = None
    analytics_api_key: Optional[str] = None
    
    @validator("allowed_origins", pre=True)
    def assemble_cors_origins(cls, v):
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError("CORS origins must be a string or list")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()