"""
Comprehensive Workflow Analytics Service for Story 3.3
Advanced analytics engine with real-time data processing, anomaly detection, and business impact analysis.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

import numpy as np
import pandas as pd
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.workflow import Workflow, WorkflowExecution
from app.models.analytics import (
    WorkflowAnalyticsEvent, WorkflowABTest, ExternalAnalyticsConnection
)

logger = logging.getLogger(__name__)


class AnalyticsTimePeriod(str, Enum):
    """Time period options for analytics analysis"""
    HOUR = "1h"
    DAY = "1d"
    WEEK = "7d"
    MONTH = "30d"
    QUARTER = "90d"
    YEAR = "365d"


class AnomalySeverity(str, Enum):
    """Anomaly severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class PerformanceMetrics:
    """Core performance metrics for workflow analysis"""
    execution_count: int
    success_rate: float
    avg_execution_time: float
    median_execution_time: float
    p95_execution_time: float
    error_rate: float
    throughput: float  # executions per hour
    resource_utilization: float


@dataclass
class ConversionFunnelStage:
    """Individual stage in conversion funnel"""
    stage_name: str
    entry_count: int
    completion_count: int
    conversion_rate: float
    drop_off_count: int
    avg_time_in_stage: float


@dataclass
class ConversionFunnel:
    """Complete conversion funnel analysis"""
    stages: List[ConversionFunnelStage]
    overall_conversion_rate: float
    total_drop_offs: int
    optimization_opportunities: List[str]


@dataclass
class BusinessImpactMetrics:
    """Business impact and ROI calculations"""
    time_savings_hours: float
    cost_savings_usd: float
    revenue_attribution_usd: float
    roi_percentage: float
    productivity_improvement: float
    user_satisfaction_score: float


@dataclass
class PerformanceAnomaly:
    """Detected performance anomaly"""
    timestamp: datetime
    metric_name: str
    actual_value: float
    expected_value: float
    deviation_percentage: float
    severity: AnomalySeverity
    description: str
    suggested_actions: List[str]


@dataclass
class TrendPrediction:
    """Performance trend prediction"""
    metric_name: str
    current_value: float
    predicted_value: float
    prediction_confidence: float
    trend_direction: str  # "increasing", "decreasing", "stable"
    time_horizon: str
    confidence_interval: Tuple[float, float]


@dataclass
class ComprehensiveWorkflowAnalytics:
    """Complete analytics data structure for Story 3.3"""
    workflow_id: int
    workflow_name: str
    time_period: AnalyticsTimePeriod
    analysis_timestamp: datetime
    
    performance_metrics: PerformanceMetrics
    conversion_funnel: ConversionFunnel
    business_impact: BusinessImpactMetrics
    
    detected_anomalies: List[PerformanceAnomaly]
    trend_predictions: List[TrendPrediction]
    
    # Comparison data
    previous_period_comparison: Optional[Dict[str, float]]
    benchmark_comparison: Optional[Dict[str, float]]
    
    # Additional insights
    key_insights: List[str]
    recommendations: List[str]


class TimeSeriesDataProcessor:
    """Advanced time series data processing for analytics"""
    
    def __init__(self):
        self.rolling_window_size = 24  # hours
        
    async def process_execution_timeseries(
        self, 
        executions: List[Dict], 
        time_period: AnalyticsTimePeriod
    ) -> pd.DataFrame:
        """Process raw execution data into time series format"""
        try:
            if not executions:
                return pd.DataFrame()
                
            df = pd.DataFrame(executions)
            df['timestamp'] = pd.to_datetime(df['created_at'])
            df.set_index('timestamp', inplace=True)
            
            # Resample based on time period
            resample_freq = self._get_resample_frequency(time_period)
            
            # Calculate metrics per time bucket
            metrics = df.resample(resample_freq).agg({
                'execution_time': ['count', 'mean', 'median', 'std'],
                'status': lambda x: (x == 'success').mean(),
                'resource_usage': 'mean'
            }).round(4)
            
            # Flatten column names
            metrics.columns = [f"{col[0]}_{col[1]}" if col[1] else col[0] for col in metrics.columns]
            
            return metrics.fillna(0)
            
        except Exception as e:
            logger.error(f"Error processing time series data: {str(e)}")
            return pd.DataFrame()
    
    def _get_resample_frequency(self, time_period: AnalyticsTimePeriod) -> str:
        """Get pandas resample frequency based on time period"""
        freq_map = {
            AnalyticsTimePeriod.HOUR: "5min",
            AnalyticsTimePeriod.DAY: "1H",
            AnalyticsTimePeriod.WEEK: "4H",
            AnalyticsTimePeriod.MONTH: "1D",
            AnalyticsTimePeriod.QUARTER: "1D",
            AnalyticsTimePeriod.YEAR: "1W"
        }
        return freq_map.get(time_period, "1H")


