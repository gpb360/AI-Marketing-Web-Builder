#!/usr/bin/env python3
"""
Minimal FastAPI server for testing environment.
"""

import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add backend to path
backend_path = '/mnt/d/s7s-projects/AI-Marketing-Web-Builder/backend'
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Create minimal FastAPI app
app = FastAPI(
    title="AI Marketing Web Builder - Development Server",
    description="Minimal server for backend environment validation",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AI Marketing Web Builder Backend",
        "status": "running",
        "environment": "development"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "backend"}

@app.get("/api/v1/test")
async def api_test():
    """API test endpoint."""
    return {
        "message": "Backend API is working",
        "python_version": sys.version,
        "app_routes": len(app.routes)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=False,
        log_level="info"
    )