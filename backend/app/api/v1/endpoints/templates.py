"""
Template management endpoints.
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_active_user, require_admin
from app.models.user import User
from app.models.template import TemplateCategory, TemplateStatus
from app.schemas.template import (
    Template, TemplateCreate, TemplateUpdate, TemplateList,
    TemplateComponent, TemplateComponentCreate, TemplateComponentUpdate
)
from app.schemas.ai_template import (
    AITemplateGenerateRequest,
    AITemplateGenerateResponse,
    AITemplateOptimizeRequest,
    AITemplateOptimizeResponse,
    AITemplateVariantsRequest,
    AITemplateVariantsResponse,
    AITemplatePersonalizeRequest,
    AITemplatePersonalizeResponse,
    AITemplateAnalysisRequest,
    AITemplateAnalysisResponse
)
from app.services.template_service import TemplateService, TemplateComponentService
from app.services.ai_template_service import AITemplateService

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


# AI-Powered Template Generation Endpoints
@router.post("/ai/generate", response_model=AITemplateGenerateResponse)
async def ai_generate_template(
    request: AITemplateGenerateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Generate a new template using AI based on natural language description."""
    import time
    start_time = time.time()
    
    try:
        ai_service = AITemplateService(db)
        
        # Build style preferences from request
        style_preferences = {
            **request.style_preferences,
            "target_audience": request.target_audience,
            "industry": request.industry,
            "brand_colors": request.brand_colors,
            "brand_fonts": request.brand_fonts
        }
        
        # Generate template
        result = await ai_service.generate_template_from_description(
            description=request.description,
            category=request.category,
            user_id=current_user.id,
            style_preferences=style_preferences
        )
        
        generation_time = time.time() - start_time
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Template generation failed")
            )
        
        return AITemplateGenerateResponse(
            success=True,
            template=result.get("template"),
            components_count=result.get("components_count", 0),
            generation_time=generation_time,
            optimization_queued=result.get("optimization_queued", False),
            error=None
        )
        
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error generating AI template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Template generation failed: {str(e)}"
        )


@router.post("/ai/optimize", response_model=AITemplateOptimizeResponse)
async def ai_optimize_template(
    request: AITemplateOptimizeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Optimize existing template for better conversion rates using AI."""
    try:
        ai_service = AITemplateService(db)
        
        # Verify template exists and user has access
        template_service = TemplateService(db)
        template = await template_service.get_by_id(request.template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Optimize template
        result = await ai_service.optimize_template_for_conversion(
            template_id=request.template_id,
            target_metrics=request.target_metrics
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Template optimization failed")
            )
        
        return AITemplateOptimizeResponse(
            success=True,
            template_id=request.template_id,
            suggestions=result.get("suggestions", []),
            a_b_test_variants=result.get("a_b_test_variants", []),
            performance_predictions=result.get("performance_predictions", {}),
            priority_changes=result.get("priority_changes", []),
            error=None
        )
        
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error optimizing AI template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Template optimization failed: {str(e)}"
        )


@router.post("/ai/variants", response_model=AITemplateVariantsResponse)
async def ai_generate_variants(
    request: AITemplateVariantsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Generate multiple template variants for A/B testing using AI."""
    import time
    start_time = time.time()
    
    try:
        ai_service = AITemplateService(db)
        
        # Verify template exists and user has access
        template_service = TemplateService(db)
        template = await template_service.get_by_id(request.base_template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Base template not found"
            )
        
        # Generate variants
        variants = await ai_service.generate_template_variants(
            base_template_id=request.base_template_id,
            variant_count=request.variant_count,
            variation_type=request.variation_type
        )
        
        generation_time = time.time() - start_time
        
        return AITemplateVariantsResponse(
            success=True,
            base_template_id=request.base_template_id,
            variants=[{"id": v.id, "name": v.name, "description": v.description} for v in variants],
            variant_count=len(variants),
            generation_time=generation_time,
            error=None
        )
        
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error generating AI variants: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Variant generation failed: {str(e)}"
        )