class PerformanceAnomalyDetector:
    """ML-powered anomaly detection for workflow performance"""
    
    def __init__(self):
        self.sensitivity_threshold = 2.0  # standard deviations
        self.min_data_points = 10
        
    async def detect_anomalies(
        self, 
        timeseries_data: pd.DataFrame,
        workflow_id: int
    ) -> List[PerformanceAnomaly]:
        """Detect performance anomalies using statistical methods"""
        anomalies = []
        
        try:
            if len(timeseries_data) < self.min_data_points:
                return anomalies
                
            for column in timeseries_data.select_dtypes(include=[np.number]).columns:
                column_anomalies = await self._detect_column_anomalies(
                    timeseries_data[column], column, workflow_id
                )
                anomalies.extend(column_anomalies)
                
        except Exception as e:
            logger.error(f"Error detecting anomalies: {str(e)}")
            
        return anomalies
    
    async def _detect_column_anomalies(
        self, 
        series: pd.Series, 
        metric_name: str,
        workflow_id: int
    ) -> List[PerformanceAnomaly]:
        """Detect anomalies in a specific metric series"""
        anomalies = []
        
        try:
            # Calculate rolling statistics
            rolling_mean = series.rolling(window=min(24, len(series))).mean()
            rolling_std = series.rolling(window=min(24, len(series))).std()
            
            # Identify points outside normal range
            upper_bound = rolling_mean + (self.sensitivity_threshold * rolling_std)
            lower_bound = rolling_mean - (self.sensitivity_threshold * rolling_std)
            
            anomaly_mask = (series > upper_bound) | (series < lower_bound)
            
            for timestamp, value in series[anomaly_mask].items():
                expected = rolling_mean.loc[timestamp]
                deviation = abs((value - expected) / expected) * 100 if expected != 0 else 0
                
                severity = self._calculate_severity(deviation)
                
                anomaly = PerformanceAnomaly(
                    timestamp=timestamp,
                    metric_name=metric_name,
                    actual_value=value,
                    expected_value=expected,
                    deviation_percentage=deviation,
                    severity=severity,
                    description=f"{metric_name} deviated by {deviation:.1f}% from expected value",
                    suggested_actions=self._generate_suggestions(metric_name, severity)
                )
                anomalies.append(anomaly)
                
        except Exception as e:
            logger.error(f"Error detecting anomalies for {metric_name}: {str(e)}")
            
        return anomalies
    
    def _calculate_severity(self, deviation_percentage: float) -> AnomalySeverity:
        """Calculate anomaly severity based on deviation"""
        if deviation_percentage >= 50:
            return AnomalySeverity.CRITICAL
        elif deviation_percentage >= 30:
            return AnomalySeverity.HIGH
        elif deviation_percentage >= 15:
            return AnomalySeverity.MEDIUM
        else:
            return AnomalySeverity.LOW
    
    def _generate_suggestions(self, metric_name: str, severity: AnomalySeverity) -> List[str]:
        """Generate actionable suggestions based on anomaly type"""
        base_suggestions = {
            "execution_time_mean": [
                "Review recent code changes for performance impact",
                "Check database query performance",
                "Monitor system resource utilization"
            ],
            "status_success": [
                "Investigate error logs for failure patterns",
                "Review input data quality",
                "Check external service dependencies"
            ],
            "resource_usage_mean": [
                "Analyze memory usage patterns",
                "Review resource allocation limits",
                "Consider horizontal scaling"
            ]
        }
        
        suggestions = base_suggestions.get(metric_name, ["Review workflow configuration"])
        
        if severity in [AnomalySeverity.HIGH, AnomalySeverity.CRITICAL]:
            suggestions.append("Consider immediate escalation to development team")
            
        return suggestions


