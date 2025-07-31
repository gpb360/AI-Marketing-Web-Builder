"""
Migration API Endpoints
Handles template migration from existing websites
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import asyncio
from pydantic import BaseModel, HttpUrl
import logging

from app.db.session import get_db
from app.services.migration import WebsiteScraper, MigrationAnalyzer, MigrationPipeline, ScrapingError
from app.core.security import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/migration", tags=["migration"])

# Pydantic models
class MigrationRequest(BaseModel):
    url: HttpUrl
    depth: int = 3
    include_assets: bool = True
    optimize_content: bool = True
    generate_redirects: bool = True

class MigrationStatus(BaseModel):
    id: str
    status: str
    progress: int
    total_pages: int
    processed_pages: int
    errors: List[str]
    warnings: List[str]
    estimated_time_remaining: str

class MigrationResult(BaseModel):
    id: str
    original_url: str
    scraped_data: Dict[str, Any]
    processed_data: Dict[str, Any]
    migration_plan: Dict[str, Any]
    recommendations: List[str]
    warnings: List[str]
    created_at: str

class MigrationProgress(BaseModel):
    migration_id: str
    current_phase: str
    phase_progress: int
    total_phases: int
    details: Dict[str, Any]

# In-memory storage for migration status (in production, use Redis)
migration_tasks = {}

@router.post("/start", response_model=MigrationStatus)
async def start_migration(
    request: MigrationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new website migration"""
    
    migration_id = f"migration_{current_user.id}_{int(asyncio.get_event_loop().time())}"
    
    # Initialize migration task
    migration_tasks[migration_id] = {
        "status": "starting",
        "progress": 0,
        "total_pages": 0,
        "processed_pages": 0,
        "errors": [],
        "warnings": [],
        "estimated_time_remaining": "Calculating...",
        "request": request.dict()
    }
    
    # Start background task
    background_tasks.add_task(
        process_migration,
        migration_id,
        str(request.url),
        request.depth,
        request.include_assets,
        request.optimize_content,
        request.generate_redirects
    )
    
    return MigrationStatus(
        id=migration_id,
        status="starting",
        progress=0,
        total_pages=0,
        processed_pages=0,
        errors=[],
        warnings=[],
        estimated_time_remaining="Calculating..."
    )

@router.get("/status/{migration_id}", response_model=MigrationStatus)
async def get_migration_status(
    migration_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get migration status"""
    
    if migration_id not in migration_tasks:
        raise HTTPException(status_code=404, detail="Migration not found")
    
    task = migration_tasks[migration_id]
    
    return MigrationStatus(
        id=migration_id,
        status=task["status"],
        progress=task["progress"],
        total_pages=task["total_pages"],
        processed_pages=task["processed_pages"],
        errors=task["errors"],
        warnings=task["warnings"],
        estimated_time_remaining=task["estimated_time_remaining"]
    )

@router.get("/result/{migration_id}", response_model=MigrationResult)
async def get_migration_result(
    migration_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get migration result"""
    
    if migration_id not in migration_tasks:
        raise HTTPException(status_code=404, detail="Migration not found")
    
    task = migration_tasks[migration_id]
    
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="Migration not completed")
    
    return MigrationResult(
        id=migration_id,
        original_url=task["request"]["url"],
        scraped_data=task.get("scraped_data", {}),
        processed_data=task.get("processed_data", {}),
        migration_plan=task.get("migration_plan", {}),
        recommendations=task.get("recommendations", []),
        warnings=task.get("warnings", []),
        created_at=task.get("created_at", "")
    )

@router.post("/analyze", response_model=Dict[str, Any])
async def analyze_website(
    request: MigrationRequest,
    current_user: User = Depends(get_current_user)
):
    """Analyze website for migration feasibility"""
    
    try:
        async with WebsiteScraper() as scraper:
            # Quick scrape (depth=1) for analysis
            scraped_data = await scraper.scrape_website(str(request.url), depth=1)
            
            # Analyze feasibility
            analyzer = MigrationAnalyzer()
            analysis = analyzer.analyze_migration_feasibility(scraped_data)
            
            # Generate preview report
            report = analyzer.generate_migration_report(scraped_data)
            
            return {
                "analysis": analysis,
                "report": report,
                "preview": {
                    "pages_found": len(scraped_data.get("pages", {})),
                    "assets_found": len(scraped_data.get("assets", {})),
                    "styles_found": len(scraped_data.get("styles", {})),
                    "scripts_found": len(scraped_data.get("scripts", {}))
                }
            }
            
    except ScrapingError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error analyzing website: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze website")