@router.post("/ai/personalize", response_model=AITemplatePersonalizeResponse)
async def ai_personalize_template(
    request: AITemplatePersonalizeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Personalize template based on user data and brand preferences using AI."""
    try:
        ai_service = AITemplateService(db)
        
        # Verify template exists and user has access
        template_service = TemplateService(db)
        template = await template_service.get_by_id(request.template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Personalize template
        result = await ai_service.personalize_template(
            template_id=request.template_id,
            user_data=request.user_data,
            industry=request.industry,
            brand_preferences=request.brand_preferences
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Template personalization failed")
            )
        
        return AITemplatePersonalizeResponse(
            success=True,
            personalized_template=result.get("personalized_template"),
            style_adjustments=result.get("style_adjustments", {}),
            content_recommendations=result.get("content_recommendations", []),
            seo_optimizations=result.get("seo_optimizations", {}),
            personalization_score=result.get("personalization_score", 0.0),
            error=None
        )
        
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error personalizing AI template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Template personalization failed: {str(e)}"
        )


@router.post("/ai/analyze", response_model=AITemplateAnalysisResponse)
async def ai_analyze_template(
    request: AITemplateAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Analyze template using AI for various metrics."""
    try:
        from app.services.ai_service import AIService
        
        # Verify template exists and user has access
        template_service = TemplateService(db)
        template = await template_service.get_by_id(request.template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Prepare template data for analysis
        template_data = {
            "name": template.name,
            "description": template.description,
            "category": template.category,
            "components": template.components,
            "styles": template.styles,
            "config": template.config
        }
        
        # Perform analysis based on type
        ai_service = AIService()
        
        if request.analysis_type == "seo":
            analysis_prompt = f"""
            Analyze this website template for SEO optimization:
            
            Template: {template_data['name']}
            Description: {template_data['description']}
            Components: {len(template_data['components'])} elements
            
            Provide JSON response with:
            - score: SEO score (0-100)
            - findings: list of SEO issues and strengths
            - recommendations: specific SEO improvements
            - priority_level: overall priority (high/medium/low)
            """
            
            result = await ai_service.generate_json_response(analysis_prompt)
            
        elif request.analysis_type == "conversion":
            analysis_prompt = f"""
            Analyze this website template for conversion rate optimization:
            
            Template: {template_data['name']}
            Category: {template_data['category']}
            Components: {len(template_data['components'])} elements
            
            Provide JSON response with:
            - score: conversion potential score (0-100)
            - findings: conversion strengths and weaknesses
            - recommendations: CRO improvements
            - priority_level: overall priority (high/medium/low)
            """
            
            result = await ai_service.generate_json_response(analysis_prompt)
            
        elif request.analysis_type == "accessibility":
            analysis_prompt = f"""
            Analyze this website template for accessibility compliance:
            
            Template: {template_data['name']}
            Components: {len(template_data['components'])} elements
            
            Provide JSON response with:
            - score: accessibility score (0-100)
            - findings: accessibility issues and strengths
            - recommendations: accessibility improvements
            - priority_level: overall priority (high/medium/low)
            """
            
            result = await ai_service.generate_json_response(analysis_prompt)
            
        else:
            analysis_prompt = f"""
            Analyze this website template for overall performance:
            
            Template: {template_data['name']}
            Description: {template_data['description']}
            Category: {template_data['category']}
            
            Provide JSON response with:
            - score: overall performance score (0-100)
            - findings: key performance insights
            - recommendations: improvement suggestions
            - priority_level: overall priority (high/medium/low)
            """
            
            result = await ai_service.generate_json_response(analysis_prompt)
        
        return AITemplateAnalysisResponse(
            success=True,
            template_id=request.template_id,
            analysis_type=request.analysis_type,
            score=result.get("score", 0.0),
            findings=result.get("findings", []),
            recommendations=result.get("recommendations", []),
            priority_level=result.get("priority_level", "medium"),
            error=None
        )
        
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error analyzing template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Template analysis failed: {str(e)}"
        )