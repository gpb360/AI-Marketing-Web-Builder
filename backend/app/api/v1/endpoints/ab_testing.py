"""
API endpoints for A/B testing framework and recommendation optimization.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models.ab_test import ABTest, ABTestVariant, ABTestStatus, ABTestType
from app.models.analytics import EventType
from app.services.ab_testing_framework import ABTestingFramework, StatisticalAnalyzer
from app.services.recommendation_optimizer import RecommendationOptimizer
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()


# Pydantic models for request/response
class CreateABTestRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    test_type: ABTestType
    template_variants: Optional[List[int]] = None
    algorithm_variants: Optional[List[Dict[str, Any]]] = None
    test_config: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Template Recommendation Test",
                "description": "Testing different landing page templates for conversion optimization",
                "test_type": "template_recommendation",
                "template_variants": [1, 2, 3],
                "test_config": {
                    "baseline_conversion_rate": 0.15,
                    "minimum_detectable_effect": 0.05,
                    "confidence_level": 0.95,
                    "power": 0.8,
                    "max_duration_days": 14,
                    "traffic_allocation": 0.5
                }
            }
        }


class RecordEventRequest(BaseModel):
    session_id: str
    algorithm_version: str
    recommendation_type: str
    recommendation_id: str
    event_type: EventType
    ab_test_id: Optional[int] = None
    variant_id: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class ABTestResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    test_type: ABTestType
    status: ABTestStatus
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    statistical_significance_reached: bool
    winning_variant_id: Optional[int]
    
    class Config:
        from_attributes = True


class OptimizationRequest(BaseModel):
    algorithm_version: str
    optimization_target: str = "conversion_rate"
    
    class Config:
        schema_extra = {
            "example": {
                "algorithm_version": "recommendation_v2.1",
                "optimization_target": "conversion_rate"
            }
        }


@router.post("/tests", response_model=ABTestResponse)
async def create_ab_test(
    request: CreateABTestRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new A/B test for recommendation optimization."""
    
    ab_framework = ABTestingFramework(db)
    
    try:
        if request.test_type == ABTestType.TEMPLATE_RECOMMENDATION:
            if not request.template_variants or len(request.template_variants) < 2:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Template recommendation tests require at least 2 template variants"
                )
            
            ab_test = await ab_framework.create_template_recommendation_test(
                name=request.name,
                template_variants=request.template_variants,
                test_config=request.test_config,
                creator_id=current_user.id
            )
            
        elif request.test_type == ABTestType.ALGORITHM_COMPARISON:
            if not request.algorithm_variants or len(request.algorithm_variants) < 2:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Algorithm comparison tests require at least 2 algorithm variants"
                )
            
            ab_test = await ab_framework.create_recommendation_ab_test(
                name=request.name,
                description=request.description or "",
                algorithm_variants=request.algorithm_variants,
                test_config=request.test_config,
                creator_id=current_user.id
            )
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Test type {request.test_type} not yet implemented"
            )
        
        return ABTestResponse.from_orm(ab_test)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating A/B test: {str(e)}"
        )


@router.get("/tests", response_model=List[ABTestResponse])
async def list_ab_tests(
    status_filter: Optional[ABTestStatus] = None,
    test_type: Optional[ABTestType] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List A/B tests with optional filtering."""
    
    from sqlalchemy import select, and_
    
    query = select(ABTest).order_by(ABTest.created_at.desc())
    
    # Apply filters
    conditions = []
    if status_filter:
        conditions.append(ABTest.status == status_filter)
    if test_type:
        conditions.append(ABTest.test_type == test_type)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    tests = result.scalars().all()
    
    return [ABTestResponse.from_orm(test) for test in tests]


@router.get("/tests/{test_id}")
async def get_ab_test_details(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed A/B test information including current results."""
    
    ab_framework = ABTestingFramework(db)
    
    # Get basic test info
    ab_test = await db.get(ABTest, test_id)
    if not ab_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="A/B test not found"
        )
    
    # Get detailed results
    results = await ab_framework.get_ab_test_results(test_id)
    
    return {
        "test_info": ABTestResponse.from_orm(ab_test),
        "results": results
    }


