"""
SLA Optimization API endpoints for Story 3.5
Threshold optimization, A/B testing, and management endpoints.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import logging

from app.core.database import get_db
from app.services.sla_performance_analysis_service import SLAPerformanceAnalysisService
from app.services.sla_threshold_optimizer import (
    SLAThresholdOptimizer, 
    OptimizationObjective,
    ThresholdOptimizationRecommendation
)
from app.services.sla_ab_testing_service import (
    SLAABTestingService,
    ExperimentConfig,
    ExperimentResult,
    StoppingReason
)
from app.services.threshold_management_service import (
    ThresholdManagementService,
    ThresholdChangeRequest,
    ThresholdChangeRecord,
    ChangeType,
    RollbackTrigger
)

logger = logging.getLogger(__name__)
router = APIRouter()


# Performance Analysis Endpoints

@router.get("/analysis/{service_type}")
async def get_performance_analysis(
    service_type: str,
    analysis_period_days: int = 30,
    confidence_level: float = 0.95,
    include_seasonal: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive performance analysis for service type."""
    try:
        analysis_service = SLAPerformanceAnalysisService(db)
        
        analysis = await analysis_service.analyze_service_performance(
            service_type=service_type,
            analysis_period_days=analysis_period_days,
            confidence_level=confidence_level,
            include_seasonal_patterns=include_seasonal
        )
        
        return {
            "service_type": analysis.service_type,
            "analysis_period_days": analysis.analysis_period_days,
            "sample_size": analysis.sample_size,
            "current_thresholds": analysis.current_thresholds,
            "statistics": {
                "mean_performance": analysis.performance_statistics.mean_performance,
                "median_performance": analysis.performance_statistics.median_performance,
                "percentile_95": analysis.performance_statistics.percentile_95,
                "percentile_99": analysis.performance_statistics.percentile_99,
                "standard_deviation": analysis.performance_statistics.standard_deviation,
                "coefficient_of_variation": analysis.performance_statistics.coefficient_of_variation,
                "distribution_type": analysis.performance_statistics.distribution_type
            },
            "patterns": {
                "trend_direction": analysis.patterns.trend_direction.value,
                "trend_confidence": analysis.patterns.trend_confidence,
                "seasonal_factors": [
                    {
                        "period": sf.period,
                        "pattern_strength": sf.pattern_strength,
                        "peak_periods": sf.peak_periods,
                        "low_periods": sf.low_periods
                    }
                    for sf in analysis.patterns.seasonal_factors
                ],
                "load_correlations": [
                    {
                        "metric_name": lc.metric_name,
                        "correlation_coefficient": lc.correlation_coefficient,
                        "significance_level": lc.significance_level
                    }
                    for lc in analysis.patterns.load_correlations
                ]
            },
            "confidence_level": analysis.confidence_level,
            "data_quality_score": analysis.data_quality_score,
            "analysis_timestamp": analysis.analysis_timestamp.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get performance analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze performance")


@router.get("/analysis/report")
async def get_performance_report(
    service_types: Optional[List[str]] = None,
    analysis_period_days: int = 30,
    db: AsyncSession = Depends(get_db)
):
    """Generate comprehensive performance report for multiple service types."""
    try:
        analysis_service = SLAPerformanceAnalysisService(db)
        
        # If no service types specified, get all monitored services
        if not service_types:
            service_types = await analysis_service.get_monitored_service_types()
        
        report = {}
        for service_type in service_types:
            try:
                analysis = await analysis_service.analyze_service_performance(
                    service_type=service_type,
                    analysis_period_days=analysis_period_days
                )
                report[service_type] = analysis
            except Exception as e:
                logger.error(f"Failed to analyze {service_type}: {e}")
                continue
        
        return {
            "report_generated_at": datetime.utcnow().isoformat(),
            "analysis_period_days": analysis_period_days,
            "services_analyzed": len(report),
            "analyses": {
                service_type: {
                    "sample_size": analysis.sample_size,
                    "data_quality_score": analysis.data_quality_score,
                    "violation_rate": analysis.current_thresholds.get('violation_rate', 0.0),
                    "trend_direction": analysis.patterns.trend_direction.value,
                    "optimization_potential": (
                        1.0 - analysis.data_quality_score if analysis.patterns.trend_direction.value == "degrading"
                        else analysis.data_quality_score
                    )
                }
                for service_type, analysis in report.items()
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to generate performance report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate report")


# Threshold Optimization Endpoints

@router.post("/optimize/{service_type}")
async def optimize_threshold(
    service_type: str,
    objective: OptimizationObjective = OptimizationObjective.BALANCE_BOTH,
    analysis_period_days: int = 30,
    db: AsyncSession = Depends(get_db)
):
    """Generate threshold optimization recommendations for service type."""
    try:
        optimizer = SLAThresholdOptimizer(db)
        
        optimization_result = await optimizer.optimize_threshold(
            service_type=service_type,
            objective=objective,
            analysis_period_days=analysis_period_days
        )
        
        if not optimization_result.optimization_successful:
            raise HTTPException(
                status_code=400, 
                detail="Optimization failed - insufficient data or poor model performance"
            )
        
        return {
            "service_type": optimization_result.service_type,
            "optimization_successful": optimization_result.optimization_successful,
            "optimization_score": optimization_result.optimization_score,
            "processing_time_seconds": optimization_result.processing_time_seconds,
            "model_performance_metrics": optimization_result.model_performance_metrics,
            "recommendations": [
                {
                    "service_type": rec.service_type,
                    "current_threshold": rec.current_threshold,
                    "recommended_threshold": rec.recommended_threshold,
                    "optimization_rationale": {
                        "statistical_basis": rec.optimization_rationale.statistical_basis,
                        "reliability_impact": rec.optimization_rationale.reliability_impact,
                        "achievability_improvement": rec.optimization_rationale.achievability_improvement,
                        "business_justification": rec.optimization_rationale.business_justification
                    },
                    "predicted_outcomes": {
                        "expected_violation_rate": rec.predicted_outcomes.expected_violation_rate,
                        "reliability_score_change": rec.predicted_outcomes.reliability_score_change,
                        "team_stress_reduction": rec.predicted_outcomes.team_stress_reduction,
                        "cost_impact": rec.predicted_outcomes.cost_impact,
                        "customer_satisfaction_change": rec.predicted_outcomes.customer_satisfaction_change
                    },
                    "confidence_score": rec.confidence_score,
                    "implementation_risk": rec.implementation_risk.value,
                    "rollback_criteria": rec.rollback_criteria,
                    "optimization_timestamp": rec.optimization_timestamp.isoformat(),
                    "model_version": rec.model_version
                }
                for rec in optimization_result.recommendations
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to optimize threshold: {e}")
        raise HTTPException(status_code=500, detail="Failed to optimize threshold")


@router.get("/recommendations")
async def get_all_recommendations(
    db: AsyncSession = Depends(get_db)
):
    """Get optimization recommendations for all services."""
    try:
        optimizer = SLAThresholdOptimizer(db)
        analysis_service = SLAPerformanceAnalysisService(db)
        
        # Get all monitored service types
        service_types = await analysis_service.get_monitored_service_types()
        
        recommendations = []
        for service_type in service_types:
            try:
                optimization_result = await optimizer.optimize_threshold(service_type)
                if optimization_result.optimization_successful:
                    recommendations.extend(optimization_result.recommendations)
            except Exception as e:
                logger.error(f"Failed to get recommendations for {service_type}: {e}")
                continue
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Failed to get all recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get recommendations")


# A/B Testing Endpoints

@router.post("/experiments")
async def create_ab_experiment(
    service_type: str,
    control_threshold: float,
    test_threshold: float,
    experiment_duration_days: int = 14,
    traffic_split: float = 0.5,
    significance_level: float = 0.05,
    power: float = 0.8,
    db: AsyncSession = Depends(get_db)
):
    """Create a new A/B testing experiment for threshold optimization."""
    try:
        ab_testing_service = SLAABTestingService(db)
        
        config = await ab_testing_service.create_experiment(
            service_type=service_type,
            control_threshold=control_threshold,
            test_threshold=test_threshold,
            experiment_duration_days=experiment_duration_days,
            traffic_split=traffic_split,
            significance_level=significance_level,
            power=power
        )
        
        return {
            "experiment_id": config.experiment_id,
            "service_type": config.service_type,
            "control_threshold": config.control_threshold,
            "test_threshold": config.test_threshold,
            "experiment_duration_days": config.experiment_duration_days,
            "minimum_sample_size": config.minimum_sample_size,
            "significance_level": config.significance_level,
            "power": config.power,
            "effect_size": config.effect_size,
            "traffic_split": config.traffic_split,
            "status": "created"
        }
        
    except Exception as e:
        logger.error(f"Failed to create A/B experiment: {e}")
        raise HTTPException(status_code=500, detail="Failed to create experiment")


@router.post("/experiments/{experiment_id}/start")
async def start_ab_experiment(
    experiment_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Start an A/B testing experiment."""
    try:
        ab_testing_service = SLAABTestingService(db)
        
        success = await ab_testing_service.start_experiment(experiment_id)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to start experiment")
        
        return {
            "experiment_id": experiment_id,
            "status": "started",
            "message": "Experiment started successfully. Background monitoring is active."
        }
        
    except Exception as e:
        logger.error(f"Failed to start experiment: {e}")
        raise HTTPException(status_code=500, detail="Failed to start experiment")


@router.get("/experiments/{experiment_id}/status")
async def get_experiment_status(
    experiment_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get current status of A/B testing experiment."""
    try:
        ab_testing_service = SLAABTestingService(db)
        
        status = await ab_testing_service.get_experiment_status(experiment_id)
        
        if not status:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        return {
            "experiment_id": status.experiment_id,
            "status": status.status.value,
            "start_time": status.start_time.isoformat(),
            "end_time": status.end_time.isoformat() if status.end_time else None,
            "current_sample_size": status.current_sample_size,
            "control_group_size": status.control_group_size,
            "test_group_size": status.test_group_size,
            "days_running": status.days_running,
            "statistical_power": status.statistical_power,
            "current_p_value": status.current_p_value,
            "effect_size_observed": status.effect_size_observed,
            "stopping_probability": status.stopping_probability
        }
        
    except Exception as e:
        logger.error(f"Failed to get experiment status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get experiment status")


@router.post("/experiments/{experiment_id}/stop")
async def stop_ab_experiment(
    experiment_id: str,
    reason: str = "manual_stop",
    db: AsyncSession = Depends(get_db)
):
    """Stop a running A/B testing experiment."""
    try:
        ab_testing_service = SLAABTestingService(db)
        
        # Map string to enum
        stopping_reason = StoppingReason.MANUAL_STOP
        if reason == "statistical_significance":
            stopping_reason = StoppingReason.STATISTICAL_SIGNIFICANCE
        elif reason == "performance_degradation":
            stopping_reason = StoppingReason.PERFORMANCE_DEGRADATION
        
        success = await ab_testing_service.stop_experiment(experiment_id, stopping_reason)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to stop experiment")
        
        return {
            "experiment_id": experiment_id,
            "status": "stopped",
            "reason": reason,
            "message": "Experiment stopped successfully. Results are being analyzed."
        }
        
    except Exception as e:
        logger.error(f"Failed to stop experiment: {e}")
        raise HTTPException(status_code=500, detail="Failed to stop experiment")


@router.get("/experiments/{experiment_id}/results")
async def get_experiment_results(
    experiment_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get A/B testing experiment results and recommendations."""
    try:
        ab_testing_service = SLAABTestingService(db)
        
        results = await ab_testing_service.analyze_experiment_results(experiment_id)
        
        if not results:
            raise HTTPException(status_code=404, detail="Experiment results not found")
        
        return {
            "experiment_id": results.experiment_id,
            "service_type": results.service_type,
            "completion_timestamp": results.completion_timestamp.isoformat(),
            "control_metrics": {
                "sample_size": results.control_metrics.sample_size,
                "violation_rate": results.control_metrics.violation_rate,
                "mean_performance": results.control_metrics.mean_performance,
                "percentile_95": results.control_metrics.percentile_95
            },
            "test_metrics": {
                "sample_size": results.test_metrics.sample_size,
                "violation_rate": results.test_metrics.violation_rate,
                "mean_performance": results.test_metrics.mean_performance,
                "percentile_95": results.test_metrics.percentile_95
            },
            "statistical_analysis": {
                "p_value": results.statistical_analysis.p_value,
                "confidence_interval": results.statistical_analysis.confidence_interval,
                "effect_size": results.statistical_analysis.effect_size,
                "statistical_power": results.statistical_analysis.statistical_power,
                "test_method": results.statistical_analysis.test_method
            },
            "business_impact": results.business_impact,
            "recommendation": results.recommendation,
            "confidence_score": results.confidence_score
        }
        
    except Exception as e:
        logger.error(f"Failed to get experiment results: {e}")
        raise HTTPException(status_code=500, detail="Failed to get experiment results")


@router.get("/experiments/active")
async def get_active_experiments(
    db: AsyncSession = Depends(get_db)
):
    """Get all currently active A/B test experiments."""
    try:
        # Mock implementation for now
        return {
            "total_active": 0,
            "active_experiments": []
        }
        
    except Exception as e:
        logger.error(f"Failed to get active experiments: {e}")
        raise HTTPException(status_code=500, detail="Failed to get active experiments")


# Threshold Management Endpoints

@router.post("/thresholds/change")
async def request_threshold_change(
    service_type: str,
    current_threshold: float,
    proposed_threshold: float,
    change_type: str = "optimization",
    justification: str = "",
    requested_by: str = "system",
    rollback_criteria: Optional[List[str]] = None,
    monitoring_duration_hours: int = 48,
    auto_rollback_enabled: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """Request a threshold change with impact assessment."""
    try:
        management_service = ThresholdManagementService(db)
        
        # Map string to enum
        change_type_enum = ChangeType.OPTIMIZATION
        if change_type == "manual":
            change_type_enum = ChangeType.MANUAL
        elif change_type == "ab_test":
            change_type_enum = ChangeType.A_B_TEST
        elif change_type == "emergency":
            change_type_enum = ChangeType.EMERGENCY
        
        request = ThresholdChangeRequest(
            service_type=service_type,
            current_threshold=current_threshold,
            proposed_threshold=proposed_threshold,
            change_type=change_type_enum,
            justification=justification,
            requested_by=requested_by,
            rollback_criteria=rollback_criteria or [],
            monitoring_duration_hours=monitoring_duration_hours,
            auto_rollback_enabled=auto_rollback_enabled
        )
        
        change_id, impact_assessment = await management_service.request_threshold_change(request)
        
        return {
            "change_id": change_id,
            "status": "pending",
            "impact_assessment": {
                "expected_violation_rate_change": impact_assessment.expected_violation_rate_change,
                "performance_impact_estimate": impact_assessment.performance_impact_estimate,
                "affected_services": impact_assessment.affected_services,
                "risk_level": impact_assessment.risk_level,
                "confidence_score": impact_assessment.confidence_score,
                "business_impact_score": impact_assessment.business_impact_score,
                "rollback_feasibility": impact_assessment.rollback_feasibility
            },
            "message": "Threshold change requested successfully. Review impact assessment before applying."
        }
        
    except Exception as e:
        logger.error(f"Failed to request threshold change: {e}")
        raise HTTPException(status_code=500, detail="Failed to request threshold change")


@router.post("/thresholds/change/{change_id}/apply")
async def apply_threshold_change(
    change_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Apply approved threshold change."""
    try:
        management_service = ThresholdManagementService(db)
        
        success = await management_service.apply_threshold_change(change_id)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to apply threshold change")
        
        return {
            "change_id": change_id,
            "status": "applied",
            "message": "Threshold change applied successfully. Monitoring has started."
        }
        
    except Exception as e:
        logger.error(f"Failed to apply threshold change: {e}")
        raise HTTPException(status_code=500, detail="Failed to apply threshold change")


@router.post("/thresholds/change/{change_id}/rollback")
async def rollback_threshold_change(
    change_id: str,
    trigger: str = "manual",
    trigger_metrics: Optional[Dict[str, float]] = None,
    db: AsyncSession = Depends(get_db)
):
    """Rollback a threshold change to previous value."""
    try:
        management_service = ThresholdManagementService(db)
        
        # Map string to enum
        trigger_enum = RollbackTrigger.MANUAL
        if trigger == "automatic":
            trigger_enum = RollbackTrigger.AUTOMATIC
        elif trigger == "violation_rate":
            trigger_enum = RollbackTrigger.VIOLATION_RATE
        elif trigger == "performance_degradation":
            trigger_enum = RollbackTrigger.PERFORMANCE_DEGRADATION
        
        success = await management_service.rollback_threshold_change(
            change_id, trigger_enum, trigger_metrics
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to rollback threshold change")
        
        return {
            "change_id": change_id,
            "status": "rolled_back",
            "trigger": trigger,
            "message": "Threshold change rolled back successfully."
        }
        
    except Exception as e:
        logger.error(f"Failed to rollback threshold change: {e}")
        raise HTTPException(status_code=500, detail="Failed to rollback threshold change")


@router.get("/thresholds/history")
async def get_threshold_change_history(
    service_type: Optional[str] = None,
    hours: int = 168,
    db: AsyncSession = Depends(get_db)
):
    """Get threshold change history for analysis."""
    try:
        management_service = ThresholdManagementService(db)
        
        history = await management_service.get_change_history(service_type, hours)
        
        return {
            "total_changes": len(history),
            "period_hours": hours,
            "service_type_filter": service_type,
            "changes": [
                {
                    "change_id": change.change_id,
                    "service_type": change.service_type,
                    "previous_threshold": change.previous_threshold,
                    "new_threshold": change.new_threshold,
                    "change_type": change.change_type.value,
                    "status": change.status.value,
                    "requested_by": change.requested_by,
                    "requested_at": change.requested_at.isoformat(),
                    "applied_at": change.applied_at.isoformat() if change.applied_at else None,
                    "rollback_at": change.rollback_at.isoformat() if change.rollback_at else None,
                    "impact_assessment": {
                        "risk_level": change.impact_assessment.risk_level,
                        "confidence_score": change.impact_assessment.confidence_score,
                        "business_impact_score": change.impact_assessment.business_impact_score
                    },
                    "actual_impact": change.actual_impact,
                    "justification": change.justification
                }
                for change in history
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to get threshold change history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get change history")


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint for SLA optimization service."""
    return {
        "status": "healthy",
        "service": "sla-optimization",
        "timestamp": datetime.utcnow().isoformat()
    }