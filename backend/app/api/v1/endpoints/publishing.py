"""API endpoints for site publishing and deployment."""

from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_async_session
from ..services.publishing_service import PublishingService
from ..services.domain_manager import DomainManager
from ..services.tasks import (
    publish_site_task, 
    verify_domain_task, 
    check_ssl_status_task,
    optimize_site_performance,
    generate_analytics_report
)

router = APIRouter(prefix="/api/v1", tags=["publishing"])

# Pydantic models for request/response
class PublishSiteRequest(BaseModel):
    """Request model for publishing a site."""
    custom_domain: Optional[str] = Field(None, description="Custom domain to use")
    seo_settings: Optional[Dict[str, Any]] = Field(default_factory=dict, description="SEO configuration")
    performance_optimization: bool = Field(True, description="Enable performance optimization")
    
class PublishSiteResponse(BaseModel):
    """Response model for site publishing."""
    success: bool
    task_id: Optional[str] = None
    published_site_id: Optional[str] = None
    preview_url: Optional[str] = None
    status: str
    message: str
    
class DomainVerificationRequest(BaseModel):
    """Request model for domain verification."""
    domain: str = Field(..., description="Domain to verify")
    
class DomainSetupResponse(BaseModel):
    """Response model for domain setup."""
    success: bool
    status: str
    verification_token: Optional[str] = None
    dns_instructions: Optional[Dict[str, Any]] = None
    message: str

class PublishingStatusResponse(BaseModel):
    """Response model for publishing status."""
    success: bool
    status: str
    site_status: str
    published_site: Optional[Dict[str, Any]] = None
    ssl_status_info: Optional[Dict[str, Any]] = None
    
class DeploymentHistoryResponse(BaseModel):
    """Response model for deployment history."""
    success: bool
    deployments: List[Dict[str, Any]]
    total_deployments: int


