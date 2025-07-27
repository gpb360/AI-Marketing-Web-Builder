"""
AI Marketing Web Builder Platform - Main FastAPI Application
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from contextlib import asynccontextmanager

from core.config import settings
from core.database import init_database, close_database_connections

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown events."""
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.version}")
    logger.info(f"Environment: {settings.environment}")
    
    try:
        # Initialize database
        await init_database()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        # Continue startup even if DB fails for development
        
    yield
    
    # Shutdown
    logger.info("Shutting down application")
    await close_database_connections()


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="AI-powered marketing automation platform with workflow management",
    debug=settings.debug,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoints
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.version,
        "environment": settings.environment,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "timestamp": "2024-12-10T00:00:00Z",
        "version": settings.version,
        "environment": settings.environment
    }


@app.get("/api/status")
async def api_status():
    """Detailed API status for debugging."""
    return {
        "api": {
            "name": settings.app_name,
            "version": settings.version,
            "environment": settings.environment,
            "debug": settings.debug
        },
        "services": {
            "database": "pending",  # Will be implemented when DB connection works
            "redis": "pending",
            "celery": "pending",
            "email": "pending"
        },
        "features": {
            "workflow_automation": "available",
            "crm_integration": "available", 
            "ai_services": "available",
            "campaign_management": "available"
        }
    }


# API Routes (will be added as modules are created)
@app.get("/api/workflows")
async def get_workflows():
    """Get available workflows - placeholder."""
    return {
        "workflows": [],
        "total": 0,
        "message": "Workflow system ready for implementation"
    }


@app.get("/api/campaigns")
async def get_campaigns():
    """Get campaigns - placeholder."""
    return {
        "campaigns": [],
        "total": 0,
        "message": "Campaign system ready for implementation"
    }


@app.get("/api/users/me")
async def get_current_user():
    """Get current user - placeholder."""
    return {
        "user": None,
        "message": "Authentication system ready for implementation"
    }


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors."""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found",
            "message": f"The requested endpoint was not found",
            "path": str(request.url.path)
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.log_level.lower()
    )