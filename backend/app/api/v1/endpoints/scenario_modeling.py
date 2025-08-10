"""Scenario modeling API endpoints for template configuration optimization."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.scenario_modeling import (
    ScenarioModelingConfiguration,
    ScenarioModel,
    ScenarioPrediction,
    OptimizationRecommendation
)
from app.schemas.scenario_modeling import (
    ScenarioModelingRequest,
    ScenarioGenerationRequest,
    ScenarioPredictionRequest,
    OptimizationRequest,
    ScenarioSimulationRequest,
    ScenarioModelingConfigurationResponse,
    ScenarioModelResponse,
    ScenarioPredictionResponse,
    OptimizationRecommendationResponse,
    ScenarioComparisonResponse,
    ScenarioSimulationResponse,
    HistoricalPerformanceRequest,
    HistoricalPerformanceResponse,
    MultiDimensionalAnalysisRequest,
    MultiDimensionalAnalysisResponse
)
from app.services.scenario_modeling_service import ScenarioModelingService
from app.core.celery import celery_app
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/configurations", response_model=Dict[str, Any])
async def create_scenario_configuration(
    request: ScenarioModelingRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new scenario modeling configuration.
    
    This endpoint initializes a new scenario modeling experiment
    for a specific template with defined optimization objectives.
    """
    try:
        service = ScenarioModelingService(db)
        result = await service.create_scenario_configuration(request)
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return {
            "message": "Scenario modeling configuration created successfully",
            "configuration_id": result["configuration_id"],
            "next_steps": [
                "Generate scenarios using /scenarios/generate",
                "Run predictions using /predictions/generate",
                "Get optimization recommendations using /recommendations/generate"
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating scenario configuration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create scenario configuration"
        )


@router.get("/configurations/{configuration_id}", response_model=ScenarioModelingConfigurationResponse)
async def get_scenario_configuration(
    configuration_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get scenario modeling configuration details.
    """
    try:
        result = await db.execute(
            select(ScenarioModelingConfiguration)
            .where(ScenarioModelingConfiguration.id == configuration_id)
            .options(selectinload(ScenarioModelingConfiguration.scenarios))
        )
        
        configuration = result.scalars().first()
        if not configuration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuration not found"
            )
        
        # Add computed fields
        scenarios_count = len(configuration.scenarios)
        active_scenarios = [s for s in configuration.scenarios if s.is_active]
        
        response_data = ScenarioModelingConfigurationResponse.model_validate(configuration)
        response_data.scenarios_count = scenarios_count
        response_data.active_scenarios_count = len(active_scenarios)
        
        if active_scenarios:
            response_data.latest_prediction_date = max(s.updated_at for s in active_scenarios)
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting scenario configuration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get scenario configuration"
        )


@router.get("/configurations", response_model=List[ScenarioModelingConfigurationResponse])
async def list_scenario_configurations(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all scenario modeling configurations.
    """
    try:
        result = await db.execute(
            select(ScenarioModelingConfiguration)
            .options(selectinload(ScenarioModelingConfiguration.scenarios))
            .order_by(desc(ScenarioModelingConfiguration.created_at))
            .offset(skip)
            .limit(limit)
        )
        
        configurations = result.scalars().all()
        
        # Convert to response format with computed fields
        response_configs = []
        for config in configurations:
            response_data = ScenarioModelingConfigurationResponse.model_validate(config)
            response_data.scenarios_count = len(config.scenarios)
            response_data.active_scenarios_count = len([s for s in config.scenarios if s.is_active])
            
            if config.scenarios:
                response_data.latest_prediction_date = max(s.updated_at for s in config.scenarios)
            
            response_configs.append(response_data)
        
        return response_configs
        
    except Exception as e:
        logger.error(f"Error listing scenario configurations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list scenario configurations"
        )


@router.post("/scenarios/generate", response_model=Dict[str, Any])
async def generate_scenarios(
    request: ScenarioGenerationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate multiple scenarios for analysis.
    
    This endpoint creates diverse scenario variations based on
    the configuration parameters using AI and statistical methods.
    """
    try:
        service = ScenarioModelingService(db)
        result = await service.generate_scenarios(request)
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        # Queue background task for ML model training
        background_tasks.add_task(
            celery_app.send_task,
            "train_scenario_models",
            args=[request.configuration_id]
        )
        
        return {
            "message": f"Generated {result['scenarios_generated']} scenarios",
            "scenario_ids": result["scenario_ids"],
            "scenarios_generated": result["scenarios_generated"],
            "background_training_started": True,
            "next_steps": [
                "Run predictions using /predictions/generate",
                "Compare scenarios using /scenarios/compare"
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating scenarios: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate scenarios"
        )


@router.get("/scenarios/{configuration_id}", response_model=List[ScenarioModelResponse])
async def get_scenarios(
    configuration_id: str,
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all scenarios for a configuration.
    """
    try:
        query = select(ScenarioModel).where(ScenarioModel.configuration_id == configuration_id)
        
        if not include_inactive:
            query = query.where(ScenarioModel.is_active == True)
        
        result = await db.execute(query.order_by(desc(ScenarioModel.execution_priority)))
        scenarios = result.scalars().all()
        
        return [ScenarioModelResponse.model_validate(scenario) for scenario in scenarios]
        
    except Exception as e:
        logger.error(f"Error getting scenarios: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get scenarios"
        )


@router.post("/predictions/generate", response_model=Dict[str, Any])
async def generate_predictions(
    request: ScenarioPredictionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate predictions for scenario outcomes.
    
    Uses advanced ML models to predict conversion rates, revenue,
    engagement, and other key metrics with confidence intervals.
    """
    try:
        service = ScenarioModelingService(db)
        result = await service.predict_scenario_outcomes(request)
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return {
            "message": f"Generated {result['total_predictions']} predictions",
            "predictions": result["predictions"],
            "total_predictions": result["total_predictions"],
            "prediction_types": request.prediction_types,
            "confidence_level": request.confidence_level,
            "next_steps": [
                "Compare scenarios using /scenarios/compare",
                "Get optimization recommendations using /recommendations/generate"
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating predictions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate predictions"
        )


@router.get("/predictions/{scenario_id}", response_model=List[ScenarioPredictionResponse])
async def get_scenario_predictions(
    scenario_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all predictions for a specific scenario.
    """
    try:
        result = await db.execute(
            select(ScenarioPrediction)
            .where(ScenarioPrediction.scenario_id == scenario_id)
            .order_by(desc(ScenarioPrediction.created_at))
        )
        
        predictions = result.scalars().all()
        return [ScenarioPredictionResponse.model_validate(pred) for pred in predictions]
        
    except Exception as e:
        logger.error(f"Error getting scenario predictions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get scenario predictions"
        )


@router.post("/recommendations/generate", response_model=Dict[str, Any])
async def generate_optimization_recommendations(
    request: OptimizationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI-powered optimization recommendations.
    
    Analyzes scenario performance data to provide actionable
    recommendations for template configuration optimization.
    """
    try:
        service = ScenarioModelingService(db)
        result = await service.generate_optimization_recommendations(request)
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return {
            "message": f"Generated {result['total_recommendations']} optimization recommendations",
            "recommendations": result["recommendations"],
            "recommendation_ids": result["recommendation_ids"],
            "total_recommendations": result["total_recommendations"],
            "filters_applied": {
                "minimum_impact_threshold": request.minimum_impact_threshold,
                "risk_tolerance": request.risk_tolerance
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating optimization recommendations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate optimization recommendations"
        )


@router.get("/recommendations/{configuration_id}", response_model=List[OptimizationRecommendationResponse])
async def get_optimization_recommendations(
    configuration_id: str,
    status_filter: Optional[str] = None,
    priority_threshold: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get optimization recommendations for a configuration.
    """
    try:
        query = select(OptimizationRecommendation).where(
            OptimizationRecommendation.configuration_id == configuration_id
        )
        
        if status_filter:
            query = query.where(OptimizationRecommendation.status == status_filter)
        
        if priority_threshold > 0:
            query = query.where(OptimizationRecommendation.priority >= priority_threshold)
        
        result = await db.execute(
            query.order_by(desc(OptimizationRecommendation.priority))
        )
        
        recommendations = result.scalars().all()
        return [OptimizationRecommendationResponse.model_validate(rec) for rec in recommendations]
        
    except Exception as e:
        logger.error(f"Error getting optimization recommendations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get optimization recommendations"
        )


@router.post("/simulate", response_model=ScenarioSimulationResponse)
async def run_scenario_simulation(
    request: ScenarioSimulationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Run real-time scenario simulation.
    
    Performs Monte Carlo simulation to assess the impact of
    template modifications with confidence intervals and risk metrics.
    """
    try:
        service = ScenarioModelingService(db)
        result = await service.run_scenario_simulation(request)
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        # Remove success field for clean response
        result.pop("success", None)
        
        return ScenarioSimulationResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running scenario simulation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to run scenario simulation"
        )


@router.get("/scenarios/compare/{configuration_id}", response_model=ScenarioComparisonResponse)
async def compare_scenarios(
    configuration_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compare all scenarios within a configuration.
    
    Provides comprehensive analysis of scenario performance
    with statistical significance testing and ranking.
    """
    try:
        service = ScenarioModelingService(db)
        result = await service.compare_scenarios(configuration_id)
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        # Get scenarios and predictions for response
        scenarios_result = await db.execute(
            select(ScenarioModel).where(
                ScenarioModel.configuration_id == configuration_id
            ).where(ScenarioModel.is_active == True)
        )
        scenarios = scenarios_result.scalars().all()
        
        predictions_result = await db.execute(
            select(ScenarioPrediction)
            .join(ScenarioModel)
            .where(ScenarioModel.configuration_id == configuration_id)
        )
        predictions = predictions_result.scalars().all()
        
        return ScenarioComparisonResponse(
            configuration_id=configuration_id,
            comparison_type="comprehensive",
            scenarios=[ScenarioModelResponse.model_validate(s) for s in scenarios],
            predictions=[ScenarioPredictionResponse.model_validate(p) for p in predictions],
            best_performing_scenario=result.get("best_performing_scenario"),
            performance_ranking=result["comparison_results"].get("ranking", []),
            key_insights=result["insights"],
            recommended_scenario=result.get("best_performing_scenario"),
            confidence_in_recommendation=result["confidence_in_recommendation"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing scenarios: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compare scenarios"
        )


@router.post("/analysis/historical-performance", response_model=HistoricalPerformanceResponse)
async def analyze_historical_performance(
    request: HistoricalPerformanceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze historical performance data for templates.
    
    Provides trend analysis, seasonal patterns, and performance insights
    based on historical data to inform scenario modeling.
    """
    try:
        # This would integrate with analytics service to get real historical data
        # For now, returning mock structure
        
        historical_data = {
            "template_ids": request.template_ids,
            "date_range_start": request.date_range_start,
            "date_range_end": request.date_range_end,
            "performance_data": {
                "conversion_rate": [
                    {"date": "2024-01-01", "value": 0.15, "template_id": request.template_ids[0]}
                ],
                "engagement": [
                    {"date": "2024-01-01", "value": 0.25, "template_id": request.template_ids[0]}
                ]
            },
            "aggregated_metrics": {
                "conversion_rate": {"mean": 0.15, "std": 0.03, "median": 0.14},
                "engagement": {"mean": 0.25, "std": 0.05, "median": 0.24}
            },
            "trend_analysis": {
                "conversion_rate": "improving",
                "engagement": "stable"
            },
            "seasonal_patterns": {
                "conversion_rate": [1.0, 0.9, 0.95, 1.1, 1.05, 0.98, 0.92, 0.94, 1.02, 1.08, 1.15, 1.2],
                "engagement": [1.0, 0.95, 1.0, 1.05, 1.1, 0.98, 0.9, 0.92, 1.0, 1.05, 1.1, 1.15]
            },
            "correlation_matrix": {
                "conversion_rate": {"engagement": 0.65, "revenue": 0.85},
                "engagement": {"conversion_rate": 0.65, "revenue": 0.45}
            },
            "performance_insights": [
                "Conversion rates show consistent upward trend over the analysis period",
                "Seasonal peaks occur during Q4 and early Q2",
                "Strong positive correlation between conversion rate and revenue"
            ],
            "anomaly_detection": [
                {
                    "date": "2024-02-15",
                    "metric": "conversion_rate",
                    "value": 0.05,
                    "expected_range": [0.12, 0.18],
                    "severity": "high"
                }
            ],
            "data_quality_score": 0.92,
            "created_at": "2024-01-15T10:30:00Z"
        }
        
        return HistoricalPerformanceResponse(**historical_data)
        
    except Exception as e:
        logger.error(f"Error analyzing historical performance: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze historical performance"
        )


@router.post("/analysis/multi-dimensional", response_model=MultiDimensionalAnalysisResponse)
async def run_multi_dimensional_analysis(
    request: MultiDimensionalAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Run multi-dimensional scenario analysis.
    
    Analyzes the interaction effects between different dimensions
    (industry, audience, goals, etc.) to identify optimal combinations.
    """
    try:
        # Get configuration
        config_result = await db.execute(
            select(ScenarioModelingConfiguration)
            .where(ScenarioModelingConfiguration.id == request.configuration_id)
        )
        
        configuration = config_result.scalars().first()
        if not configuration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuration not found"
            )
        
        # Mock multi-dimensional analysis results
        # In production, this would perform sophisticated statistical analysis
        
        analysis_results = {
            "configuration_id": request.configuration_id,
            "dimensions_analyzed": request.dimensions,
            "dimension_effects": {
                "industry": {
                    "saas": 0.85,
                    "ecommerce": 0.72,
                    "healthcare": 0.91
                },
                "audience": {
                    "b2b": 0.78,
                    "b2c": 0.66,
                    "enterprise": 0.93
                }
            },
            "interaction_effects": {
                "industry_x_audience": 0.15,
                "audience_x_goals": 0.08
            },
            "optimal_combinations": [
                {
                    "combination": {"industry": "healthcare", "audience": "enterprise"},
                    "predicted_performance": 0.94,
                    "confidence": 0.89
                }
            ],
            "top_performing_combinations": [
                {
                    "rank": 1,
                    "combination": {"industry": "healthcare", "audience": "enterprise"},
                    "performance_score": 0.94
                }
            ],
            "dimension_importance_ranking": [
                {"dimension": "industry", "importance": 0.45},
                {"dimension": "audience", "importance": 0.35}
            ],
            "configuration_recommendations": [
                {
                    "recommendation": "Focus on healthcare + enterprise combination",
                    "expected_lift": 0.25,
                    "confidence": 0.89
                }
            ],
            "next_experiments": [
                {
                    "experiment_name": "Healthcare Enterprise Optimization",
                    "parameters": {"industry": "healthcare", "audience": "enterprise"},
                    "expected_duration_days": 14
                }
            ],
            "created_at": "2024-01-15T10:30:00Z"
        }
        
        return MultiDimensionalAnalysisResponse(**analysis_results)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running multi-dimensional analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to run multi-dimensional analysis"
        )


@router.delete("/configurations/{configuration_id}")
async def delete_scenario_configuration(
    configuration_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a scenario modeling configuration and all associated data.
    """
    try:
        # Get configuration
        config_result = await db.execute(
            select(ScenarioModelingConfiguration)
            .where(ScenarioModelingConfiguration.id == configuration_id)
        )
        
        configuration = config_result.scalars().first()
        if not configuration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuration not found"
            )
        
        await db.delete(configuration)
        await db.commit()
        
        return {"message": "Scenario configuration deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting scenario configuration: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete scenario configuration"
        )


@router.post("/what-if/{configuration_id}", response_model=Dict[str, Any])
async def what_if_analysis(
    configuration_id: str,
    request: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Perform what-if analysis for template modifications.
    
    Analyzes the potential impact of specific modifications using
    Monte Carlo simulation and predictive modeling.
    """
    try:
        modifications = request.get("modifications", {})
        comparison_scenarios = request.get("comparison_scenarios", [])
        simulation_runs = request.get("simulation_runs", 1000)
        
        service = ScenarioModelingService(db)
        result = await service.what_if_analysis(
            configuration_id, 
            modifications, 
            comparison_scenarios,
            simulation_runs
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return {
            "message": "What-if analysis completed successfully",
            "analysis_results": result,
            "confidence_score": result.get("confidence_score", 0.5),
            "implementation_recommendation": "high_priority" if result.get("confidence_score", 0) > 0.8 else "medium_priority"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in what-if analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform what-if analysis"
        )


@router.post("/optimize/{configuration_id}", response_model=Dict[str, Any])
async def run_automated_optimization(
    configuration_id: str,
    optimization_method: str = "genetic_algorithm",
    max_iterations: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Run automated optimization using advanced algorithms.
    
    Uses genetic algorithms, Bayesian optimization, or grid search
    to find optimal template configurations automatically.
    """
    try:
        service = ScenarioModelingService(db)
        result = await service.run_automated_optimization(
            configuration_id, 
            optimization_method,
            max_iterations
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return {
            "message": f"Automated optimization completed using {optimization_method}",
            "optimization_results": result,
            "optimal_parameters": result.get("optimal_parameters", {}),
            "expected_improvement": f"{result.get('expected_improvement', 0):.1%}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in automated optimization: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to run automated optimization"
        )


@router.post("/forecast/{configuration_id}", response_model=Dict[str, Any])
async def generate_performance_forecast(
    configuration_id: str,
    forecast_horizon_days: int = 90,
    confidence_level: float = 0.95,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate performance forecasts for scenario configurations.
    
    Provides time-series forecasting with confidence intervals
    and trend analysis for long-term planning.
    """
    try:
        service = ScenarioModelingService(db)
        result = await service.generate_performance_forecast(
            configuration_id, 
            forecast_horizon_days,
            confidence_level
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return {
            "message": f"Performance forecast generated for {forecast_horizon_days} days",
            "forecast_results": result,
            "best_long_term_scenario": result.get("best_long_term_scenario"),
            "forecast_reliability": f"{result.get('forecast_reliability', 0.7):.1%}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating performance forecast: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate performance forecast"
        )


@router.post("/sensitivity/{configuration_id}", response_model=Dict[str, Any])
async def sensitivity_analysis(
    configuration_id: str,
    request: Dict[str, Any] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Perform sensitivity analysis on scenario parameters.
    
    Analyzes how changes in individual parameters affect outcomes
    and identifies the most impactful optimization levers.
    """
    try:
        parameters_to_analyze = None
        if request:
            parameters_to_analyze = request.get("parameters_to_analyze")
        
        service = ScenarioModelingService(db)
        result = await service.sensitivity_analysis(
            configuration_id, 
            parameters_to_analyze
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return {
            "message": "Sensitivity analysis completed successfully",
            "sensitivity_results": result,
            "most_sensitive_parameter": result.get("most_sensitive_parameter"),
            "parameters_analyzed": result.get("parameters_analyzed", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in sensitivity analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform sensitivity analysis"
        )


@router.get("/export/{configuration_id}", response_model=Dict[str, Any])
async def export_scenario_analysis(
    configuration_id: str,
    export_format: str = "json",
    include_predictions: bool = True,
    include_recommendations: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export comprehensive scenario analysis data.
    
    Exports all scenario data, predictions, and recommendations
    in various formats for external analysis and reporting.
    """
    try:
        service = ScenarioModelingService(db)
        result = await service.export_scenario_analysis(
            configuration_id, 
            export_format,
            include_predictions,
            include_recommendations
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return {
            "message": "Scenario analysis exported successfully",
            "export_data": result["export_data"],
            "download_ready": result["download_ready"],
            "file_size_estimate": f"{result.get('file_size_estimate', 0):,} bytes"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting scenario analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export scenario analysis"
        )