@router.get("/active", response_model=List[MigrationStatus])
async def get_active_migrations(
    current_user: User = Depends(get_current_user)
):
    """Get all active migrations for user"""
    
    active_migrations = []
    for migration_id, task in migration_tasks.items():
        if str(current_user.id) in migration_id and task["status"] in ["starting", "scraping", "processing", "optimizing"]:
            active_migrations.append(MigrationStatus(
                id=migration_id,
                status=task["status"],
                progress=task["progress"],
                total_pages=task["total_pages"],
                processed_pages=task["processed_pages"],
                errors=task["errors"],
                warnings=task["warnings"],
                estimated_time_remaining=task["estimated_time_remaining"]
            ))
    
    return active_migrations

@router.delete("/cancel/{migration_id}")
async def cancel_migration(
    migration_id: str,
    current_user: User = Depends(get_current_user)
):
    """Cancel active migration"""
    
    if migration_id not in migration_tasks:
        raise HTTPException(status_code=404, detail="Migration not found")
    
    task = migration_tasks[migration_id]
    if task["status"] in ["completed", "failed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Cannot cancel completed migration")
    
    task["status"] = "cancelled"
    task["progress"] = 0
    task["estimated_time_remaining"] = "Cancelled"
    
    return {"message": "Migration cancelled successfully"}

@router.get("/templates/{migration_id}")
async def get_migration_templates(
    migration_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get generated templates from migration"""
    
    if migration_id not in migration_tasks:
        raise HTTPException(status_code=404, detail="Migration not found")
    
    task = migration_tasks[migration_id]
    
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="Migration not completed")
    
    processed_data = task.get("processed_data", {})
    
    templates = []
    
    # Generate templates from processed pages
    for url, page_data in processed_data.get("processed_pages", {}).items():
        optimized = page_data.get("optimized", {})
        templates.append({
            "name": f"Migrated from {url}",
            "type": "migrated",
            "content": optimized.get("optimized_html", ""),
            "structure": optimized.get("structure", {}),
            "components": optimized.get("components", []),
            "metadata": optimized.get("metadata", {}),
            "priority": page_data.get("migration_priority", "medium")
        })
    
    return {
        "templates": templates,
        "theme_data": processed_data.get("processed_styles", {}),
        "migration_id": migration_id
    }

# Background task for processing migration
async def process_migration(
    migration_id: str,
    url: str,
    depth: int,
    include_assets: bool,
    optimize_content: bool,
    generate_redirects: bool
):
    """Process website migration in background"""
    
    try:
        task = migration_tasks[migration_id]
        task["status"] = "scraping"
        task["progress"] = 10
        
        # Step 1: Scrape website
        async with WebsiteScraper() as scraper:
            scraped_data = await scraper.scrape_website(url, depth)
            task["scraped_data"] = scraped_data
            task["total_pages"] = len(scraped_data.get("pages", {}))
            task["progress"] = 40
        
        task["status"] = "processing"
        
        # Step 2: Process content
        if optimize_content:
            pipeline = MigrationPipeline()
            processed_data = await pipeline.process_website(scraped_data)
            task["processed_data"] = processed_data
            task["migration_plan"] = processed_data.get("migration_plan", {})
            task["recommendations"] = processed_data.get("recommendations", [])
            task["warnings"] = processed_data.get("warnings", [])
        
        task["status"] = "optimizing"
        task["progress"] = 80
        
        # Step 3: Generate redirects if requested
        if generate_redirects:
            redirects = await _generate_redirects(scraped_data)
            task["redirects"] = redirects
        
        task["status"] = "completed"
        task["progress"] = 100
        task["estimated_time_remaining"] = "Completed"
        task["created_at"] = migration_tasks[migration_id].get("created_at", "")
        
        logger.info(f"Migration {migration_id} completed successfully")
        
    except ScrapingError as e:
        task["status"] = "failed"
        task["errors"].append(str(e))
        task["estimated_time_remaining"] = "Failed"
        logger.error(f"Migration {migration_id} failed: {e}")
        
    except Exception as e:
        task["status"] = "failed"
        task["errors"].append(str(e))
        task["estimated_time_remaining"] = "Failed"
        logger.error(f"Migration {migration_id} failed with unexpected error: {e}")

async def _generate_redirects(scraped_data: Dict[str, Any]) -> List[Dict[str, str]]:
    """Generate redirect mapping"""
    
    redirects = []
    base_url = scraped_data.get("base_url", "")
    
    for url in scraped_data.get("pages", {}):
        # Create simple redirect mapping
        if url.startswith(base_url):
            path = url[len(base_url):]
            if path:
                redirects.append({
                    "from": path,
                    "to": path,  # In real implementation, map to new URL structure
                    "type": "permanent"
                })
    
    return redirects