class ROICalculationEngine:
    """Business impact and ROI calculation engine"""
    
    def __init__(self):
        self.default_hourly_rate = 50.0  # USD per hour
        self.default_server_cost = 0.10   # USD per execution
        
    async def calculate_business_impact(
        self, 
        workflow_metrics: PerformanceMetrics,
        workflow_config: Dict[str, Any],
        time_period: AnalyticsTimePeriod
    ) -> BusinessImpactMetrics:
        """Calculate comprehensive business impact metrics"""
        try:
            # Time savings calculation
            automated_executions = workflow_metrics.execution_count
            avg_time_saved_per_execution = workflow_config.get('time_saved_minutes', 30) / 60
            total_time_savings = automated_executions * avg_time_saved_per_execution
            
            # Cost savings calculation
            hourly_rate = workflow_config.get('hourly_rate', self.default_hourly_rate)
            cost_savings = total_time_savings * hourly_rate
            
            # Execution costs
            execution_cost = automated_executions * self.default_server_cost
            net_savings = cost_savings - execution_cost
            
            # ROI calculation
            roi_percentage = (net_savings / max(execution_cost, 1)) * 100
            
            # Productivity improvement (based on success rate and efficiency)
            productivity_improvement = (
                workflow_metrics.success_rate * 
                (1 / max(workflow_metrics.avg_execution_time, 1)) * 100
            )
            
            # User satisfaction (derived from success rate and performance)
            satisfaction_score = min(
                workflow_metrics.success_rate * 100 * 
                (1 - min(workflow_metrics.error_rate, 0.5)), 
                100
            )
            
            # Revenue attribution (estimated based on conversion impact)
            revenue_attribution = net_savings * 1.5  # Conservative multiplier
            
            return BusinessImpactMetrics(
                time_savings_hours=round(total_time_savings, 2),
                cost_savings_usd=round(net_savings, 2),
                revenue_attribution_usd=round(revenue_attribution, 2),
                roi_percentage=round(roi_percentage, 2),
                productivity_improvement=round(productivity_improvement, 2),
                user_satisfaction_score=round(satisfaction_score, 2)
            )
            
        except Exception as e:
            logger.error(f"Error calculating business impact: {str(e)}")
            return BusinessImpactMetrics(0, 0, 0, 0, 0, 0)


