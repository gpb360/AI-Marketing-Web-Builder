"""
Analytics API endpoints for Story 3.3
Comprehensive workflow performance analytics dashboard API.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import io
import csv
import json
import logging

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsFilter, DateRangeFilter, MetricRequest,
    WorkflowPerformanceOverview, DetailedWorkflowMetrics,
    ConversionFunnelAnalysis, ROIAnalysis, ABTestCreate, ABTestResult,
    ReportExportRequest, ScheduledReportCreate, ScheduledReportResponse,
    RealTimeMetrics, AnomalyDetection, PerformanceAlert,
    ExternalIntegrationCreate, ExternalIntegrationStatus,
    CustomDashboard, DashboardResponse, AnalyticsResponse
)
from app.services.workflow_analytics_service import WorkflowAnalyticsService
from app.services.ab_testing_service import ABTestingService
from app.services.report_generation_service import ReportGenerationService
from app.services.anomaly_detection_service import AnomalyDetectionService
from app.services.external_integration_service import ExternalIntegrationService

logger = logging.getLogger(__name__)
router = APIRouter()


# === Performance Dashboard Endpoints ===

@router.get("/workflows/overview", response_model=List[WorkflowPerformanceOverview])
async def get_workflows_performance_overview(
    workflow_ids: Optional[List[str]] = Query(None),
    start_date: datetime = Query(..., description="Start date for analytics"),
    end_date: datetime = Query(..., description="End date for analytics"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get performance overview for multiple workflows.
    Provides high-level metrics for dashboard display.
    """
    try:
        analytics_service = WorkflowAnalyticsService(db)
        
        # Create filter
        date_filter = DateRangeFilter(start_date=start_date, end_date=end_date)
        filters = AnalyticsFilter(
            workflow_ids=workflow_ids,
            user_ids=[current_user.id],
            date_range=date_filter
        )
        
        # Get user's workflows if none specified
        if not workflow_ids:
            workflow_ids = await analytics_service.get_user_workflow_ids(current_user.id)
        
        overview = await analytics_service.get_workflow_performance_overview(
            workflow_ids, filters
        )
        
        return overview
        
    except Exception as e:
        logger.error(f"Failed to get workflow overview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve workflow performance overview"
        )


@router.get("/workflows/{workflow_id}/detailed", response_model=DetailedWorkflowMetrics)
async def get_detailed_workflow_metrics(
    workflow_id: str,
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    include_time_series: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get comprehensive metrics for a single workflow.
    Includes execution, performance, business, and cost metrics.
    """
    try:
        analytics_service = WorkflowAnalyticsService(db)
        
        # Verify user has access to this workflow
        await analytics_service.verify_workflow_access(workflow_id, current_user.id)
        
        date_filter = DateRangeFilter(start_date=start_date, end_date=end_date)
        filters = AnalyticsFilter(
            workflow_ids=[workflow_id],
            user_ids=[current_user.id],
            date_range=date_filter
        )
        
        detailed_metrics = await analytics_service.get_detailed_workflow_metrics(
            workflow_id, filters
        )
        
        return detailed_metrics
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get detailed metrics for workflow {workflow_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve detailed workflow metrics"
        )


@router.get("/workflows/{workflow_id}/funnel", response_model=ConversionFunnelAnalysis)
async def analyze_conversion_funnel(
    workflow_id: str,
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Analyze conversion funnel for a workflow.
    Shows step-by-step conversion rates and drop-off points.
    """
    try:
        analytics_service = WorkflowAnalyticsService(db)
        
        await analytics_service.verify_workflow_access(workflow_id, current_user.id)
        
        date_filter = DateRangeFilter(start_date=start_date, end_date=end_date)
        filters = AnalyticsFilter(
            workflow_ids=[workflow_id],
            date_range=date_filter
        )
        
        funnel_analysis = await analytics_service.analyze_conversion_funnel(
            workflow_id, filters
        )
        
        return funnel_analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to analyze conversion funnel: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze conversion funnel"
        )


