"""
API router for version 1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, templates, workflows, crm, publishing, collaboration, template_optimization, migration

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(templates.router, prefix="/templates", tags=["Templates"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["Workflows"])
api_router.include_router(crm.router, prefix="/crm", tags=["CRM"])
api_router.include_router(publishing.router, prefix="/publishing", tags=["Site Publishing"])
api_router.include_router(collaboration.router, prefix="/collaboration", tags=["Real-time Collaboration"])
api_router.include_router(template_optimization.router, prefix="/optimization", tags=["Template Optimization"])
api_router.include_router(migration.router, prefix="/migration", tags=["Template Migration"])