"""
Workflow Analytics Service for Story 3.3
Comprehensive analytics data collection, processing, and insights generation.
"""

import asyncio
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload
import logging
import numpy as np
from statistics import median
import json

from app.models.analytics import (
    WorkflowAnalyticsEvent, WorkflowPerformanceMetrics, WorkflowABTest,
    WorkflowCostAnalysis, AnalyticsReport, AnalyticsEventType, MetricAggregationType
)
from app.models.workflow import Workflow, WorkflowExecutionStatus
from app.schemas.analytics import (
    AnalyticsFilter, DetailedWorkflowMetrics, ConversionFunnelAnalysis,
    ROIAnalysis, ABTestResult, AnomalyDetection, RealTimeMetrics
)

logger = logging.getLogger(__name__)


class WorkflowAnalyticsService:
    """
    Core analytics service for workflow performance tracking and analysis.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def track_event(
        self,
        workflow_id: str,
        event_type: AnalyticsEventType,
        event_data: Dict[str, Any],
        execution_id: Optional[str] = None,
        execution_time_ms: Optional[int] = None,
        conversion_value: Optional[Decimal] = None,
        revenue_impact: Optional[Decimal] = None,
        component_id: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> None:
        """Track analytics event for workflow performance."""
        try:
            event = WorkflowAnalyticsEvent(
                workflow_id=workflow_id,
                execution_id=execution_id,
                user_id=user_id,
                event_type=event_type,
                event_data=event_data,
                execution_time_ms=execution_time_ms,
                conversion_value=conversion_value,
                revenue_impact=revenue_impact,
                component_id=component_id
            )
            
            self.db.add(event)
            await self.db.commit()
            
            # Trigger async metrics aggregation
            await self._trigger_metrics_update(workflow_id)
            
        except Exception as e:
            logger.error(f"Failed to track analytics event: {e}")
            await self.db.rollback()
            raise
    
    async def get_workflow_performance_overview(
        self,
        workflow_ids: List[str],
        filters: AnalyticsFilter
    ) -> List[Dict[str, Any]]:
        """Get performance overview for multiple workflows."""
        
        # Build base query
        query = select(WorkflowPerformanceMetrics).where(
            and_(
                WorkflowPerformanceMetrics.workflow_id.in_(workflow_ids),
                WorkflowPerformanceMetrics.period_start >= filters.date_range.start_date,
                WorkflowPerformanceMetrics.period_end <= filters.date_range.end_date
            )
        ).options(selectinload(WorkflowPerformanceMetrics.workflow))
        
        result = await self.db.execute(query)
        metrics = result.scalars().all()
        
        overview = []
        for metric in metrics:
            workflow_data = {
                "workflow_id": metric.workflow_id,
                "workflow_name": metric.workflow.name if metric.workflow else "Unknown",
                "total_executions": metric.total_executions,
                "success_rate": metric.success_rate,
                "avg_execution_time_ms": metric.avg_execution_time_ms,
                "conversion_rate": metric.conversion_rate,
                "total_revenue": float(metric.total_revenue),
                "roi_percentage": metric.roi_percentage,
                "unique_users": metric.unique_users_engaged,
                "engagement_score": metric.engagement_score,
                
                # Get trend data
                "execution_trend": await self._get_execution_trend(
                    metric.workflow_id, filters.date_range
                ),
                "performance_trend": await self._get_performance_trend(
                    metric.workflow_id, filters.date_range
                )
            }
            overview.append(workflow_data)
        
        return overview
    
    async def get_detailed_workflow_metrics(
        self,
        workflow_id: str,
        filters: AnalyticsFilter
    ) -> DetailedWorkflowMetrics:
        """Get comprehensive metrics for a single workflow."""
        
        # Get base metrics
        metrics_query = select(WorkflowPerformanceMetrics).where(
            and_(
                WorkflowPerformanceMetrics.workflow_id == workflow_id,
                WorkflowPerformanceMetrics.period_start >= filters.date_range.start_date,
                WorkflowPerformanceMetrics.period_end <= filters.date_range.end_date
            )
        )
        
        result = await self.db.execute(metrics_query)
        base_metrics = result.scalar_one_or_none()
        
        if not base_metrics:
            # Generate metrics if they don't exist
            await self._generate_workflow_metrics(workflow_id, filters.date_range)
            result = await self.db.execute(metrics_query)
            base_metrics = result.scalar_one_or_none()
        
        # Build detailed response
        detailed_metrics = DetailedWorkflowMetrics(
            workflow_id=workflow_id,
            period_start=filters.date_range.start_date,
            period_end=filters.date_range.end_date,
            
            execution_metrics={
                "total_executions": base_metrics.total_executions,
                "successful_executions": base_metrics.successful_executions,
                "failed_executions": base_metrics.failed_executions,
                "success_rate": base_metrics.success_rate,
                "failure_rate": 1.0 - base_metrics.success_rate,
                "avg_executions_per_day": await self._calculate_avg_executions_per_day(
                    workflow_id, filters.date_range
                )
            },
            
            performance_metrics={
                "avg_execution_time_ms": base_metrics.avg_execution_time_ms,
                "median_execution_time_ms": base_metrics.median_execution_time_ms,
                "p95_execution_time_ms": base_metrics.p95_execution_time_ms,
                "performance_score": await self._calculate_performance_score(workflow_id),
                "reliability_score": base_metrics.success_rate
            },
            
            business_metrics={
                "total_conversions": base_metrics.total_conversions,
                "conversion_rate": base_metrics.conversion_rate,
                "total_revenue": float(base_metrics.total_revenue),
                "avg_revenue_per_execution": float(base_metrics.avg_revenue_per_execution),
                "customer_lifetime_value": await self._calculate_clv(workflow_id),
                "engagement_metrics": {
                    "unique_users_engaged": base_metrics.unique_users_engaged,
                    "total_interactions": base_metrics.total_interactions,
                    "engagement_score": base_metrics.engagement_score
                }
            },
            
            cost_metrics={
                "total_execution_cost": float(base_metrics.total_execution_cost),
                "cost_per_execution": float(base_metrics.cost_per_execution),
                "roi_percentage": base_metrics.roi_percentage,
                "cost_breakdown": await self._get_cost_breakdown(workflow_id, filters.date_range),
                "time_savings": await self._calculate_time_savings(workflow_id, filters.date_range)
            },
            
            time_series_data=await self._get_time_series_data(workflow_id, filters.date_range)
        )
        
        return detailed_metrics
    
    async def analyze_conversion_funnel(
        self,
        workflow_id: str,
        filters: AnalyticsFilter
    ) -> ConversionFunnelAnalysis:
        """Analyze conversion funnel for workflow."""
        
        # Define funnel steps based on event types
        funnel_steps = [
            {"step": "workflow_triggered", "event_type": AnalyticsEventType.WORKFLOW_EXECUTION},
            {"step": "workflow_completed", "event_type": AnalyticsEventType.WORKFLOW_SUCCESS},
            {"step": "email_sent", "event_type": AnalyticsEventType.EMAIL_SENT},
            {"step": "email_opened", "event_type": AnalyticsEventType.EMAIL_OPENED},
            {"step": "email_clicked", "event_type": AnalyticsEventType.EMAIL_CLICKED},
            {"step": "conversion", "event_type": AnalyticsEventType.CONVERSION}
        ]
        
        funnel_data = []
        conversion_rates = []
        
        previous_count = None
        
        for step in funnel_steps:
            # Count events for this step
            count_query = select(func.count(WorkflowAnalyticsEvent.id)).where(
                and_(
                    WorkflowAnalyticsEvent.workflow_id == workflow_id,
                    WorkflowAnalyticsEvent.event_type == step["event_type"],
                    WorkflowAnalyticsEvent.created_at >= filters.date_range.start_date,
                    WorkflowAnalyticsEvent.created_at <= filters.date_range.end_date
                )
            )
            
            result = await self.db.execute(count_query)
            count = result.scalar() or 0
            
            # Calculate conversion rate from previous step
            if previous_count is not None and previous_count > 0:
                conversion_rate = (count / previous_count) * 100
            else:
                conversion_rate = 100.0 if count > 0 else 0.0
            
            funnel_data.append({
                "step": step["step"],
                "count": count,
                "conversion_rate": conversion_rate
            })
            
            conversion_rates.append(conversion_rate)
            previous_count = count
        
        # Identify drop-off points
        drop_off_points = []
        for i in range(1, len(conversion_rates)):
            if conversion_rates[i] < 50:  # Significant drop-off threshold
                drop_off_points.append({
                    "from_step": funnel_steps[i-1]["step"],
                    "to_step": funnel_steps[i]["step"],
                    "drop_off_rate": 100 - conversion_rates[i],
                    "impact": "high" if conversion_rates[i] < 25 else "medium"
                })
        
        # Generate optimization suggestions
        suggestions = await self._generate_funnel_optimization_suggestions(
            workflow_id, funnel_data, drop_off_points
        )
        
        return ConversionFunnelAnalysis(
            funnel_steps=funnel_data,
            conversion_rates=conversion_rates,
            drop_off_points=drop_off_points,
            optimization_suggestions=suggestions
        )
    
    async def calculate_roi_analysis(
        self,
        workflow_id: str,
        filters: AnalyticsFilter
    ) -> ROIAnalysis:
        """Calculate comprehensive ROI analysis."""
        
        # Get cost data
        cost_query = select(
            func.sum(WorkflowCostAnalysis.compute_cost),
            func.sum(WorkflowCostAnalysis.storage_cost),
            func.sum(WorkflowCostAnalysis.network_cost),
            func.sum(WorkflowCostAnalysis.email_cost),
            func.sum(WorkflowCostAnalysis.external_api_cost),
            func.sum(WorkflowCostAnalysis.manual_time_saved_minutes),
            func.sum(WorkflowCostAnalysis.automation_value)
        ).where(
            and_(
                WorkflowCostAnalysis.workflow_id == workflow_id,
                WorkflowCostAnalysis.created_at >= filters.date_range.start_date,
                WorkflowCostAnalysis.created_at <= filters.date_range.end_date
            )
        )
        
        cost_result = await self.db.execute(cost_query)
        cost_data = cost_result.first()
        
        # Get revenue data
        revenue_query = select(
            func.sum(WorkflowAnalyticsEvent.revenue_impact)
        ).where(
            and_(
                WorkflowAnalyticsEvent.workflow_id == workflow_id,
                WorkflowAnalyticsEvent.event_type == AnalyticsEventType.REVENUE_GENERATED,
                WorkflowAnalyticsEvent.created_at >= filters.date_range.start_date,
                WorkflowAnalyticsEvent.created_at <= filters.date_range.end_date
            )
        )
        
        revenue_result = await self.db.execute(revenue_query)
        total_revenue = revenue_result.scalar() or Decimal('0.00')
        
        # Calculate costs
        compute_cost = cost_data[0] or Decimal('0.00')
        storage_cost = cost_data[1] or Decimal('0.00')
        network_cost = cost_data[2] or Decimal('0.00')
        email_cost = cost_data[3] or Decimal('0.00')
        api_cost = cost_data[4] or Decimal('0.00')
        
        total_cost = compute_cost + storage_cost + network_cost + email_cost + api_cost
        
        # Time savings
        time_saved_minutes = cost_data[5] or 0
        time_savings_hours = time_saved_minutes / 60
        automation_value = cost_data[6] or Decimal('0.00')
        
        # Calculate ROI
        if total_cost > 0:
            roi_percentage = float(((total_revenue - total_cost) / total_cost) * 100)
            payback_period_days = int((total_cost / (total_revenue / 30)) if total_revenue > 0 else None)
        else:
            roi_percentage = float('inf') if total_revenue > 0 else 0.0
            payback_period_days = 0 if total_revenue > 0 else None
        
        return ROIAnalysis(
            total_cost=total_cost,
            total_revenue=total_revenue,
            roi_percentage=roi_percentage,
            cost_breakdown={
                "compute": float(compute_cost),
                "storage": float(storage_cost),
                "network": float(network_cost),
                "email": float(email_cost),
                "external_api": float(api_cost)
            },
            time_savings_hours=time_savings_hours,
            automation_value=automation_value,
            payback_period_days=payback_period_days
        )
    
    # === Private Helper Methods ===
    
    async def _trigger_metrics_update(self, workflow_id: str) -> None:
        """Trigger asynchronous metrics aggregation."""
        # This would typically be sent to a background job queue
        # For now, we'll update metrics directly with a short delay
        asyncio.create_task(self._delayed_metrics_update(workflow_id))
    
    async def _delayed_metrics_update(self, workflow_id: str) -> None:
        """Update metrics with a delay to batch updates."""
        await asyncio.sleep(5)  # Wait 5 seconds to batch updates
        await self._update_workflow_metrics(workflow_id)
    
    async def _update_workflow_metrics(self, workflow_id: str) -> None:
        """Update aggregated metrics for a workflow."""
        try:
            # Calculate metrics for the last 30 days
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            
            # Get execution stats
            execution_stats = await self._calculate_execution_stats(
                workflow_id, start_date, end_date
            )
            
            # Get business metrics
            business_stats = await self._calculate_business_stats(
                workflow_id, start_date, end_date
            )
            
            # Get cost metrics
            cost_stats = await self._calculate_cost_stats(
                workflow_id, start_date, end_date
            )
            
            # Update or create metrics record
            existing_query = select(WorkflowPerformanceMetrics).where(
                WorkflowPerformanceMetrics.workflow_id == workflow_id
            )
            result = await self.db.execute(existing_query)
            existing_metrics = result.scalar_one_or_none()
            
            if existing_metrics:
                # Update existing record
                existing_metrics.period_start = start_date
                existing_metrics.period_end = end_date
                existing_metrics.total_executions = execution_stats["total"]
                existing_metrics.successful_executions = execution_stats["successful"]
                existing_metrics.failed_executions = execution_stats["failed"]
                existing_metrics.success_rate = execution_stats["success_rate"]
                existing_metrics.avg_execution_time_ms = execution_stats["avg_time"]
                existing_metrics.median_execution_time_ms = execution_stats["median_time"]
                existing_metrics.p95_execution_time_ms = execution_stats["p95_time"]
                
                # Business metrics
                existing_metrics.total_conversions = business_stats["conversions"]
                existing_metrics.conversion_rate = business_stats["conversion_rate"]
                existing_metrics.total_revenue = business_stats["revenue"]
                existing_metrics.avg_revenue_per_execution = business_stats["avg_revenue"]
                existing_metrics.unique_users_engaged = business_stats["unique_users"]
                existing_metrics.total_interactions = business_stats["interactions"]
                existing_metrics.engagement_score = business_stats["engagement_score"]
                
                # Cost metrics
                existing_metrics.total_execution_cost = cost_stats["total_cost"]
                existing_metrics.cost_per_execution = cost_stats["cost_per_execution"]
                existing_metrics.roi_percentage = cost_stats["roi"]
                
            else:
                # Create new record
                new_metrics = WorkflowPerformanceMetrics(
                    workflow_id=workflow_id,
                    user_id="system",  # TODO: Get from workflow
                    period_start=start_date,
                    period_end=end_date,
                    **execution_stats,
                    **business_stats,
                    **cost_stats
                )
                self.db.add(new_metrics)
            
            await self.db.commit()
            
        except Exception as e:
            logger.error(f"Failed to update workflow metrics: {e}")
            await self.db.rollback()
    
    async def _calculate_execution_stats(
        self, workflow_id: str, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Calculate execution statistics."""
        
        # Get execution counts
        execution_query = select(
            func.count(WorkflowAnalyticsEvent.id).label("total"),
            func.sum(
                func.case(
                    (WorkflowAnalyticsEvent.event_type == AnalyticsEventType.WORKFLOW_SUCCESS, 1),
                    else_=0
                )
            ).label("successful"),
            func.sum(
                func.case(
                    (WorkflowAnalyticsEvent.event_type == AnalyticsEventType.WORKFLOW_FAILURE, 1),
                    else_=0
                )
            ).label("failed"),
            func.avg(WorkflowAnalyticsEvent.execution_time_ms).label("avg_time")
        ).where(
            and_(
                WorkflowAnalyticsEvent.workflow_id == workflow_id,
                WorkflowAnalyticsEvent.event_type.in_([
                    AnalyticsEventType.WORKFLOW_EXECUTION,
                    AnalyticsEventType.WORKFLOW_SUCCESS,
                    AnalyticsEventType.WORKFLOW_FAILURE
                ]),
                WorkflowAnalyticsEvent.created_at >= start_date,
                WorkflowAnalyticsEvent.created_at <= end_date
            )
        )
        
        result = await self.db.execute(execution_query)
        stats = result.first()
        
        total = stats.total or 0
        successful = stats.successful or 0
        failed = stats.failed or 0
        avg_time = stats.avg_time or 0.0
        
        # Calculate percentiles for execution time
        time_query = select(WorkflowAnalyticsEvent.execution_time_ms).where(
            and_(
                WorkflowAnalyticsEvent.workflow_id == workflow_id,
                WorkflowAnalyticsEvent.execution_time_ms.isnot(None),
                WorkflowAnalyticsEvent.created_at >= start_date,
                WorkflowAnalyticsEvent.created_at <= end_date
            )
        )
        
        time_result = await self.db.execute(time_query)
        execution_times = [row[0] for row in time_result.fetchall() if row[0] is not None]
        
        if execution_times:
            median_time = median(execution_times)
            p95_time = np.percentile(execution_times, 95)
        else:
            median_time = 0.0
            p95_time = 0.0
        
        return {
            "total_executions": total,
            "successful_executions": successful,
            "failed_executions": failed,
            "success_rate": successful / total if total > 0 else 0.0,
            "avg_execution_time_ms": avg_time,
            "median_execution_time_ms": median_time,
            "p95_execution_time_ms": p95_time
        }
    
    async def _calculate_business_stats(
        self, workflow_id: str, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Calculate business metrics."""
        
        # Get conversion and revenue stats
        business_query = select(
            func.count(
                func.case(
                    (WorkflowAnalyticsEvent.event_type == AnalyticsEventType.CONVERSION, 1),
                    else_=None
                )
            ).label("conversions"),
            func.sum(WorkflowAnalyticsEvent.revenue_impact).label("revenue"),
            func.count(func.distinct(WorkflowAnalyticsEvent.user_id)).label("unique_users"),
            func.count(WorkflowAnalyticsEvent.id).label("total_interactions")
        ).where(
            and_(
                WorkflowAnalyticsEvent.workflow_id == workflow_id,
                WorkflowAnalyticsEvent.created_at >= start_date,
                WorkflowAnalyticsEvent.created_at <= end_date
            )
        )
        
        result = await self.db.execute(business_query)
        stats = result.first()
        
        conversions = stats.conversions or 0
        revenue = stats.revenue or Decimal('0.00')
        unique_users = stats.unique_users or 0
        interactions = stats.total_interactions or 0
        
        # Calculate derived metrics
        total_executions = await self._get_total_executions(workflow_id, start_date, end_date)
        conversion_rate = conversions / total_executions if total_executions > 0 else 0.0
        avg_revenue = revenue / total_executions if total_executions > 0 else Decimal('0.00')
        engagement_score = min((interactions / unique_users) * 10, 100) if unique_users > 0 else 0.0
        
        return {
            "total_conversions": conversions,
            "conversion_rate": conversion_rate,
            "total_revenue": revenue,
            "avg_revenue_per_execution": avg_revenue,
            "unique_users_engaged": unique_users,
            "total_interactions": interactions,
            "engagement_score": engagement_score
        }
    
    async def _calculate_cost_stats(
        self, workflow_id: str, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Calculate cost and ROI metrics."""
        
        # Get cost data
        cost_query = select(
            func.sum(WorkflowCostAnalysis.compute_cost + 
                    WorkflowCostAnalysis.storage_cost + 
                    WorkflowCostAnalysis.network_cost + 
                    WorkflowCostAnalysis.email_cost + 
                    WorkflowCostAnalysis.external_api_cost).label("total_cost")
        ).where(
            and_(
                WorkflowCostAnalysis.workflow_id == workflow_id,
                WorkflowCostAnalysis.created_at >= start_date,
                WorkflowCostAnalysis.created_at <= end_date
            )
        )
        
        cost_result = await self.db.execute(cost_query)
        total_cost = cost_result.scalar() or Decimal('0.00')
        
        # Get revenue for ROI calculation
        revenue_query = select(
            func.sum(WorkflowAnalyticsEvent.revenue_impact)
        ).where(
            and_(
                WorkflowAnalyticsEvent.workflow_id == workflow_id,
                WorkflowAnalyticsEvent.created_at >= start_date,
                WorkflowAnalyticsEvent.created_at <= end_date
            )
        )
        
        revenue_result = await self.db.execute(revenue_query)
        total_revenue = revenue_result.scalar() or Decimal('0.00')
        
        # Calculate metrics
        total_executions = await self._get_total_executions(workflow_id, start_date, end_date)
        cost_per_execution = total_cost / total_executions if total_executions > 0 else Decimal('0.00')
        
        if total_cost > 0:
            roi_percentage = float(((total_revenue - total_cost) / total_cost) * 100)
        else:
            roi_percentage = float('inf') if total_revenue > 0 else 0.0
        
        return {
            "total_execution_cost": total_cost,
            "cost_per_execution": cost_per_execution,
            "roi_percentage": roi_percentage
        }
    
    async def _get_total_executions(
        self, workflow_id: str, start_date: datetime, end_date: datetime
    ) -> int:
        """Get total executions count."""
        query = select(func.count(WorkflowAnalyticsEvent.id)).where(
            and_(
                WorkflowAnalyticsEvent.workflow_id == workflow_id,
                WorkflowAnalyticsEvent.event_type == AnalyticsEventType.WORKFLOW_EXECUTION,
                WorkflowAnalyticsEvent.created_at >= start_date,
                WorkflowAnalyticsEvent.created_at <= end_date
            )
        )
        
        result = await self.db.execute(query)
        return result.scalar() or 0
    
    # Additional helper methods would be implemented here...
    # _get_execution_trend, _get_performance_trend, _get_time_series_data, etc.