#!/usr/bin/env python3
"""
Mock backend server for development when main backend is not available.
This resolves the "Failed to fetch" error in Next.js by providing basic API responses.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import List, Dict, Any
from datetime import datetime

# Create FastAPI app
app = FastAPI(
    title="AI Marketing Web Builder - Mock API",
    description="Mock backend for development",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/")
async def root():
    return {"message": "Mock AI Marketing Web Builder API", "status": "running"}

# Mock API v1 endpoints
@app.get("/api/v1/health")
async def api_health():
    return {"status": "healthy", "version": "1.0.0"}

# Mock Templates endpoints
@app.get("/api/v1/templates")
async def get_templates():
    return {
        "templates": [
            {
                "id": 1,
                "name": "SaaS Landing Page",
                "description": "Modern SaaS landing page template",
                "category": "saas",
                "preview_url": "/templates/saas-landing.jpg",
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": 2,
                "name": "E-commerce Store",
                "description": "Complete e-commerce template",
                "category": "ecommerce",
                "preview_url": "/templates/ecommerce.jpg",
                "created_at": "2024-01-01T00:00:00Z"
            }
        ],
        "total": 2
    }

@app.get("/api/v1/templates/{template_id}")
async def get_template(template_id: int):
    if template_id == 1:
        return {
            "id": 1,
            "name": "SaaS Landing Page",
            "description": "Modern SaaS landing page template",
            "category": "saas",
            "components": [],
            "settings": {}
        }
    raise HTTPException(status_code=404, detail="Template not found")

# Mock Workflows endpoints
@app.get("/api/v1/workflows")
async def get_workflows():
    return {
        "workflows": [
            {
                "id": 1,
                "name": "Lead Capture Workflow",
                "description": "Capture and follow up with leads",
                "category": "marketing",
                "trigger_type": "form-submit",
                "status": "active",
                "created_at": "2024-01-01T00:00:00Z"
            }
        ],
        "total": 1,
        "page": 1,
        "size": 100,
        "pages": 1
    }

@app.post("/api/v1/workflows")
async def create_workflow(workflow_data: Dict[str, Any]):
    return {
        "id": 1,
        "name": workflow_data.get("name", "New Workflow"),
        "description": workflow_data.get("description", ""),
        "category": workflow_data.get("category", "automation"),
        "status": "draft",
        "created_at": datetime.now().isoformat()
    }

@app.get("/api/v1/workflows/{workflow_id}")
async def get_workflow(workflow_id: int):
    return {
        "id": workflow_id,
        "name": "Sample Workflow",
        "description": "A sample workflow",
        "category": "marketing",
        "status": "active",
        "nodes": [],
        "connections": []
    }

@app.get("/api/v1/workflows/templates")
async def get_workflow_templates():
    return [
        {
            "id": "lead-capture",
            "name": "Lead Capture Workflow",
            "description": "Capture leads from forms and send welcome emails",
            "category": "marketing",
            "trigger_type": "form-submit"
        }
    ]

# Mock Auth endpoints
@app.post("/api/v1/auth/login")
async def login(credentials: Dict[str, str]):
    return {
        "access_token": "mock_token_123",
        "token_type": "bearer",
        "expires_in": 3600,
        "user": {
            "id": 1,
            "email": "user@example.com",
            "name": "Test User"
        }
    }

@app.post("/api/v1/auth/register")
async def register(user_data: Dict[str, str]):
    return {
        "message": "User registered successfully",
        "user": {
            "id": 1,
            "email": user_data.get("email"),
            "name": user_data.get("name")
        }
    }

# Mock CRM endpoints
@app.get("/api/v1/crm/contacts")
async def get_contacts():
    return {
        "contacts": [],
        "total": 0
    }

# Catch-all for unimplemented endpoints
@app.api_route("/api/v1/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all(path: str):
    return {
        "message": f"Mock endpoint: /api/v1/{path}",
        "status": "not_implemented",
        "data": {}
    }

if __name__ == "__main__":
    print("🚀 Starting Mock Backend Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📋 API Documentation: http://localhost:8000/docs")
    print("🔧 This is a mock server for development purposes")
    print("💡 To stop the server, press Ctrl+C")
    
    uvicorn.run(
        "mock_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