@router.post("/tests/{test_id}/start")
async def start_ab_test(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Start an A/B test."""
    
    ab_framework = ABTestingFramework(db)
    
    result = await ab_framework.start_ab_test(test_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result


@router.post("/tests/{test_id}/stop")
async def stop_ab_test(
    test_id: int,
    reason: str = "Manual stop",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Stop an A/B test and finalize results."""
    
    ab_framework = ABTestingFramework(db)
    
    result = await ab_framework.stop_ab_test(test_id, reason)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result


@router.post("/events")
async def record_recommendation_event(
    request: RecordEventRequest,
    db: AsyncSession = Depends(get_db)
):
    """Record a recommendation event for A/B testing tracking."""
    
    ab_framework = ABTestingFramework(db)
    
    try:
        await ab_framework.record_recommendation_event(
            session_id=request.session_id,
            algorithm_version=request.algorithm_version,
            recommendation_type=request.recommendation_type,
            recommendation_id=request.recommendation_id,
            event_type=request.event_type,
            ab_test_id=request.ab_test_id,
            variant_id=request.variant_id,
            metadata=request.metadata
        )
        
        return {"success": True, "message": "Event recorded"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error recording event: {str(e)}"
        )


@router.get("/tests/{test_id}/metrics")
async def get_realtime_metrics(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get real-time metrics for an A/B test."""
    
    ab_framework = ABTestingFramework(db)
    
    # Update metrics
    await ab_framework.update_realtime_metrics(test_id)
    
    # Get current results
    results = await ab_framework.get_ab_test_results(test_id)
    
    return results


@router.get("/dashboard")
async def get_recommendation_dashboard(
    algorithm_version: Optional[str] = None,
    date_range: int = 7,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get recommendation performance dashboard."""
    
    ab_framework = ABTestingFramework(db)
    
    dashboard = await ab_framework.get_recommendation_performance_dashboard(
        algorithm_version=algorithm_version,
        date_range=date_range
    )
    
    return dashboard


@router.post("/optimize")
async def optimize_recommendation_algorithm(
    request: OptimizationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate optimization recommendations for a recommendation algorithm."""
    
    optimizer = RecommendationOptimizer(db)
    
    try:
        # Get optimization recommendations
        optimization_result = await optimizer.optimize_recommendation_algorithm(
            current_algorithm=request.algorithm_version,
            optimization_target=request.optimization_target
        )
        
        # Schedule model retraining in background if needed
        background_tasks.add_task(
            schedule_model_retraining,
            algorithm_version=request.algorithm_version
        )
        
        return optimization_result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error optimizing algorithm: {str(e)}"
        )


@router.post("/optimization/train-models")
async def train_optimization_models(
    lookback_days: int = 90,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Train recommendation optimization models with latest data."""
    
    optimizer = RecommendationOptimizer(db)
    
    # Run training in background
    background_tasks.add_task(
        run_model_training,
        db=db,
        lookback_days=lookback_days
    )
    
    return {
        "success": True,
        "message": f"Model training started with {lookback_days} days of data",
        "estimated_completion": "10-15 minutes"
    }


@router.get("/optimization/dashboard")
async def get_optimization_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive optimization dashboard."""
    
    optimizer = RecommendationOptimizer(db)
    
    dashboard = await optimizer.get_optimization_dashboard()
    
    return dashboard


@router.post("/optimization/create-test")
async def create_optimization_ab_test(
    algorithm_version: str,
    optimization_suggestions: Dict[str, Any],
    test_config: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create A/B test for algorithm optimization."""
    
    optimizer = RecommendationOptimizer(db)
    
    try:
        ab_test = await optimizer.create_algorithm_ab_test(
            base_algorithm=algorithm_version,
            optimization_suggestions=optimization_suggestions,
            test_config=test_config
        )
        
        return ABTestResponse.from_orm(ab_test)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating optimization test: {str(e)}"
        )


@router.get("/tests/{test_id}/learnings")
async def analyze_test_learnings(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Analyze completed A/B test to extract optimization learnings."""
    
    optimizer = RecommendationOptimizer(db)
    
    try:
        learnings = await optimizer.analyze_ab_test_learnings(test_id)
        
        if "error" in learnings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=learnings["error"]
            )
        
        return learnings
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing test learnings: {str(e)}"
        )


@router.post("/predictions/performance")
async def predict_recommendation_performance(
    template_id: int,
    user_context: Dict[str, Any],
    recommendation_context: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Predict click and conversion probability for a recommendation."""
    
    optimizer = RecommendationOptimizer(db)
    
    try:
        prediction = await optimizer.predict_recommendation_performance(
            template_id=template_id,
            user_context=user_context,
            recommendation_context=recommendation_context
        )
        
        if "error" in prediction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=prediction["error"]
            )
        
        return prediction
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error predicting performance: {str(e)}"
        )


@router.post("/statistical/sample-size")
async def calculate_sample_size(
    baseline_rate: float = Field(..., gt=0, lt=1),
    minimum_detectable_effect: float = Field(..., gt=0, lt=1),
    power: float = Field(0.8, gt=0, lt=1),
    alpha: float = Field(0.05, gt=0, lt=1),
    current_user: User = Depends(get_current_user)
):
    """Calculate required sample size for A/B test."""
    
    try:
        sample_size = StatisticalAnalyzer.calculate_sample_size(
            baseline_rate=baseline_rate,
            minimum_detectable_effect=minimum_detectable_effect,
            power=power,
            alpha=alpha
        )
        
        return {
            "required_sample_size": sample_size,
            "per_variant": sample_size,
            "total_for_two_variants": sample_size * 2,
            "parameters": {
                "baseline_rate": baseline_rate,
                "minimum_detectable_effect": minimum_detectable_effect,
                "power": power,
                "alpha": alpha
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error calculating sample size: {str(e)}"
        )


@router.post("/statistical/significance-test")
async def perform_significance_test(
    control_views: int = Field(..., gt=0),
    control_conversions: int = Field(..., ge=0),
    variant_views: int = Field(..., gt=0),
    variant_conversions: int = Field(..., ge=0),
    confidence_level: float = Field(0.95, gt=0, lt=1),
    current_user: User = Depends(get_current_user)
):
    """Perform statistical significance test between two variants."""
    
    if control_conversions > control_views or variant_conversions > variant_views:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conversions cannot exceed views"
        )
    
    try:
        result = StatisticalAnalyzer.two_proportion_test(
            n1=variant_views,
            x1=variant_conversions,
            n2=control_views,
            x2=control_conversions,
            confidence_level=confidence_level
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error performing significance test: {str(e)}"
        )


# Background task functions
async def schedule_model_retraining(algorithm_version: str):
    """Schedule model retraining in background."""
    # This would trigger a Celery task
    from app.core.celery import celery_app
    celery_app.send_task(
        "retrain_optimization_models",
        args=[algorithm_version],
        countdown=60
    )


async def run_model_training(db: AsyncSession, lookback_days: int):
    """Run model training in background."""
    optimizer = RecommendationOptimizer(db)
    result = await optimizer.train_optimization_models(lookback_days)
    # Log result or store in database
    print(f"Model training completed: {result}")