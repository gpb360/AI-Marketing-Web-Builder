"""
API router for version 1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, templates, workflows, crm

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(templates.router, prefix="/templates", tags=["Templates"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["Workflows"])
api_router.include_router(crm.router, prefix="/crm", tags=["CRM"])