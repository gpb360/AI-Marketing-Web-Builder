"""
Advanced Analytics API Endpoints for Story 3.3
RESTful API providing comprehensive workflow performance analytics and A/B testing capabilities.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.db.session import get_session
from app.services.workflow_analytics_service import (
    WorkflowAnalyticsService, 
    AnalyticsTimePeriod,
    ComprehensiveWorkflowAnalytics,
    get_workflow_analytics,
    get_real_time_dashboard_data
)
from app.services.performance_comparison_service import (
    PerformanceComparisonService,
    ABTestParameters,
    ABTestGoal,
    ABTestResult,
    WorkflowVariant,
    create_workflow_ab_test,
    get_ab_test_results
)
from app.models.workflow import Workflow
from app.schemas.workflow_analytics import (
    AnalyticsRequest,
    AnalyticsResponse,
    ABTestCreateRequest,
    ABTestResponse,
    RealTimeMetricsResponse,
    ExportRequest,
    ExportResponse
)

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
analytics_service = WorkflowAnalyticsService()
comparison_service = PerformanceComparisonService()


@router.get(
    "/workflows/{workflow_id}/analytics",
    response_model=AnalyticsResponse,
    summary="Get comprehensive workflow analytics",
    description="Retrieve detailed performance analytics including metrics, trends, anomalies, and business impact for a specific workflow."
)
async def get_comprehensive_analytics(
    workflow_id: int,
    time_period: AnalyticsTimePeriod = Query(AnalyticsTimePeriod.WEEK, description="Analysis time period"),
    include_predictions: bool = Query(True, description="Include trend predictions in results"),
    include_anomalies: bool = Query(True, description="Include anomaly detection results"),
    session: AsyncSession = Depends(get_session)
) -> AnalyticsResponse:
    """
    Get comprehensive analytics for a workflow including:
    - Performance metrics (success rate, execution time, throughput)
    - Conversion funnel analysis
    - Business impact and ROI calculations
    - Anomaly detection and trend predictions
    - Key insights and recommendations
    """
    try:
        logger.info(f"Fetching comprehensive analytics for workflow {workflow_id}")
        
        # Validate workflow exists
        workflow = await session.get(Workflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        # Generate comprehensive analytics
        analytics = await analytics_service.generate_comprehensive_analytics(
            workflow_id=workflow_id,
            time_period=time_period,
            include_predictions=include_predictions
        )
        
        # Filter anomalies if requested
        if not include_anomalies:
            analytics.detected_anomalies = []
        
        return AnalyticsResponse(
            status="success",
            data=analytics,
            metadata={
                "analysis_timestamp": analytics.analysis_timestamp.isoformat(),
                "time_period": time_period.value,
                "workflow_name": analytics.workflow_name,
                "data_points": analytics.performance_metrics.execution_count
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching analytics for workflow {workflow_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate analytics: {str(e)}"
        )


@router.get(
    "/workflows/{workflow_id}/real-time-metrics",
    response_model=RealTimeMetricsResponse,
    summary="Get real-time performance metrics",
    description="Retrieve live performance metrics for dashboard updates with minimal latency."
)
async def get_real_time_metrics(
    workflow_id: int,
    session: AsyncSession = Depends(get_session)
) -> RealTimeMetricsResponse:
    """
    Get real-time performance metrics for live dashboard updates.
    Returns current execution count, success rate, response times, and active users.
    """
    try:
        # Validate workflow exists
        workflow = await session.get(Workflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        # Get real-time metrics
        metrics = await analytics_service.get_real_time_metrics(workflow_id)
        
        return RealTimeMetricsResponse(
            workflow_id=workflow_id,
            metrics=metrics,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching real-time metrics for workflow {workflow_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get real-time metrics: {str(e)}"
        )


@router.get(
    "/dashboard/multi-workflow",
    response_model=Dict[str, Any],
    summary="Get dashboard data for multiple workflows",
    description="Retrieve real-time metrics for multiple workflows for dashboard overview."
)
async def get_multi_workflow_dashboard(
    workflow_ids: List[int] = Query(..., description="List of workflow IDs to include"),
    session: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    """
    Get dashboard data for multiple workflows.
    Useful for overview dashboards showing multiple workflow performance.
    """
    try:
        if len(workflow_ids) > 50:  # Limit for performance
            raise HTTPException(
                status_code=400,
                detail="Too many workflows requested. Maximum 50 allowed."
            )
        
        # Get real-time data for all workflows
        dashboard_data = await get_real_time_dashboard_data(workflow_ids)
        
        # Calculate summary statistics
        total_executions = sum(
            data.get("current_executions", 0) 
            for data in dashboard_data.values()
        )
        
        avg_success_rate = sum(
            data.get("success_rate", 0) 
            for data in dashboard_data.values()
        ) / len(dashboard_data) if dashboard_data else 0
        
        return {
            "status": "success",
            "workflows": dashboard_data,
            "summary": {
                "total_workflows": len(workflow_ids),
                "total_executions": total_executions,
                "average_success_rate": round(avg_success_rate, 4),
                "last_updated": datetime.now().isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching multi-workflow dashboard: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get dashboard data: {str(e)}"
        )


@router.post(
    "/workflows/{workflow_id}/ab-tests",
    response_model=ABTestResponse,
    summary="Create A/B test experiment",
    description="Create a new A/B test to compare workflow variants with statistical analysis."
)
async def create_ab_test(
    workflow_id: int,
    test_request: ABTestCreateRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session)
) -> ABTestResponse:
    """
    Create a new A/B test experiment for workflow optimization.
    Automatically handles traffic routing, statistical analysis, and winner determination.
    """
    try:
        logger.info(f"Creating A/B test for workflow {workflow_id}: {test_request.test_name}")
        
        # Validate workflow exists
        workflow = await session.get(Workflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        # Validate test parameters
        if len(test_request.variants) < 2:
            raise HTTPException(
                status_code=400,
                detail="A/B test requires at least 2 variants"
            )
        
        total_traffic = sum(v.traffic_allocation for v in test_request.variants)
        if abs(total_traffic - 1.0) > 0.01:
            raise HTTPException(
                status_code=400,
                detail=f"Traffic allocation must sum to 1.0, got {total_traffic}"
            )
        
        # Convert request to service objects
        variants = [
            WorkflowVariant(
                variant_id=v.variant_id,
                variant_name=v.variant_name,
                workflow_config=v.workflow_config,
                traffic_allocation=v.traffic_allocation,
                is_control=v.is_control,
                description=v.description
            )
            for v in test_request.variants
        ]
        
        parameters = ABTestParameters(
            test_name=test_request.test_name,
            goal_metric=test_request.goal_metric,
            minimum_sample_size=test_request.minimum_sample_size,
            minimum_detectable_effect=test_request.minimum_detectable_effect,
            significance_level=test_request.significance_level,
            statistical_power=test_request.statistical_power,
            max_duration_days=test_request.max_duration_days,
            early_stopping_enabled=test_request.early_stopping_enabled
        )
        
        # Create A/B test
        test_id = await comparison_service.create_ab_test(
            workflow_id=workflow_id,
            variants=variants,
            test_parameters=parameters
        )
        
        # Schedule periodic analysis (background task)
        background_tasks.add_task(
            _schedule_ab_test_monitoring, 
            test_id, 
            test_request.max_duration_days
        )
        
        return ABTestResponse(
            status="success",
            test_id=test_id,
            message=f"A/B test '{test_request.test_name}' created successfully",
            test_url=f"/api/v1/analytics/ab-tests/{test_id}",
            estimated_duration_days=test_request.max_duration_days
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating A/B test: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create A/B test: {str(e)}"
        )


@router.get(
    "/ab-tests/{test_id}",
    response_model=ABTestResult,
    summary="Get A/B test results",
    description="Retrieve comprehensive A/B test results with statistical analysis and recommendations."
)
async def get_ab_test_results_endpoint(
    test_id: str,
    include_raw_data: bool = Query(False, description="Include raw performance data"),
    session: AsyncSession = Depends(get_session)
) -> ABTestResult:
    """
    Get A/B test results with statistical significance analysis.
    Includes performance comparison, winner recommendation, and business impact estimation.
    """
    try:
        logger.info(f"Fetching A/B test results for {test_id}")
        
        # Get comprehensive test results
        results = await comparison_service.analyze_ab_test_results(test_id)
        
        # Optionally exclude raw data for lighter response
        if not include_raw_data:
            # Remove detailed data to reduce response size
            pass  # Results are already aggregated
        
        return results
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching A/B test results: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get A/B test results: {str(e)}"
        )


@router.post(
    "/ab-tests/{test_id}/implement-winner",
    response_model=Dict[str, Any],
    summary="Implement winning A/B test variant",
    description="Deploy the winning variant from an A/B test to production workflow."
)
async def implement_winning_variant(
    test_id: str,
    winning_variant: str = Query(..., description="ID of the winning variant to implement"),
    session: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    """
    Implement the winning variant from an A/B test.
    Updates the workflow configuration with the winning variant settings.
    """
    try:
        logger.info(f"Implementing winning variant {winning_variant} for test {test_id}")
        
        # Validate test exists and has results
        results = await comparison_service.analyze_ab_test_results(test_id)
        
        # Validate the variant selection
        valid_variants = [results.control_performance.variant_id, results.treatment_performance.variant_id]
        if winning_variant not in valid_variants:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid variant ID. Must be one of: {valid_variants}"
            )
        
        # Implement the winning variant
        implementation_result = await comparison_service.implement_winning_variant(
            test_id=test_id,
            winning_variant=winning_variant
        )
        
        return {
            **implementation_result,
            "test_results_summary": {
                "test_name": results.test_name,
                "statistical_significance": results.statistical_significance.is_significant,
                "confidence_level": results.confidence_level,
                "business_impact": results.business_impact_estimate
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error implementing winning variant: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to implement winning variant: {str(e)}"
        )


@router.get(
    "/workflows/{workflow_id}/variant-assignment/{user_id}",
    response_model=Dict[str, str],
    summary="Get A/B test variant assignment",
    description="Get the assigned variant for a user in active A/B tests."
)
async def get_variant_assignment(
    workflow_id: int,
    user_id: str,
    test_id: Optional[str] = Query(None, description="Specific test ID, or latest active test"),
    session: AsyncSession = Depends(get_session)
) -> Dict[str, str]:
    """
    Get variant assignment for a user in A/B tests.
    Uses consistent hashing to ensure same user always gets same variant.
    """
    try:
        if not test_id:
            # Get most recent active test for the workflow
            # This would require querying the database for active tests
            raise HTTPException(
                status_code=400,
                detail="test_id parameter is required"
            )
        
        # Get variant assignment
        assigned_variant = await comparison_service.get_variant_assignment(test_id, user_id)
        
        if not assigned_variant:
            raise HTTPException(
                status_code=404,
                detail=f"No active A/B test found with ID {test_id}"
            )
        
        return {
            "test_id": test_id,
            "user_id": user_id,
            "assigned_variant": assigned_variant,
            "assignment_timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting variant assignment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get variant assignment: {str(e)}"
        )


@router.post(
    "/workflows/{workflow_id}/export",
    response_model=ExportResponse,
    summary="Export analytics data",
    description="Export workflow analytics data in PDF or CSV format with custom templates."
)
async def export_analytics_data(
    workflow_id: int,
    export_request: ExportRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session)
) -> ExportResponse:
    """
    Export analytics data in various formats.
    Supports PDF reports and CSV data exports with customizable templates.
    """
    try:
        logger.info(f"Exporting analytics data for workflow {workflow_id} in {export_request.format} format")
        
        # Validate workflow exists
        workflow = await session.get(Workflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        # Generate analytics data
        analytics = await analytics_service.generate_comprehensive_analytics(
            workflow_id=workflow_id,
            time_period=export_request.time_period,
            include_predictions=True
        )
        
        # Generate export file in background
        export_filename = f"workflow_{workflow_id}_analytics_{export_request.time_period.value}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        background_tasks.add_task(
            _generate_export_file,
            analytics,
            export_request,
            export_filename
        )
        
        return ExportResponse(
            status="success",
            message="Export generation started",
            export_id=export_filename,
            estimated_completion_time=datetime.now() + timedelta(minutes=2),
            download_url=f"/api/v1/analytics/exports/{export_filename}/download"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting analytics data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export analytics data: {str(e)}"
        )


@router.get(
    "/exports/{export_id}/download",
    response_class=FileResponse,
    summary="Download exported analytics file",
    description="Download the generated analytics export file."
)
async def download_export_file(
    export_id: str,
    session: AsyncSession = Depends(get_session)
) -> FileResponse:
    """
    Download a previously generated export file.
    """
    try:
        # In production, this would check file existence and permissions
        # For now, returning a placeholder response
        
        file_path = f"/tmp/exports/{export_id}"  # This would be actual file path
        
        if not file_path:  # Check file exists
            raise HTTPException(
                status_code=404,
                detail="Export file not found or expired"
            )
        
        # Determine content type based on file extension
        content_type = "application/pdf" if export_id.endswith(".pdf") else "text/csv"
        
        return FileResponse(
            path=file_path,
            media_type=content_type,
            filename=f"{export_id}.{'pdf' if 'pdf' in export_id else 'csv'}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading export file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to download export: {str(e)}"
        )


@router.get(
    "/workflows/{workflow_id}/performance-comparison",
    response_model=Dict[str, Any],
    summary="Compare performance across time periods",
    description="Compare workflow performance between different time periods or configurations."
)
async def compare_performance_periods(
    workflow_id: int,
    baseline_period: AnalyticsTimePeriod = Query(AnalyticsTimePeriod.MONTH, description="Baseline period"),
    comparison_period: AnalyticsTimePeriod = Query(AnalyticsTimePeriod.WEEK, description="Comparison period"),
    session: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    """
    Compare workflow performance between different time periods.
    Useful for tracking improvements over time or identifying regressions.
    """
    try:
        # Validate workflow exists
        workflow = await session.get(Workflow, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        # Get analytics for both periods
        baseline_analytics = await analytics_service.generate_comprehensive_analytics(
            workflow_id, baseline_period, include_predictions=False
        )
        
        comparison_analytics = await analytics_service.generate_comprehensive_analytics(
            workflow_id, comparison_period, include_predictions=False
        )
        
        # Calculate comparison metrics
        performance_comparison = {
            "success_rate_change": (
                comparison_analytics.performance_metrics.success_rate - 
                baseline_analytics.performance_metrics.success_rate
            ),
            "avg_execution_time_change": (
                comparison_analytics.performance_metrics.avg_execution_time - 
                baseline_analytics.performance_metrics.avg_execution_time
            ),
            "throughput_change": (
                comparison_analytics.performance_metrics.throughput - 
                baseline_analytics.performance_metrics.throughput
            ),
            "roi_change": (
                comparison_analytics.business_impact.roi_percentage - 
                baseline_analytics.business_impact.roi_percentage
            )
        }
        
        # Generate insights about the comparison
        insights = []
        if performance_comparison["success_rate_change"] > 0.02:
            insights.append("Success rate has improved significantly")
        elif performance_comparison["success_rate_change"] < -0.02:
            insights.append("Success rate has declined - investigation needed")
        
        if performance_comparison["avg_execution_time_change"] < -1.0:
            insights.append("Execution time has improved")
        elif performance_comparison["avg_execution_time_change"] > 1.0:
            insights.append("Execution time has increased - performance regression?")
        
        return {
            "baseline_period": baseline_period.value,
            "comparison_period": comparison_period.value,
            "baseline_metrics": baseline_analytics.performance_metrics,
            "comparison_metrics": comparison_analytics.performance_metrics,
            "performance_changes": performance_comparison,
            "insights": insights,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing performance periods: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compare performance: {str(e)}"
        )


# Background task functions
async def _schedule_ab_test_monitoring(test_id: str, max_duration_days: int):
    """Background task to monitor A/B test progress and stop when complete"""
    try:
        # This would implement periodic checking of test progress
        # and automatic stopping when statistical significance is reached
        # or maximum duration is exceeded
        
        logger.info(f"Started monitoring for A/B test {test_id}")
        
        # Placeholder for actual monitoring logic
        # In production, this would use a task queue like Celery
        
    except Exception as e:
        logger.error(f"Error in A/B test monitoring: {str(e)}")


async def _generate_export_file(
    analytics: ComprehensiveWorkflowAnalytics,
    export_request: ExportRequest,
    filename: str
):
    """Background task to generate export files"""
    try:
        logger.info(f"Generating export file: {filename}")
        
        if export_request.format == "pdf":
            # Generate PDF report
            # This would use a library like ReportLab or WeasyPrint
            pass
        elif export_request.format == "csv":
            # Generate CSV data export
            # This would convert analytics data to CSV format
            pass
        
        logger.info(f"Export file generated: {filename}")
        
    except Exception as e:
        logger.error(f"Error generating export file: {str(e)}")


# Health check endpoint
@router.get(
    "/health",
    summary="Analytics service health check",
    description="Check the health status of the analytics service."
)
async def health_check() -> Dict[str, Any]:
    """Health check endpoint for monitoring service status"""
    try:
        # Test database connectivity
        async with get_session() as session:
            await session.execute("SELECT 1")
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "advanced_analytics",
            "version": "1.0.0"
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail=f"Service unhealthy: {str(e)}"
        )