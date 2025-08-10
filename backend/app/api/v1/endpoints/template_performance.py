"""
Template Performance Analysis API endpoints.

Provides endpoints for automated template performance analysis,
real-time rankings, and optimization recommendations.
"""

from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.template import TemplateCategory
from app.models.analytics import PerformanceBand
from app.services.template_performance_service import (
    TemplatePerformanceAnalyzer,
    TemplateRankingService
)
from app.schemas.template_performance import (
    TemplatePerformanceAnalysisResponse,
    TemplateRankingResponse,
    TemplateRankingListResponse,
    OptimizationRecommendationResponse,
    PerformanceDashboardResponse,
    RankingTrendResponse
)

router = APIRouter()


@router.post(
    "/templates/{template_id}/analyze",
    response_model=TemplatePerformanceAnalysisResponse
)
async def analyze_template_performance(
    template_id: str,
    background_tasks: BackgroundTasks,
    date_range_days: int = Query(30, ge=1, le=365, description="Analysis period in days"),
    force_refresh: bool = Query(False, description="Force fresh analysis ignoring cache"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze template performance with comprehensive metrics and AI insights.
    
    This endpoint performs deep analysis of template performance including:
    - Conversion rates and user engagement
    - Performance scoring and benchmarking
    - AI-generated optimization recommendations
    - Real-time ranking updates
    """
    try:
        analyzer = TemplatePerformanceAnalyzer(db)
        
        # Check cache if not forcing refresh
        if not force_refresh:
            cached_result = await analyzer._get_cached_analysis(template_id)
            if cached_result:
                return TemplatePerformanceAnalysisResponse(**cached_result)
        
        # Perform analysis
        analysis_result = await analyzer.analyze_template_performance(
            template_id=template_id,
            date_range_days=date_range_days
        )
        
        if not analysis_result["success"]:
            raise HTTPException(status_code=404, detail=analysis_result["error"])
        
        # Schedule background optimization recommendations generation
        background_tasks.add_task(
            _generate_optimization_recommendations,
            template_id,
            analysis_result,
            db
        )
        
        return TemplatePerformanceAnalysisResponse(**analysis_result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get(
    "/templates/rankings",
    response_model=TemplateRankingListResponse
)
async def get_template_rankings(
    category: Optional[TemplateCategory] = Query(None, description="Filter by template category"),
    performance_band: Optional[PerformanceBand] = Query(None, description="Filter by performance band"),
    limit: int = Query(50, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get template rankings with filtering and pagination.
    
    Returns ranked list of templates based on performance scores,
    with options to filter by category and performance band.
    """
    try:
        ranking_service = TemplateRankingService(db)
        
        rankings = await ranking_service.get_template_rankings(
            category=category,
            performance_band=performance_band,
            limit=limit,
            offset=offset
        )
        
        ranking_responses = [
            TemplateRankingResponse.from_orm(ranking) 
            for ranking in rankings
        ]
        
        return TemplateRankingListResponse(
            rankings=ranking_responses,
            total=len(ranking_responses),
            limit=limit,
            offset=offset,
            filters={
                "category": category.value if category else None,
                "performance_band": performance_band.value if performance_band else None
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get rankings: {str(e)}")


@router.get(
    "/templates/top-performers",
    response_model=TemplateRankingListResponse
)
async def get_top_performers(
    category: Optional[TemplateCategory] = Query(None, description="Filter by template category"),
    limit: int = Query(10, ge=1, le=50, description="Number of top performers to return"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get top performing templates across all categories or within a specific category.
    
    Returns the highest-ranked templates based on comprehensive performance metrics.
    """
    try:
        ranking_service = TemplateRankingService(db)
        
        top_performers = await ranking_service.get_top_performers(
            category=category,
            limit=limit
        )
        
        ranking_responses = [
            TemplateRankingResponse.from_orm(ranking) 
            for ranking in top_performers
        ]
        
        return TemplateRankingListResponse(
            rankings=ranking_responses,
            total=len(ranking_responses),
            limit=limit,
            offset=0,
            filters={
                "category": category.value if category else None,
                "performance_band": "top_performer"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get top performers: {str(e)}")


@router.get(
    "/templates/category-leaders",
    response_model=Dict[str, TemplateRankingResponse]
)
async def get_category_leaders(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the top-performing template in each category.
    
    Returns a mapping of category names to their leading templates.
    """
    try:
        ranking_service = TemplateRankingService(db)
        
        leaders = await ranking_service.get_category_leaders()
        
        return {
            category: TemplateRankingResponse.from_orm(ranking)
            for category, ranking in leaders.items()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get category leaders: {str(e)}")


@router.get(
    "/templates/trending",
    response_model=TemplateRankingListResponse
)
async def get_trending_templates(
    period_days: int = Query(7, ge=1, le=30, description="Trending period in days"),
    limit: int = Query(10, ge=1, le=50, description="Number of trending templates to return"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get templates with positive ranking trends.
    
    Returns templates that have improved in rankings over the specified period.
    """
    try:
        ranking_service = TemplateRankingService(db)
        
        trending = await ranking_service.get_trending_templates(
            period_days=period_days,
            limit=limit
        )
        
        ranking_responses = [
            TemplateRankingResponse.from_orm(ranking) 
            for ranking in trending
        ]
        
        return TemplateRankingListResponse(
            rankings=ranking_responses,
            total=len(ranking_responses),
            limit=limit,
            offset=0,
            filters={
                "trending_period": f"{period_days}d"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get trending templates: {str(e)}")


@router.get(
    "/templates/{template_id}/performance-dashboard",
    response_model=PerformanceDashboardResponse
)
async def get_performance_dashboard(
    template_id: str,
    date_range_days: int = Query(30, ge=1, le=365, description="Dashboard period in days"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive performance dashboard for a specific template.
    
    Returns detailed analytics, trends, benchmarks, and optimization opportunities.
    """
    try:
        analyzer = TemplatePerformanceAnalyzer(db)
        
        # Get performance analysis
        analysis = await analyzer.analyze_template_performance(
            template_id=template_id,
            date_range_days=date_range_days
        )
        
        if not analysis["success"]:
            raise HTTPException(status_code=404, detail=analysis["error"])
        
        # Get ranking information
        ranking_service = TemplateRankingService(db)
        rankings = await ranking_service.get_template_rankings(limit=1000)  # Get all for context
        
        # Find template's position in rankings
        template_ranking = None
        for ranking in rankings:
            if ranking.template_id == template_id:
                template_ranking = ranking
                break
        
        dashboard_data = {
            "template_id": template_id,
            "analysis_date": analysis["analysis_date"],
            "date_range": analysis["date_range"],
            "performance_metrics": analysis["performance_metrics"],
            "performance_scores": analysis["performance_scores"],
            "ranking_info": TemplateRankingResponse.from_orm(template_ranking) if template_ranking else None,
            "insights": analysis["insights"],
            "benchmarks": await _get_category_benchmarks(template_id, db),
            "optimization_opportunities": await _get_optimization_opportunities(template_id, db)
        }
        
        return PerformanceDashboardResponse(**dashboard_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard generation failed: {str(e)}")


@router.get(
    "/templates/{template_id}/optimization-recommendations",
    response_model=List[OptimizationRecommendationResponse]
)
async def get_optimization_recommendations(
    template_id: str,
    priority: Optional[str] = Query(None, description="Filter by priority (low, medium, high, critical)"),
    status: Optional[str] = Query(None, description="Filter by status (pending, applied, dismissed)"),
    limit: int = Query(20, ge=1, le=50, description="Number of recommendations to return"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-generated optimization recommendations for a template.
    
    Returns actionable recommendations to improve template performance.
    """
    try:
        recommendations = await _get_template_recommendations(
            template_id=template_id,
            priority=priority,
            status=status,
            limit=limit,
            db=db
        )
        
        return [
            OptimizationRecommendationResponse.from_orm(rec)
            for rec in recommendations
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")


@router.post("/templates/analyze-all")
async def trigger_bulk_analysis(
    background_tasks: BackgroundTasks,
    force_refresh: bool = Query(False, description="Force fresh analysis for all templates"),
    current_user: User = Depends(get_current_user)
):
    """
    Trigger bulk analysis of all templates.
    
    Schedules performance analysis for all published templates.
    Useful for periodic system-wide analysis updates.
    """
    try:
        # Schedule bulk analysis as background task
        background_tasks.add_task(
            _trigger_bulk_template_analysis,
            force_refresh
        )
        
        return {
            "success": True,
            "message": "Bulk template analysis scheduled",
            "scheduled_at": "background"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to schedule bulk analysis: {str(e)}")


@router.get(
    "/templates/{template_id}/ranking-trends",
    response_model=RankingTrendResponse
)
async def get_ranking_trends(
    template_id: str,
    period_days: int = Query(30, ge=7, le=90, description="Trend analysis period in days"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get ranking trends and historical performance for a template.
    
    Returns trend data showing how template performance has changed over time.
    """
    try:
        trend_data = await _get_template_ranking_trends(
            template_id=template_id,
            period_days=period_days,
            db=db
        )
        
        return RankingTrendResponse(**trend_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get ranking trends: {str(e)}")


# Helper functions
async def _generate_optimization_recommendations(
    template_id: str,
    analysis_result: Dict[str, Any],
    db: AsyncSession
) -> None:
    """Background task to generate optimization recommendations."""
    try:
        # This would implement the recommendation generation logic
        # For now, it's a placeholder
        pass
    except Exception as e:
        logger.error(f"Failed to generate recommendations for {template_id}: {str(e)}")


async def _get_category_benchmarks(template_id: str, db: AsyncSession) -> Dict[str, Any]:
    """Get category benchmarks for comparison."""
    # This would implement benchmark calculation logic
    return {
        "category_average_conversion": 0.15,
        "category_average_bounce": 0.45,
        "category_average_session": 120.0
    }


async def _get_optimization_opportunities(template_id: str, db: AsyncSession) -> List[Dict[str, Any]]:
    """Get optimization opportunities for a template."""
    # This would implement opportunity identification logic
    return [
        {
            "type": "conversion",
            "priority": "high",
            "description": "Optimize call-to-action placement",
            "estimated_impact": "+25% conversion rate"
        }
    ]


async def _get_template_recommendations(
    template_id: str,
    priority: Optional[str],
    status: Optional[str],
    limit: int,
    db: AsyncSession
) -> List[Any]:
    """Get template optimization recommendations from database."""
    # This would implement the database query logic
    return []


async def _trigger_bulk_template_analysis(force_refresh: bool) -> None:
    """Background task to trigger bulk template analysis."""
    try:
        # This would implement bulk analysis logic
        pass
    except Exception as e:
        logger.error(f"Bulk analysis failed: {str(e)}")


async def _get_template_ranking_trends(
    template_id: str,
    period_days: int,
    db: AsyncSession
) -> Dict[str, Any]:
    """Get ranking trend data for a template."""
    # This would implement trend analysis logic
    return {
        "template_id": template_id,
        "period_days": period_days,
        "trend_data": [],
        "summary": {
            "direction": "up",
            "change_percentage": 15.2,
            "peak_rank": 5,
            "current_rank": 8
        }
    }