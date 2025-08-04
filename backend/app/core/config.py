from pydantic_settings import BaseSettings
from typing import List, Optional
import secrets
import os


class Settings(BaseSettings):
    """Application settings using Pydantic BaseSettings."""
    
    # App info
    APP_NAME: str = "AI Marketing Web Builder"
    DESCRIPTION: str = "AI-powered SaaS platform for creating marketing websites"
    VERSION: str = "1.0.0"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./app.db"
    
    # API
    API_V1_STR: str = "/api/v1"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3002"
    ]
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Development
    DEBUG: bool = True
    
    # Database settings
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3002"
    ]
    
    class Config:
        case_sensitive = True
        env_file = ".env"


# Create settings instance
settings = Settings()