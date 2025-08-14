"""
API router for version 1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, templates, workflows, crm, publishing, collaboration, template_optimization, migration, workflow_debug, workflow_websocket, analytics, predictions, sla_optimization, sla_remediation, ai_features, business_context

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(templates.router, prefix="/templates", tags=["Templates"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["Workflows"])
api_router.include_router(workflow_debug.router, prefix="/workflows", tags=["Workflow Debugging"])
api_router.include_router(workflow_websocket.router, prefix="/ws", tags=["Workflow WebSocket"])
api_router.include_router(crm.router, prefix="/crm", tags=["CRM"])
api_router.include_router(publishing.router, prefix="/publishing", tags=["Site Publishing"])
api_router.include_router(collaboration.router, prefix="/collaboration", tags=["Real-time Collaboration"])
api_router.include_router(template_optimization.router, prefix="/optimization", tags=["Template Optimization"])
api_router.include_router(migration.router, prefix="/migration", tags=["Template Migration"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Performance Analytics"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["SLA Predictions"])
api_router.include_router(sla_optimization.router, prefix="/sla-optimization", tags=["SLA Threshold Optimization"])
api_router.include_router(sla_remediation.router, tags=["SLA Remediation"])
api_router.include_router(ai_features.router, prefix="/ai", tags=["Epic 4: AI Features"])
api_router.include_router(business_context.router, prefix="/business-context", tags=["Epic 1: Business Context"])