@router.get("/workflows/{workflow_id}/roi", response_model=ROIAnalysis)
async def calculate_workflow_roi(
    workflow_id: str,
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Calculate comprehensive ROI analysis for a workflow.
    Includes cost breakdown, time savings, and automation value.
    """
    try:
        analytics_service = WorkflowAnalyticsService(db)
        
        await analytics_service.verify_workflow_access(workflow_id, current_user.id)
        
        date_filter = DateRangeFilter(start_date=start_date, end_date=end_date)
        filters = AnalyticsFilter(
            workflow_ids=[workflow_id],
            date_range=date_filter
        )
        
        roi_analysis = await analytics_service.calculate_roi_analysis(
            workflow_id, filters
        )
        
        return roi_analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to calculate ROI analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate ROI analysis"
        )


# === A/B Testing Endpoints ===

@router.post("/ab-tests", response_model=AnalyticsResponse)
async def create_ab_test(
    test_config: ABTestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new A/B test for workflow comparison.
    """
    try:
        ab_testing_service = ABTestingService(db)
        
        # Verify user has access to both workflows
        await ab_testing_service.verify_workflows_access(
            [test_config.control_workflow_id, test_config.variant_workflow_id],
            current_user.id
        )
        
        test_id = await ab_testing_service.create_ab_test(test_config, current_user.id)
        
        return AnalyticsResponse(
            data={"test_id": test_id, "status": "created"},
            metadata={"test_name": test_config.name}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create A/B test: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create A/B test"
        )


@router.get("/ab-tests/{test_id}/results", response_model=ABTestResult)
async def get_ab_test_results(
    test_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get A/B test results with statistical analysis.
    """
    try:
        ab_testing_service = ABTestingService(db)
        
        test_results = await ab_testing_service.get_test_results(test_id, current_user.id)
        
        return test_results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get A/B test results: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve A/B test results"
        )


@router.post("/ab-tests/{test_id}/stop")
async def stop_ab_test(
    test_id: str,
    declare_winner: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Stop an active A/B test and optionally declare a winner.
    """
    try:
        ab_testing_service = ABTestingService(db)
        
        result = await ab_testing_service.stop_test(
            test_id, current_user.id, declare_winner
        )
        
        return AnalyticsResponse(data=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to stop A/B test: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to stop A/B test"
        )


# === Report Generation Endpoints ===

@router.post("/reports/export")
async def export_analytics_report(
    export_request: ReportExportRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Export analytics report in PDF or CSV format.
    """
    try:
        report_service = ReportGenerationService(db)
        
        if export_request.format == "csv":
            # Generate CSV immediately for smaller files
            csv_data = await report_service.generate_csv_report(
                export_request, current_user.id
            )
            
            output = io.StringIO()
            writer = csv.writer(output)
            for row in csv_data:
                writer.writerow(row)
            
            csv_content = output.getvalue()
            output.close()
            
            return StreamingResponse(
                io.BytesIO(csv_content.encode()),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=analytics_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
                }
            )
            
        else:
            # PDF generation - run in background and return job ID
            job_id = await report_service.generate_pdf_report_async(
                export_request, current_user.id, background_tasks
            )
            
            return AnalyticsResponse(
                data={
                    "job_id": job_id,
                    "status": "processing",
                    "estimated_completion": "2-5 minutes"
                }
            )
        
    except Exception as e:
        logger.error(f"Failed to export report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate analytics report"
        )


@router.post("/reports/schedule", response_model=ScheduledReportResponse)
async def create_scheduled_report(
    report_config: ScheduledReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a scheduled analytics report.
    """
    try:
        report_service = ReportGenerationService(db)
        
        scheduled_report = await report_service.create_scheduled_report(
            report_config, current_user.id
        )
        
        return scheduled_report
        
    except Exception as e:
        logger.error(f"Failed to create scheduled report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create scheduled report"
        )


@router.get("/reports/scheduled", response_model=List[ScheduledReportResponse])
async def get_scheduled_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all scheduled reports for the current user.
    """
    try:
        report_service = ReportGenerationService(db)
        
        reports = await report_service.get_user_scheduled_reports(current_user.id)
        
        return reports
        
    except Exception as e:
        logger.error(f"Failed to get scheduled reports: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve scheduled reports"
        )


# === Real-time Monitoring Endpoints ===

@router.get("/real-time/metrics", response_model=RealTimeMetrics)
async def get_real_time_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get real-time performance metrics for dashboard.
    """
    try:
        analytics_service = WorkflowAnalyticsService(db)
        
        real_time_metrics = await analytics_service.get_real_time_metrics(current_user.id)
        
        return real_time_metrics
        
    except Exception as e:
        logger.error(f"Failed to get real-time metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve real-time metrics"
        )


@router.get("/real-time/anomalies", response_model=List[AnomalyDetection])
async def detect_anomalies(
    workflow_id: Optional[str] = Query(None),
    hours_back: int = Query(24, ge=1, le=168),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Detect performance anomalies in workflows.
    """
    try:
        anomaly_service = AnomalyDetectionService(db)
        
        anomalies = await anomaly_service.detect_workflow_anomalies(
            current_user.id, workflow_id, hours_back
        )
        
        return anomalies
        
    except Exception as e:
        logger.error(f"Failed to detect anomalies: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to detect anomalies"
        )


@router.get("/real-time/alerts", response_model=List[PerformanceAlert])
async def get_performance_alerts(
    unacknowledged_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get performance alerts for user's workflows.
    """
    try:
        analytics_service = WorkflowAnalyticsService(db)
        
        alerts = await analytics_service.get_performance_alerts(
            current_user.id, unacknowledged_only
        )
        
        return alerts
        
    except Exception as e:
        logger.error(f"Failed to get performance alerts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve performance alerts"
        )


@router.post("/real-time/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Acknowledge a performance alert.
    """
    try:
        analytics_service = WorkflowAnalyticsService(db)
        
        await analytics_service.acknowledge_alert(alert_id, current_user.id)
        
        return AnalyticsResponse(data={"status": "acknowledged"})
        
    except Exception as e:
        logger.error(f"Failed to acknowledge alert: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to acknowledge alert"
        )


# === External Integration Endpoints ===

@router.post("/integrations", response_model=AnalyticsResponse)
async def create_external_integration(
    integration_config: ExternalIntegrationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create external analytics platform integration.
    """
    try:
        integration_service = ExternalIntegrationService(db)
        
        integration_id = await integration_service.create_integration(
            integration_config, current_user.id
        )
        
        return AnalyticsResponse(
            data={"integration_id": integration_id, "status": "created"}
        )
        
    except Exception as e:
        logger.error(f"Failed to create external integration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create external integration"
        )


@router.get("/integrations", response_model=List[ExternalIntegrationStatus])
async def get_external_integrations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all external integrations for the current user.
    """
    try:
        integration_service = ExternalIntegrationService(db)
        
        integrations = await integration_service.get_user_integrations(current_user.id)
        
        return integrations
        
    except Exception as e:
        logger.error(f"Failed to get external integrations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve external integrations"
        )


@router.post("/integrations/{integration_id}/sync")
async def trigger_integration_sync(
    integration_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Trigger manual sync with external analytics platform.
    """
    try:
        integration_service = ExternalIntegrationService(db)
        
        # Start sync in background
        background_tasks.add_task(
            integration_service.sync_integration,
            integration_id,
            current_user.id
        )
        
        return AnalyticsResponse(
            data={"status": "sync_started", "integration_id": integration_id}
        )
        
    except Exception as e:
        logger.error(f"Failed to trigger integration sync: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to trigger integration sync"
        )


# === Custom Dashboard Endpoints ===

@router.post("/dashboards", response_model=AnalyticsResponse)
async def create_custom_dashboard(
    dashboard_config: CustomDashboard,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a custom analytics dashboard.
    """
    try:
        analytics_service = WorkflowAnalyticsService(db)
        
        dashboard_id = await analytics_service.create_custom_dashboard(
            dashboard_config, current_user.id
        )
        
        return AnalyticsResponse(
            data={"dashboard_id": dashboard_id, "status": "created"}
        )
        
    except Exception as e:
        logger.error(f"Failed to create custom dashboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create custom dashboard"
        )


@router.get("/dashboards/{dashboard_id}", response_model=DashboardResponse)
async def get_dashboard_data(
    dashboard_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get custom dashboard data.
    """
    try:
        analytics_service = WorkflowAnalyticsService(db)
        
        dashboard_data = await analytics_service.get_dashboard_data(
            dashboard_id, current_user.id
        )
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Failed to get dashboard data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dashboard data"
        )