"""
Template management endpoints.
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_active_user, require_admin
from app.models.user import User
from app.models.template import TemplateCategory, TemplateStatus
from app.schemas.template import (
    Template, TemplateCreate, TemplateUpdate, TemplateList,
    TemplateComponent, TemplateComponentCreate, TemplateComponentUpdate
)
from app.services.template_service import TemplateService, TemplateComponentService

router = APIRouter()


@router.get("/", response_model=TemplateList)
async def get_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[TemplateCategory] = None,
    featured: Optional[bool] = None,
    premium: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get templates with filtering and pagination."""
    template_service = TemplateService(db)
    
    # Handle different filtering scenarios
    if search:
        templates = await template_service.search_templates(search, category, skip, limit)
    elif featured:
        templates = await template_service.get_featured(limit)
    elif premium:
        templates = await template_service.get_premium(skip, limit)
    elif category:
        templates = await template_service.get_by_category(category, skip, limit)
    else:
        filters = {"status": TemplateStatus.PUBLISHED}
        templates = await template_service.get_multi(skip, limit, filters)
    
    # Get total count for pagination
    filters = {"status": TemplateStatus.PUBLISHED}
    if category:
        filters["category"] = category
    
    total = await template_service.count(filters)
    
    return {
        "templates": templates,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/popular", response_model=List[Template])
async def get_popular_templates(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get most popular templates."""
    template_service = TemplateService(db)
    return await template_service.get_popular_templates(limit)


@router.get("/{template_id}", response_model=Template)
async def get_template(
    template_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get template by ID."""
    template_service = TemplateService(db)
    template = await template_service.get_by_id(template_id)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Increment usage count when template is viewed
    await template_service.increment_usage(template_id)
    
    return template


@router.post("/", response_model=Template, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_in: TemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Create a new template (admin only)."""
    template_service = TemplateService(db)
    return await template_service.create(template_in)


@router.put("/{template_id}", response_model=Template)
async def update_template(
    template_id: int,
    template_in: TemplateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Update template (admin only)."""
    template_service = TemplateService(db)
    template = await template_service.update(template_id, template_in)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    return template


@router.post("/{template_id}/publish", response_model=Template)
async def publish_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Publish a template (admin only)."""
    template_service = TemplateService(db)
    template = await template_service.publish_template(template_id)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    return template


@router.post("/{template_id}/archive", response_model=Template)
async def archive_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Archive a template (admin only)."""
    template_service = TemplateService(db)
    template = await template_service.archive_template(template_id)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    return template


@router.delete("/{template_id}")
async def delete_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Delete template (admin only)."""
    template_service = TemplateService(db)
    success = await template_service.delete(template_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    return {"message": "Template deleted successfully"}


# Template Components endpoints
@router.get("/components/", response_model=List[TemplateComponent])
async def get_template_components(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    component_type: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get template components with filtering."""
    component_service = TemplateComponentService(db)
    
    if search:
        return await component_service.search_components(search, skip, limit)
    elif component_type:
        return await component_service.get_by_type(component_type, skip, limit)
    elif category:
        return await component_service.get_by_category(category, skip, limit)
    else:
        return await component_service.get_multi(skip, limit)


@router.get("/components/popular", response_model=List[TemplateComponent])
async def get_popular_components(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get most popular template components."""
    component_service = TemplateComponentService(db)
    return await component_service.get_popular_components(limit)


@router.get("/components/{component_id}", response_model=TemplateComponent)
async def get_template_component(
    component_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get template component by ID."""
    component_service = TemplateComponentService(db)
    component = await component_service.get_by_id(component_id)
    
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template component not found"
        )
    
    # Increment usage count
    await component_service.increment_usage(component_id)
    
    return component


@router.post("/components/", response_model=TemplateComponent, status_code=status.HTTP_201_CREATED)
async def create_template_component(
    component_in: TemplateComponentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Create a new template component (admin only)."""
    component_service = TemplateComponentService(db)
    return await component_service.create(component_in)


@router.put("/components/{component_id}", response_model=TemplateComponent)
async def update_template_component(
    component_id: int,
    component_in: TemplateComponentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Update template component (admin only)."""
    component_service = TemplateComponentService(db)
    component = await component_service.update(component_id, component_in)
    
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template component not found"
        )
    
    return component


@router.delete("/components/{component_id}")
async def delete_template_component(
    component_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Delete template component (admin only)."""
    component_service = TemplateComponentService(db)
    success = await component_service.delete(component_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template component not found"
        )
    
    return {"message": "Template component deleted successfully"}