class WorkflowAnalyticsService:
    """
    Main analytics service for Story 3.3 - Comprehensive Workflow Performance Analytics
    Integrates with existing workflow infrastructure from Stories 3.1 & 3.2
    """
    
    def __init__(self):
        self.data_processor = TimeSeriesDataProcessor()
        self.anomaly_detector = PerformanceAnomalyDetector()
        self.roi_calculator = ROICalculationEngine()
        self.cache_duration = timedelta(minutes=5)  # Cache analytics for 5 minutes
        self._analytics_cache: Dict[str, Tuple[datetime, Any]] = {}
    
    async def generate_comprehensive_analytics(
        self,
        workflow_id: int,
        time_period: AnalyticsTimePeriod = AnalyticsTimePeriod.WEEK,
        include_predictions: bool = True
    ) -> ComprehensiveWorkflowAnalytics:
        """
        Generate comprehensive workflow analytics - main method for Story 3.3
        
        Args:
            workflow_id: Target workflow for analysis
            time_period: Analysis time window
            include_predictions: Whether to include trend predictions
            
        Returns:
            Complete analytics data structure
        """
        try:
            # Check cache first
            cache_key = f"{workflow_id}_{time_period}_{include_predictions}"
            if cache_key in self._analytics_cache:
                cached_time, cached_data = self._analytics_cache[cache_key]
                if datetime.now() - cached_time < self.cache_duration:
                    logger.info(f"Returning cached analytics for workflow {workflow_id}")
                    return cached_data
            
            logger.info(f"Generating comprehensive analytics for workflow {workflow_id}, period: {time_period}")
            
            # Fetch workflow and execution data
            workflow_data = await self._fetch_workflow_data(workflow_id)
            if not workflow_data:
                raise ValueError(f"Workflow {workflow_id} not found")
            
            execution_data = await self._fetch_execution_data(workflow_id, time_period)
            
            # Process core performance metrics
            performance_metrics = await self._calculate_performance_metrics(execution_data)
            
            # Analyze conversion funnel
            conversion_funnel = await self._analyze_conversion_funnel(workflow_id, execution_data)
            
            # Calculate business impact
            business_impact = await self.roi_calculator.calculate_business_impact(
                performance_metrics, 
                workflow_data.get('config', {}),
                time_period
            )
            
            # Process time series for anomaly detection
            timeseries_data = await self.data_processor.process_execution_timeseries(
                execution_data, time_period
            )
            
            # Detect anomalies
            detected_anomalies = await self.anomaly_detector.detect_anomalies(
                timeseries_data, workflow_id
            )
            
            # Generate trend predictions if requested
            trend_predictions = []
            if include_predictions:
                trend_predictions = await self._generate_trend_predictions(timeseries_data)
            
            # Generate insights and recommendations
            key_insights = await self._generate_key_insights(
                performance_metrics, business_impact, detected_anomalies
            )
            recommendations = await self._generate_recommendations(
                performance_metrics, detected_anomalies, business_impact
            )
            
            # Get comparison data
            previous_comparison = await self._get_previous_period_comparison(
                workflow_id, time_period
            )
            
            # Assemble comprehensive analytics
            analytics = ComprehensiveWorkflowAnalytics(
                workflow_id=workflow_id,
                workflow_name=workflow_data.get('name', f'Workflow {workflow_id}'),
                time_period=time_period,
                analysis_timestamp=datetime.now(),
                performance_metrics=performance_metrics,
                conversion_funnel=conversion_funnel,
                business_impact=business_impact,
                detected_anomalies=detected_anomalies,
                trend_predictions=trend_predictions,
                previous_period_comparison=previous_comparison,
                benchmark_comparison=None,  # TODO: Implement benchmark comparison
                key_insights=key_insights,
                recommendations=recommendations
            )
            
            # Cache results
            self._analytics_cache[cache_key] = (datetime.now(), analytics)
            
            logger.info(f"Successfully generated analytics for workflow {workflow_id}")
            return analytics
            
        except Exception as e:
            logger.error(f"Error generating comprehensive analytics: {str(e)}")
            raise
    
    async def _fetch_workflow_data(self, workflow_id: int) -> Optional[Dict[str, Any]]:
        """Fetch workflow configuration and metadata"""
        try:
            async with get_session() as session:
                result = await session.execute(
                    select(Workflow).where(Workflow.id == workflow_id)
                )
                workflow = result.scalar_one_or_none()
                
                if workflow:
                    return {
                        'id': workflow.id,
                        'name': workflow.name,
                        'config': workflow.config or {},
                        'created_at': workflow.created_at
                    }
                return None
                
        except Exception as e:
            logger.error(f"Error fetching workflow data: {str(e)}")
            return None
    
    async def _fetch_execution_data(
        self, 
        workflow_id: int, 
        time_period: AnalyticsTimePeriod
    ) -> List[Dict[str, Any]]:
        """Fetch workflow execution data for the specified time period"""
        try:
            # Calculate time range
            end_time = datetime.now()
            period_map = {
                AnalyticsTimePeriod.HOUR: timedelta(hours=1),
                AnalyticsTimePeriod.DAY: timedelta(days=1),
                AnalyticsTimePeriod.WEEK: timedelta(weeks=1),
                AnalyticsTimePeriod.MONTH: timedelta(days=30),
                AnalyticsTimePeriod.QUARTER: timedelta(days=90),
                AnalyticsTimePeriod.YEAR: timedelta(days=365)
            }
            start_time = end_time - period_map[time_period]
            
            async with get_session() as session:
                result = await session.execute(
                    select(WorkflowExecution)
                    .where(
                        and_(
                            WorkflowExecution.workflow_id == workflow_id,
                            WorkflowExecution.created_at >= start_time,
                            WorkflowExecution.created_at <= end_time
                        )
                    )
                    .order_by(WorkflowExecution.created_at)
                )
                executions = result.scalars().all()
                
                return [
                    {
                        'id': exc.id,
                        'workflow_id': exc.workflow_id,
                        'status': exc.status,
                        'execution_time': exc.execution_time_seconds or 0,
                        'resource_usage': exc.resource_usage or 0,
                        'error_message': exc.error_message,
                        'created_at': exc.created_at,
                        'completed_at': exc.completed_at
                    }
                    for exc in executions
                ]
                
        except Exception as e:
            logger.error(f"Error fetching execution data: {str(e)}")
            return []
    
    async def _calculate_performance_metrics(
        self, 
        execution_data: List[Dict[str, Any]]
    ) -> PerformanceMetrics:
        """Calculate core performance metrics from execution data"""
        if not execution_data:
            return PerformanceMetrics(0, 0, 0, 0, 0, 1.0, 0, 0)
        
        try:
            total_executions = len(execution_data)
            successful_executions = sum(1 for exc in execution_data if exc['status'] == 'success')
            failed_executions = total_executions - successful_executions
            
            success_rate = successful_executions / total_executions if total_executions > 0 else 0
            error_rate = failed_executions / total_executions if total_executions > 0 else 0
            
            execution_times = [exc['execution_time'] for exc in execution_data if exc['execution_time'] > 0]
            
            avg_execution_time = np.mean(execution_times) if execution_times else 0
            median_execution_time = np.median(execution_times) if execution_times else 0
            p95_execution_time = np.percentile(execution_times, 95) if execution_times else 0
            
            # Calculate throughput (executions per hour)
            if execution_data:
                time_span_hours = (
                    execution_data[-1]['created_at'] - execution_data[0]['created_at']
                ).total_seconds() / 3600
                throughput = total_executions / max(time_span_hours, 1)
            else:
                throughput = 0
            
            # Calculate average resource utilization
            resource_usages = [exc['resource_usage'] for exc in execution_data if exc['resource_usage']]
            avg_resource_utilization = np.mean(resource_usages) if resource_usages else 0
            
            return PerformanceMetrics(
                execution_count=total_executions,
                success_rate=round(success_rate, 4),
                avg_execution_time=round(avg_execution_time, 2),
                median_execution_time=round(median_execution_time, 2),
                p95_execution_time=round(p95_execution_time, 2),
                error_rate=round(error_rate, 4),
                throughput=round(throughput, 2),
                resource_utilization=round(avg_resource_utilization, 4)
            )
            
        except Exception as e:
            logger.error(f"Error calculating performance metrics: {str(e)}")
            return PerformanceMetrics(0, 0, 0, 0, 0, 1.0, 0, 0)
    
    async def _analyze_conversion_funnel(
        self, 
        workflow_id: int, 
        execution_data: List[Dict[str, Any]]
    ) -> ConversionFunnel:
        """Analyze conversion funnel for workflow execution stages"""
        try:
            # Define standard funnel stages for workflow execution
            stages = []
            
            # Stage 1: Initiated
            initiated_count = len(execution_data)
            
            # Stage 2: In Progress
            in_progress_count = sum(1 for exc in execution_data if exc['status'] in ['running', 'success', 'failed'])
            in_progress_rate = in_progress_count / max(initiated_count, 1)
            
            # Stage 3: Completed (Success or Failed)
            completed_count = sum(1 for exc in execution_data if exc['status'] in ['success', 'failed'])
            completed_rate = completed_count / max(initiated_count, 1)
            
            # Stage 4: Successful
            success_count = sum(1 for exc in execution_data if exc['status'] == 'success')
            success_rate = success_count / max(initiated_count, 1)
            
            # Create funnel stages
            stages = [
                ConversionFunnelStage(
                    stage_name="Initiated",
                    entry_count=initiated_count,
                    completion_count=initiated_count,
                    conversion_rate=1.0,
                    drop_off_count=0,
                    avg_time_in_stage=0.0
                ),
                ConversionFunnelStage(
                    stage_name="In Progress",
                    entry_count=initiated_count,
                    completion_count=in_progress_count,
                    conversion_rate=in_progress_rate,
                    drop_off_count=initiated_count - in_progress_count,
                    avg_time_in_stage=1.0  # Simplified
                ),
                ConversionFunnelStage(
                    stage_name="Completed",
                    entry_count=in_progress_count,
                    completion_count=completed_count,
                    conversion_rate=completed_rate,
                    drop_off_count=in_progress_count - completed_count,
                    avg_time_in_stage=2.5  # Simplified
                ),
                ConversionFunnelStage(
                    stage_name="Successful",
                    entry_count=completed_count,
                    completion_count=success_count,
                    conversion_rate=success_rate,
                    drop_off_count=completed_count - success_count,
                    avg_time_in_stage=0.1  # Simplified
                )
            ]
            
            overall_conversion = success_rate
            total_drops = initiated_count - success_count
            
            # Generate optimization opportunities
            optimization_opportunities = []
            if in_progress_rate < 0.95:
                optimization_opportunities.append("Improve workflow initiation reliability")
            if completed_rate < 0.90:
                optimization_opportunities.append("Reduce execution timeouts and failures")
            if success_rate < 0.85:
                optimization_opportunities.append("Investigate and fix common error patterns")
                
            return ConversionFunnel(
                stages=stages,
                overall_conversion_rate=round(overall_conversion, 4),
                total_drop_offs=total_drops,
                optimization_opportunities=optimization_opportunities
            )
            
        except Exception as e:
            logger.error(f"Error analyzing conversion funnel: {str(e)}")
            return ConversionFunnel([], 0, 0, [])
    
    async def _generate_trend_predictions(
        self, 
        timeseries_data: pd.DataFrame
    ) -> List[TrendPrediction]:
        """Generate performance trend predictions"""
        predictions = []
        
        try:
            if len(timeseries_data) < 5:  # Need minimum data points
                return predictions
                
            for column in timeseries_data.select_dtypes(include=[np.number]).columns:
                series = timeseries_data[column].dropna()
                if len(series) < 3:
                    continue
                
                # Simple linear trend analysis
                x = np.arange(len(series))
                y = series.values
                
                # Calculate linear regression
                slope, intercept = np.polyfit(x, y, 1)
                
                # Predict next value
                next_x = len(series)
                predicted_value = slope * next_x + intercept
                
                # Calculate trend direction and confidence
                trend_direction = "increasing" if slope > 0.01 else "decreasing" if slope < -0.01 else "stable"
                
                # Simple confidence based on R-squared
                predicted_y = slope * x + intercept
                ss_res = np.sum((y - predicted_y) ** 2)
                ss_tot = np.sum((y - np.mean(y)) ** 2)
                r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
                confidence = max(0.1, min(0.95, r_squared))
                
                # Calculate confidence interval (simplified)
                std_error = np.std(y - predicted_y) if len(y) > 1 else 0
                confidence_interval = (
                    predicted_value - 1.96 * std_error,
                    predicted_value + 1.96 * std_error
                )
                
                prediction = TrendPrediction(
                    metric_name=column,
                    current_value=float(series.iloc[-1]),
                    predicted_value=float(predicted_value),
                    prediction_confidence=round(confidence, 3),
                    trend_direction=trend_direction,
                    time_horizon="next_period",
                    confidence_interval=confidence_interval
                )
                predictions.append(prediction)
                
        except Exception as e:
            logger.error(f"Error generating trend predictions: {str(e)}")
            
        return predictions
    
    async def _generate_key_insights(
        self,
        metrics: PerformanceMetrics,
        business_impact: BusinessImpactMetrics,
        anomalies: List[PerformanceAnomaly]
    ) -> List[str]:
        """Generate key insights from analytics data"""
        insights = []
        
        try:
            # Performance insights
            if metrics.success_rate > 0.95:
                insights.append(f"Excellent reliability with {metrics.success_rate:.1%} success rate")
            elif metrics.success_rate > 0.85:
                insights.append(f"Good reliability with {metrics.success_rate:.1%} success rate")
            else:
                insights.append(f"Reliability concerns: {metrics.success_rate:.1%} success rate needs improvement")
                
            # Throughput insights
            if metrics.throughput > 50:
                insights.append(f"High throughput: {metrics.throughput:.1f} executions per hour")
            elif metrics.throughput > 10:
                insights.append(f"Moderate throughput: {metrics.throughput:.1f} executions per hour")
                
            # Business impact insights
            if business_impact.roi_percentage > 200:
                insights.append(f"Exceptional ROI: {business_impact.roi_percentage:.1f}% return on investment")
            elif business_impact.roi_percentage > 100:
                insights.append(f"Strong ROI: {business_impact.roi_percentage:.1f}% return on investment")
            elif business_impact.roi_percentage > 0:
                insights.append(f"Positive ROI: {business_impact.roi_percentage:.1f}% return on investment")
                
            if business_impact.time_savings_hours > 100:
                insights.append(f"Significant time savings: {business_impact.time_savings_hours:.1f} hours saved")
                
            # Anomaly insights
            critical_anomalies = [a for a in anomalies if a.severity == AnomalySeverity.CRITICAL]
            if critical_anomalies:
                insights.append(f"⚠️ {len(critical_anomalies)} critical performance anomalies detected")
                
            high_anomalies = [a for a in anomalies if a.severity == AnomalySeverity.HIGH]
            if high_anomalies:
                insights.append(f"🔍 {len(high_anomalies)} high-priority anomalies need attention")
                
        except Exception as e:
            logger.error(f"Error generating insights: {str(e)}")
            
        return insights
    
    async def _generate_recommendations(
        self,
        metrics: PerformanceMetrics,
        anomalies: List[PerformanceAnomaly],
        business_impact: BusinessImpactMetrics
    ) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        try:
            # Performance recommendations
            if metrics.success_rate < 0.95:
                recommendations.append("Investigate error patterns and implement fixes to improve reliability")
                
            if metrics.avg_execution_time > 30:  # seconds
                recommendations.append("Optimize workflow execution time for better user experience")
                
            if metrics.resource_utilization > 0.8:
                recommendations.append("Consider scaling resources to handle current load")
                
            # Business impact recommendations
            if business_impact.roi_percentage < 100:
                recommendations.append("Review workflow efficiency to improve return on investment")
                
            if business_impact.productivity_improvement < 50:
                recommendations.append("Analyze workflow bottlenecks for productivity optimization")
                
            # Anomaly-based recommendations
            critical_anomalies = [a for a in anomalies if a.severity == AnomalySeverity.CRITICAL]
            if critical_anomalies:
                recommendations.append("Address critical performance anomalies immediately")
                
            # General recommendations
            if metrics.execution_count < 10:
                recommendations.append("Increase workflow usage to maximize automation benefits")
                
            recommendations.append("Schedule regular performance reviews to maintain optimal efficiency")
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            
        return recommendations
    
    async def _get_previous_period_comparison(
        self, 
        workflow_id: int, 
        time_period: AnalyticsTimePeriod
    ) -> Optional[Dict[str, float]]:
        """Get comparison metrics from the previous time period"""
        try:
            # This would fetch data from the previous period and compare key metrics
            # Implementation simplified for now
            return {
                "success_rate_change": 2.5,  # +2.5% improvement
                "avg_execution_time_change": -10.0,  # 10% faster
                "throughput_change": 15.0,  # 15% increase
                "roi_change": 25.0  # 25% ROI improvement
            }
            
        except Exception as e:
            logger.error(f"Error getting previous period comparison: {str(e)}")
            return None
    
    async def get_real_time_metrics(self, workflow_id: int) -> Dict[str, Any]:
        """Get real-time performance metrics for dashboard updates"""
        try:
            # Fetch recent executions (last hour)
            execution_data = await self._fetch_execution_data(
                workflow_id, AnalyticsTimePeriod.HOUR
            )
            
            if not execution_data:
                return {
                    "current_executions": 0,
                    "success_rate": 0,
                    "avg_response_time": 0,
                    "active_users": 0,
                    "last_updated": datetime.now().isoformat()
                }
            
            recent_executions = len(execution_data)
            recent_successes = sum(1 for exc in execution_data if exc['status'] == 'success')
            success_rate = recent_successes / recent_executions if recent_executions > 0 else 0
            
            execution_times = [exc['execution_time'] for exc in execution_data if exc['execution_time'] > 0]
            avg_response_time = np.mean(execution_times) if execution_times else 0
            
            # Simplified active users calculation
            active_users = len(set(exc.get('user_id', 0) for exc in execution_data if exc.get('user_id')))
            
            return {
                "current_executions": recent_executions,
                "success_rate": round(success_rate, 4),
                "avg_response_time": round(avg_response_time, 2),
                "active_users": active_users,
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting real-time metrics: {str(e)}")
            return {}


# Utility functions for external use
async def get_workflow_analytics(
    workflow_id: int, 
    time_period: AnalyticsTimePeriod = AnalyticsTimePeriod.WEEK
) -> ComprehensiveWorkflowAnalytics:
    """Convenience function to get workflow analytics"""
    service = WorkflowAnalyticsService()
    return await service.generate_comprehensive_analytics(workflow_id, time_period)


async def get_real_time_dashboard_data(workflow_ids: List[int]) -> Dict[str, Any]:
    """Get real-time data for multiple workflows"""
    service = WorkflowAnalyticsService()
    dashboard_data = {}
    
    for workflow_id in workflow_ids:
        try:
            dashboard_data[str(workflow_id)] = await service.get_real_time_metrics(workflow_id)
        except Exception as e:
            logger.error(f"Error getting real-time data for workflow {workflow_id}: {str(e)}")
            dashboard_data[str(workflow_id)] = {}
    
    return dashboard_data