@router.post("/sites/{site_id}/publish", response_model=PublishSiteResponse)
async def publish_site(
    site_id: str,
    request: PublishSiteRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Publish a site with complete deployment pipeline.
    
    This endpoint triggers a background task that:
    1. Generates static site from components
    2. Optimizes assets (CSS, JS, images)
    3. Uploads to CDN
    4. Sets up custom domain (if provided)
    5. Configures SSL certificate
    6. Validates deployment
    """
    try:
        # Validate site exists and user has access
        # TODO: Add proper authentication and authorization
        
        # Start background publishing task
        task = publish_site_task.delay(site_id, request.custom_domain)
        
        # Optionally trigger performance optimization
        if request.performance_optimization:
            background_tasks.add_task(
                lambda: optimize_site_performance.delay(site_id)
            )
        
        return PublishSiteResponse(
            success=True,
            task_id=task.id,
            status="started",
            message="Site publishing started. Check status using the task ID."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sites/{site_id}/publish/status", response_model=PublishingStatusResponse)
async def get_publishing_status(
    site_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    """Get current publishing status for a site."""
    try:
        publishing_service = PublishingService()
        result = await publishing_service.get_publishing_status(site_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return PublishingStatusResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tasks/{task_id}/status")
async def get_task_status(task_id: str):
    """Get status of a background task."""
    try:
        from ..services.tasks import celery_app
        
        task = celery_app.AsyncResult(task_id)
        
        response = {
            "task_id": task_id,
            "status": task.status,
            "result": task.result if task.ready() else None
        }
        
        if task.status == "PROGRESS":
            response["progress"] = task.info.get("progress", 0)
            response["current_status"] = task.info.get("status", "Processing...")
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sites/{site_id}/unpublish")
async def unpublish_site(
    site_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    """Unpublish a site and clean up resources."""
    try:
        publishing_service = PublishingService()
        result = await publishing_service.unpublish_site(site_id)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/domains/verify", response_model=DomainSetupResponse)
async def verify_domain(
    request: DomainVerificationRequest,
    site_id: str = Query(..., description="Site ID for domain verification")
):
    """Verify domain ownership and setup DNS."""
    try:
        # Start background domain verification task
        task = verify_domain_task.delay(request.domain, site_id)
        
        return DomainSetupResponse(
            success=True,
            status="verification_started",
            verification_token=f"aiwebbuilder-verify={site_id}",
            dns_instructions={
                "record_type": "TXT",
                "name": request.domain,
                "value": f"aiwebbuilder-verify={site_id}",
                "ttl": 300
            },
            message="Add the TXT record to your domain DNS and verification will complete automatically."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/domains/{domain}/setup")
async def setup_custom_domain(
    domain: str,
    site_id: str = Query(..., description="Site ID")
):
    """Setup custom domain configuration."""
    try:
        domain_manager = DomainManager()
        
        # Setup DNS records
        dns_result = await domain_manager.setup_dns_records(
            domain, f"{site_id}.aiwebbuilder.com"
        )
        
        # Request SSL certificate
        ssl_result = await domain_manager.request_ssl_certificate(domain)
        
        return {
            "success": True,
            "domain": domain,
            "dns_setup": dns_result,
            "ssl_setup": ssl_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sites/{site_id}/deployments", response_model=DeploymentHistoryResponse)
async def get_deployment_history(
    site_id: str,
    limit: int = Query(10, ge=1, le=100, description="Number of deployments to return"),
    session: AsyncSession = Depends(get_async_session)
):
    """Get deployment history for a site."""
    try:
        publishing_service = PublishingService()
        result = await publishing_service.get_deployment_history(site_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        # Limit results
        result["deployments"] = result["deployments"][:limit]
        
        return DeploymentHistoryResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sites/{site_id}/rollback")
async def rollback_deployment(
    site_id: str,
    target_version: str = Query(..., description="Version to rollback to"),
    session: AsyncSession = Depends(get_async_session)
):
    """Rollback site to a previous deployment version."""
    try:
        publishing_service = PublishingService()
        result = await publishing_service.rollback_deployment(site_id, target_version)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sites/{site_id}/ssl/status")
async def check_ssl_status(
    site_id: str,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_async_session)
):
    """Check SSL certificate status for a site."""
    try:
        # Get published site ID
        publishing_service = PublishingService()
        status_result = await publishing_service.get_publishing_status(site_id)
        
        if not status_result["success"] or status_result["status"] != "published":
            raise HTTPException(status_code=404, detail="Site not published")
        
        published_site_id = status_result["published_site"]["id"]
        
        # Start background SSL check task
        task = check_ssl_status_task.delay(published_site_id)
        
        return {
            "success": True,
            "task_id": task.id,
            "message": "SSL status check started"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sites/{site_id}/optimize")
async def optimize_site(
    site_id: str,
    background_tasks: BackgroundTasks
):
    """Trigger site performance optimization."""
    try:
        # Start background optimization task
        task = optimize_site_performance.delay(site_id)
        
        return {
            "success": True,
            "task_id": task.id,
            "message": "Site optimization started"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sites/{site_id}/analytics")
async def get_site_analytics(
    site_id: str,
    period: str = Query("30d", regex="^(7d|30d|90d)$", description="Analytics period"),
    background_tasks: BackgroundTasks
):
    """Get site analytics report."""
    try:
        # Start background analytics generation task
        task = generate_analytics_report.delay(site_id, period)
        
        return {
            "success": True,
            "task_id": task.id,
            "message": "Analytics report generation started"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sites/{site_id}/performance")
async def get_site_performance(
    site_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    """Get site performance metrics."""
    try:
        publishing_service = PublishingService()
        status_result = await publishing_service.get_publishing_status(site_id)
        
        if not status_result["success"] or status_result["status"] != "published":
            raise HTTPException(status_code=404, detail="Site not published")
        
        published_site = status_result["published_site"]
        domain = published_site["custom_domain"] or published_site["domain"]
        
        domain_manager = DomainManager()
        validation_result = await domain_manager.validate_domain_configuration(domain)
        
        return {
            "success": True,
            "site_id": site_id,
            "domain": domain,
            "performance_metrics": validation_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/publishing/stats")
async def get_publishing_stats(
    session: AsyncSession = Depends(get_async_session)
):
    """Get overall publishing statistics."""
    try:
        from ..models.sites import PublishedSite, DeploymentHistory, BuildStatus
        from sqlalchemy import select, func
        
        # Get publishing statistics
        total_sites = await session.scalar(
            select(func.count(PublishedSite.id))
        )
        
        successful_builds = await session.scalar(
            select(func.count(PublishedSite.id)).where(
                PublishedSite.build_status == BuildStatus.SUCCESS
            )
        )
        
        failed_builds = await session.scalar(
            select(func.count(PublishedSite.id)).where(
                PublishedSite.build_status == BuildStatus.FAILED
            )
        )
        
        total_deployments = await session.scalar(
            select(func.count(DeploymentHistory.id))
        )
        
        avg_build_time = await session.scalar(
            select(func.avg(DeploymentHistory.build_duration)).where(
                DeploymentHistory.build_status == BuildStatus.SUCCESS
            )
        )
        
        return {
            "success": True,
            "stats": {
                "total_published_sites": total_sites or 0,
                "successful_builds": successful_builds or 0,
                "failed_builds": failed_builds or 0,
                "success_rate": (successful_builds / max(total_sites, 1)) * 100 if total_sites else 0,
                "total_deployments": total_deployments or 0,
                "average_build_time": round(avg_build_time or 0, 2)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))