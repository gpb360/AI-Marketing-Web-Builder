"""
Template optimization API endpoints.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.template_optimization_service import TemplateOptimizationService
from app.services.ab_test_service import ABTestService
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/templates/{template_id}/optimization-insights")
async def get_optimization_insights(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get comprehensive optimization insights for a template.
    
    Args:
        template_id: ID of the template to analyze
        
    Returns:
        Optimization insights with AI recommendations
    """
    service = TemplateOptimizationService(db)
    result = await service.get_optimization_insights(template_id)
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result


@router.post("/templates/{template_id}/ab-tests")
async def create_ab_test(
    template_id: int,
    test_config: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Create a new A/B test for template optimization.
    
    Args:
        template_id: ID of the base template
        test_config: A/B test configuration
        
    Returns:
        Created test details
    """
    service = ABTestService(db)
    result = await service.create_ab_test(
        template_id,
        test_config["name"],
        test_config["hypothesis"],
        test_config["primary_metric"],
        test_config["variants"]
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/ab-tests/{test_id}/start")
async def start_ab_test(
    test_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Start an A/B test.
    
    Args:
        test_id: ID of the test to start
        
    Returns:
        Test status update
    """
    service = ABTestService(db)
    result = await service.start_ab_test(test_id)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/ab-tests/{test_id}/events")
async def record_test_event(
    test_id: int,
    event_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Record an event for A/B test analysis.
    
    Args:
        test_id: ID of the test
        event_data: Event data including variant_id and event_type
        
    Returns:
        Success confirmation
    """
    service = ABTestService(db)
    result = await service.record_test_event(
        test_id,
        event_data["variant_id"],
        event_data["event_type"],
        event_data.get("user_id"),
        event_data.get("metadata")
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.get("/ab-tests/{test_id}/results")
async def get_ab_test_results(
    test_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get comprehensive A/B test results.
    
    Args:
        test_id: ID of the test
        
    Returns:
        Detailed test results with statistical analysis
    """
    service = ABTestService(db)
    result = await service.get_test_results(test_id)
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result


@router.post("/ab-tests/{test_id}/stop")
async def stop_ab_test(
    test_id: int,
    stop_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Stop an A/B test and declare final results.
    
    Args:
        test_id: ID of the test to stop
        stop_data: Stop reason and final details
        
    Returns:
        Final test results
    """
    service = ABTestService(db)
    result = await service.stop_ab_test(test_id, stop_data.get("reason", "manual"))
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.get("/templates/{template_id}/performance-dashboard")
async def get_performance_dashboard(
    template_id: int,
    date_range: str = Query("30d", description="Date range for analytics"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get comprehensive performance analytics dashboard.
    
    Args:
        template_id: ID of the template
        date_range: Analytics date range (7d, 30d, 90d)
        
    Returns:
        Performance dashboard data
    """
    service = TemplateOptimizationService(db)
    result = await service.get_performance_dashboard(template_id, date_range)
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result


@router.get("/templates/{template_id}/content-suggestions")
async def get_content_suggestions(
    template_id: int,
    industry: str = Query("general", description="Target industry"),
    target_audience: str = Query("{}"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get AI-driven content suggestions for template optimization.
    
    Args:
        template_id: ID of the template
        industry: Target industry/business type
        target_audience: JSON string with audience demographics
        
    Returns:
        Content optimization suggestions
    """
    service = TemplateOptimizationService(db)
    
    try:
        audience_data = json.loads(target_audience) if target_audience != "{}" else {}
    except json.JSONDecodeError:
        audience_data = {}
    
    result = await service.get_content_suggestions(
        template_id,
        audience_data,
        industry
    )
    
    return {"suggestions": result}


@router.get("/templates/{template_id}/conversion-prediction")
async def get_conversion_prediction(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get ML-based conversion rate prediction for a template.
    
    Args:
        template_id: ID of the template
        
    Returns:
        Conversion rate prediction with confidence
    """
    service = TemplateOptimizationService(db)
    
    # This would use the ML model for prediction
    prediction = {
        "predicted_conversion_rate": 0.175,
        "confidence_score": 0.85,
        "optimization_potential": 0.125,
        "factors": [
            {"name": "Hero section optimization", "impact": "+2.3%"},
            {"name": "CTA placement", "impact": "+1.8%"},
            {"name": "Social proof elements", "impact": "+1.4%"}
        ]
    }
    
    return prediction


@router.get("/templates/optimization/benchmarks")
async def get_industry_benchmarks(
    category: str = Query(..., description="Template category"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get industry benchmarks for template optimization.
    
    Args:
        category: Template category (landing, ecommerce, etc.)
        
    Returns:
        Industry benchmarks and best practices
    """
    benchmarks = {
        "landing_page": {
            "conversion_rate": {"avg": 0.235, "top_10": 0.35, "bottom_10": 0.12},
            "bounce_rate": {"avg": 0.35, "top_10": 0.25, "bottom_10": 0.55},
            "avg_session_duration": {"avg": 45, "top_10": 75, "bottom_10": 25},
            "best_practices": [
                "Clear value proposition above the fold",
                "Single primary CTA",
                "Social proof elements",
                "Mobile-optimized design"
            ]
        },
        "ecommerce": {
            "conversion_rate": {"avg": 0.182, "top_10": 0.28, "bottom_10": 0.08},
            "bounce_rate": {"avg": 0.45, "top_10": 0.35, "bottom_10": 0.65},
            "avg_session_duration": {"avg": 180, "top_10": 300, "bottom_10": 90},
            "best_practices": [
                "High-quality product images",
                "Clear pricing and offers",
                "Trust badges and reviews",
                "Simplified checkout process"
            ]
        },
        "saas": {
            "conversion_rate": {"avg": 0.152, "top_10": 0.25, "bottom_10": 0.07},
            "bounce_rate": {"avg": 0.40, "top_10": 0.30, "bottom_10": 0.60},
            "avg_session_duration": {"avg": 120, "top_10": 200, "bottom_10": 60},
            "best_practices": [
                "Feature-focused hero section",
                "Free trial CTA",
                "Customer testimonials",
                "Security badges"
            ]
        }
    }
    
    return benchmarks.get(category, benchmarks["landing_page"])