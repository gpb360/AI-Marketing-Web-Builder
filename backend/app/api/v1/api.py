"""
API router for version 1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth, templates, workflows, crm, publishing, collaboration, 
    template_optimization, migration, workflow_debug, workflow_websocket,
    business_workflows, ab_testing, scenario_modeling, template_performance
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(templates.router, prefix="/templates", tags=["Templates"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["Workflows"])
api_router.include_router(workflow_debug.router, prefix="/workflows", tags=["Workflow Debugging"])
api_router.include_router(workflow_websocket.router, prefix="/ws", tags=["Workflow WebSocket"])
api_router.include_router(business_workflows.router, prefix="/business-workflows", tags=["Business Workflow Customization"])
api_router.include_router(crm.router, prefix="/crm", tags=["CRM"])
api_router.include_router(publishing.router, prefix="/publishing", tags=["Site Publishing"])
api_router.include_router(collaboration.router, prefix="/collaboration", tags=["Real-time Collaboration"])
api_router.include_router(template_optimization.router, prefix="/optimization", tags=["Template Optimization"])
api_router.include_router(migration.router, prefix="/migration", tags=["Template Migration"])
api_router.include_router(ab_testing.router, prefix="/ab-testing", tags=["A/B Testing Framework"])
api_router.include_router(scenario_modeling.router, prefix="/scenario-modeling", tags=["Scenario Modeling"])
api_router.include_router(template_performance.router, prefix="/template-performance", tags=["Template Performance Analytics"])