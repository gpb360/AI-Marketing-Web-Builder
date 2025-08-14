"""
SLA Performance Analysis Service for Story 3.5
Statistical analysis of historical performance patterns for intelligent threshold optimization.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import asyncio
from scipy import stats
from scipy.stats import normaltest, jarque_bera, kstest

from app.models.workflow import SLAViolation
from app.services.workflow_analytics_service import WorkflowAnalyticsService

logger = logging.getLogger(__name__)


class TrendDirection(Enum):
    """Performance trend directions."""
    IMPROVING = "improving"
    DEGRADING = "degrading" 
    STABLE = "stable"


@dataclass
class SeasonalPattern:
    """Seasonal performance pattern."""
    period: str  # 'hourly', 'daily', 'weekly'
    pattern_strength: float  # 0.0 to 1.0
    peak_periods: List[str]
    low_periods: List[str]
    seasonal_variance: float


@dataclass
class LoadCorrelation:
    """Performance correlation with system load."""
    metric_name: str
    correlation_coefficient: float
    p_value: float
    significance_level: str  # 'high', 'medium', 'low'


@dataclass
class PerformanceStatistics:
    """Statistical summary of performance data."""
    mean_performance: float
    median_performance: float
    percentile_95: float
    percentile_99: float
    standard_deviation: float
    coefficient_of_variation: float
    skewness: float
    kurtosis: float
    distribution_type: str
    normality_p_value: float


@dataclass
class PerformancePatterns:
    """Performance pattern analysis results."""
    trend_direction: TrendDirection
    trend_slope: float
    trend_confidence: float
    seasonal_factors: List[SeasonalPattern]
    load_correlations: List[LoadCorrelation]
    anomaly_periods: List[Tuple[datetime, datetime]]


@dataclass
class SLAPerformanceAnalysis:
    """Complete performance analysis for an SLA service type."""
    service_type: str
    analysis_period_days: int
    sample_size: int
    current_thresholds: Dict[str, Any]
    performance_statistics: PerformanceStatistics
    patterns: PerformancePatterns
    confidence_level: float
    analysis_timestamp: datetime
    data_quality_score: float


class SLAPerformanceAnalysisService:
    """
    Service for analyzing historical SLA performance patterns.
    Provides statistical insights for intelligent threshold optimization.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.analytics_service = WorkflowAnalyticsService(db)
        self.min_sample_size = 100
        self.default_confidence_level = 0.95
    
    async def analyze_service_performance(
        self,
        service_type: str,
        analysis_period_days: int = 30,
        confidence_level: float = 0.95,
        include_seasonal_patterns: bool = True
    ) -> SLAPerformanceAnalysis:
        """
        Analyze performance patterns for a specific SLA service type.
        
        Args:
            service_type: Type of SLA service to analyze
            analysis_period_days: Number of days to analyze
            confidence_level: Statistical confidence level
            include_seasonal_patterns: Whether to include seasonal analysis
            
        Returns:
            Complete performance analysis with statistical insights
        """
        try:
            # Get historical performance data
            performance_data = await self._get_historical_performance_data(
                service_type, analysis_period_days
            )
            
            if len(performance_data) < self.min_sample_size:
                raise ValueError(f"Insufficient data: {len(performance_data)} samples "
                               f"(minimum {self.min_sample_size} required)")
            
            # Calculate statistical metrics
            statistics = self._calculate_performance_statistics(performance_data)
            
            # Analyze patterns
            patterns = await self._analyze_performance_patterns(
                performance_data, include_seasonal_patterns
            )
            
            # Get current thresholds
            current_thresholds = await self._get_current_thresholds(service_type)
            
            # Calculate data quality score
            data_quality_score = self._calculate_data_quality_score(performance_data)
            
            return SLAPerformanceAnalysis(
                service_type=service_type,
                analysis_period_days=analysis_period_days,
                sample_size=len(performance_data),
                current_thresholds=current_thresholds,
                performance_statistics=statistics,
                patterns=patterns,
                confidence_level=confidence_level,
                analysis_timestamp=datetime.utcnow(),
                data_quality_score=data_quality_score
            )
            
        except Exception as e:
            logger.error(f"Failed to analyze service performance for {service_type}: {e}")
            raise
    
    async def _get_historical_performance_data(
        self, 
        service_type: str, 
        days: int
    ) -> pd.DataFrame:
        """Get historical performance data for analysis."""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Query historical SLA violations and performance metrics
            query = select(SLAViolation).where(
                SLAViolation.violation_type == service_type,
                SLAViolation.created_at >= cutoff_date
            ).order_by(SLAViolation.created_at)
            
            result = await self.db.execute(query)
            violations = result.scalars().all()
            
            # Convert to DataFrame for analysis
            data = []
            for violation in violations:
                data.append({
                    'timestamp': violation.created_at,
                    'performance_value': violation.threshold_exceeded_by or violation.expected_duration,
                    'actual_duration': violation.actual_duration,
                    'severity': violation.severity,
                    'resolved': violation.resolved_at is not None,
                    'resolution_time': (
                        (violation.resolved_at - violation.created_at).total_seconds() 
                        if violation.resolved_at else None
                    )
                })
            
            df = pd.DataFrame(data)
            
            if not df.empty:
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                df = df.set_index('timestamp')
                
                # Add time-based features
                df['hour'] = df.index.hour
                df['day_of_week'] = df.index.dayofweek
                df['day_of_month'] = df.index.day
                df['week_of_year'] = df.index.isocalendar().week
            
            return df
            
        except Exception as e:
            logger.error(f"Failed to get historical performance data: {e}")
            return pd.DataFrame()
    
    def _calculate_performance_statistics(self, data: pd.DataFrame) -> PerformanceStatistics:
        """Calculate comprehensive statistical metrics."""
        try:
            if data.empty or 'performance_value' not in data.columns:
                raise ValueError("No performance data available for analysis")
            
            values = data['performance_value'].dropna()
            
            # Basic statistics
            mean_perf = float(values.mean())
            median_perf = float(values.median())
            std_dev = float(values.std())
            
            # Percentiles
            percentile_95 = float(values.quantile(0.95))
            percentile_99 = float(values.quantile(0.99))
            
            # Advanced statistics
            coefficient_of_variation = std_dev / mean_perf if mean_perf > 0 else 0
            skewness = float(values.skew())
            kurtosis_val = float(values.kurtosis())
            
            # Test for normality
            normality_stat, normality_p = normaltest(values)
            
            # Determine distribution type
            distribution_type = "normal" if normality_p > 0.05 else "non-normal"
            if skewness > 1:
                distribution_type = "right-skewed"
            elif skewness < -1:
                distribution_type = "left-skewed"
            
            return PerformanceStatistics(
                mean_performance=mean_perf,
                median_performance=median_perf,
                percentile_95=percentile_95,
                percentile_99=percentile_99,
                standard_deviation=std_dev,
                coefficient_of_variation=coefficient_of_variation,
                skewness=skewness,
                kurtosis=kurtosis_val,
                distribution_type=distribution_type,
                normality_p_value=float(normality_p)
            )
            
        except Exception as e:
            logger.error(f"Failed to calculate performance statistics: {e}")
            raise
    
    async def _analyze_performance_patterns(
        self, 
        data: pd.DataFrame, 
        include_seasonal: bool
    ) -> PerformancePatterns:
        """Analyze performance trends and patterns."""
        try:
            if data.empty:
                return PerformancePatterns(
                    trend_direction=TrendDirection.STABLE,
                    trend_slope=0.0,
                    trend_confidence=0.0,
                    seasonal_factors=[],
                    load_correlations=[],
                    anomaly_periods=[]
                )
            
            # Trend analysis
            trend_direction, trend_slope, trend_confidence = self._analyze_trend(data)
            
            # Seasonal analysis
            seasonal_factors = []
            if include_seasonal and len(data) >= 168:  # At least 1 week of hourly data
                seasonal_factors = self._analyze_seasonal_patterns(data)
            
            # Load correlation analysis
            load_correlations = await self._analyze_load_correlations(data)
            
            # Anomaly detection
            anomaly_periods = self._detect_anomaly_periods(data)
            
            return PerformancePatterns(
                trend_direction=trend_direction,
                trend_slope=trend_slope,
                trend_confidence=trend_confidence,
                seasonal_factors=seasonal_factors,
                load_correlations=load_correlations,
                anomaly_periods=anomaly_periods
            )
            
        except Exception as e:
            logger.error(f"Failed to analyze performance patterns: {e}")
            raise
    
    def _analyze_trend(self, data: pd.DataFrame) -> Tuple[TrendDirection, float, float]:
        """Analyze performance trend direction and strength."""
        try:
            if 'performance_value' not in data.columns or len(data) < 10:
                return TrendDirection.STABLE, 0.0, 0.0
            
            # Prepare data for trend analysis
            data_clean = data.dropna(subset=['performance_value'])
            if len(data_clean) < 10:
                return TrendDirection.STABLE, 0.0, 0.0
            
            # Create time index for regression
            x = np.arange(len(data_clean))
            y = data_clean['performance_value'].values
            
            # Linear regression for trend
            slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
            
            # Determine trend direction
            confidence = abs(r_value)
            
            if p_value > 0.05 or confidence < 0.1:
                direction = TrendDirection.STABLE
            elif slope > 0:
                direction = TrendDirection.DEGRADING  # Increasing performance time = degrading
            else:
                direction = TrendDirection.IMPROVING  # Decreasing performance time = improving
            
            return direction, float(slope), float(confidence)
            
        except Exception as e:
            logger.error(f"Failed to analyze trend: {e}")
            return TrendDirection.STABLE, 0.0, 0.0
    
    def _analyze_seasonal_patterns(self, data: pd.DataFrame) -> List[SeasonalPattern]:
        """Analyze seasonal performance patterns."""
        try:
            patterns = []
            
            if 'performance_value' not in data.columns:
                return patterns
            
            # Hourly patterns
            hourly_pattern = self._analyze_hourly_pattern(data)
            if hourly_pattern:
                patterns.append(hourly_pattern)
            
            # Daily patterns (day of week)
            daily_pattern = self._analyze_daily_pattern(data)
            if daily_pattern:
                patterns.append(daily_pattern)
            
            # Weekly patterns
            if len(data) >= 30 * 24:  # At least 30 days of hourly data
                weekly_pattern = self._analyze_weekly_pattern(data)
                if weekly_pattern:
                    patterns.append(weekly_pattern)
            
            return patterns
            
        except Exception as e:
            logger.error(f"Failed to analyze seasonal patterns: {e}")
            return []
    
    def _analyze_hourly_pattern(self, data: pd.DataFrame) -> Optional[SeasonalPattern]:
        """Analyze hourly performance patterns."""
        try:
            hourly_stats = data.groupby('hour')['performance_value'].agg(['mean', 'std', 'count'])
            
            # Only analyze if we have sufficient data
            if hourly_stats['count'].min() < 5:
                return None
            
            # Calculate pattern strength using coefficient of variation
            overall_mean = data['performance_value'].mean()
            hourly_variance = hourly_stats['mean'].var()
            pattern_strength = min(1.0, hourly_variance / (overall_mean ** 2))
            
            # Identify peak and low periods
            mean_values = hourly_stats['mean']
            peak_threshold = mean_values.quantile(0.8)
            low_threshold = mean_values.quantile(0.2)
            
            peak_periods = [f"{hour:02d}:00" for hour in mean_values[mean_values >= peak_threshold].index]
            low_periods = [f"{hour:02d}:00" for hour in mean_values[mean_values <= low_threshold].index]
            
            return SeasonalPattern(
                period="hourly",
                pattern_strength=float(pattern_strength),
                peak_periods=peak_periods,
                low_periods=low_periods,
                seasonal_variance=float(hourly_variance)
            )
            
        except Exception as e:
            logger.error(f"Failed to analyze hourly pattern: {e}")
            return None
    
    def _analyze_daily_pattern(self, data: pd.DataFrame) -> Optional[SeasonalPattern]:
        """Analyze daily (day of week) performance patterns."""
        try:
            daily_stats = data.groupby('day_of_week')['performance_value'].agg(['mean', 'std', 'count'])
            
            if daily_stats['count'].min() < 10:
                return None
            
            # Calculate pattern strength
            overall_mean = data['performance_value'].mean()
            daily_variance = daily_stats['mean'].var()
            pattern_strength = min(1.0, daily_variance / (overall_mean ** 2))
            
            # Map day numbers to names
            day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            
            mean_values = daily_stats['mean']
            peak_threshold = mean_values.quantile(0.7)
            low_threshold = mean_values.quantile(0.3)
            
            peak_periods = [day_names[day] for day in mean_values[mean_values >= peak_threshold].index]
            low_periods = [day_names[day] for day in mean_values[mean_values <= low_threshold].index]
            
            return SeasonalPattern(
                period="daily",
                pattern_strength=float(pattern_strength),
                peak_periods=peak_periods,
                low_periods=low_periods,
                seasonal_variance=float(daily_variance)
            )
            
        except Exception as e:
            logger.error(f"Failed to analyze daily pattern: {e}")
            return None
    
    def _analyze_weekly_pattern(self, data: pd.DataFrame) -> Optional[SeasonalPattern]:
        """Analyze weekly performance patterns."""
        try:
            weekly_stats = data.groupby('week_of_year')['performance_value'].agg(['mean', 'std', 'count'])
            
            if len(weekly_stats) < 4:  # Need at least 4 weeks
                return None
            
            overall_mean = data['performance_value'].mean()
            weekly_variance = weekly_stats['mean'].var()
            pattern_strength = min(1.0, weekly_variance / (overall_mean ** 2))
            
            mean_values = weekly_stats['mean']
            peak_threshold = mean_values.quantile(0.8)
            low_threshold = mean_values.quantile(0.2)
            
            peak_periods = [f"Week {week}" for week in mean_values[mean_values >= peak_threshold].index]
            low_periods = [f"Week {week}" for week in mean_values[mean_values <= low_threshold].index]
            
            return SeasonalPattern(
                period="weekly",
                pattern_strength=float(pattern_strength),
                peak_periods=peak_periods,
                low_periods=low_periods,
                seasonal_variance=float(weekly_variance)
            )
            
        except Exception as e:
            logger.error(f"Failed to analyze weekly pattern: {e}")
            return None
    
    async def _analyze_load_correlations(self, data: pd.DataFrame) -> List[LoadCorrelation]:
        """Analyze correlation between performance and system load metrics."""
        try:
            correlations = []
            
            # Mock system load metrics - in production would come from monitoring systems
            load_metrics = {
                'cpu_usage': np.random.beta(2, 5, len(data)) * 100,  # Realistic CPU usage distribution
                'memory_usage': np.random.beta(3, 4, len(data)) * 100,  # Memory usage
                'active_requests': np.random.poisson(50, len(data)),  # Request count
                'db_connections': np.random.poisson(20, len(data)),  # DB connections
            }
            
            if 'performance_value' in data.columns:
                performance_values = data['performance_value'].values
                
                for metric_name, metric_values in load_metrics.items():
                    if len(metric_values) == len(performance_values):
                        # Calculate correlation
                        correlation_coef, p_value = stats.pearsonr(metric_values, performance_values)
                        
                        # Determine significance level
                        if p_value < 0.01:
                            significance = "high"
                        elif p_value < 0.05:
                            significance = "medium"
                        else:
                            significance = "low"
                        
                        correlations.append(LoadCorrelation(
                            metric_name=metric_name,
                            correlation_coefficient=float(correlation_coef),
                            p_value=float(p_value),
                            significance_level=significance
                        ))
            
            return correlations
            
        except Exception as e:
            logger.error(f"Failed to analyze load correlations: {e}")
            return []
    
    def _detect_anomaly_periods(self, data: pd.DataFrame) -> List[Tuple[datetime, datetime]]:
        """Detect anomalous performance periods using statistical methods."""
        try:
            anomaly_periods = []
            
            if 'performance_value' not in data.columns or len(data) < 50:
                return anomaly_periods
            
            # Calculate rolling statistics
            window_size = min(24, len(data) // 4)  # 24-hour window or 1/4 of data
            rolling_mean = data['performance_value'].rolling(window=window_size, center=True).mean()
            rolling_std = data['performance_value'].rolling(window=window_size, center=True).std()
            
            # Detect outliers using 3-sigma rule
            lower_bound = rolling_mean - 3 * rolling_std
            upper_bound = rolling_mean + 3 * rolling_std
            
            anomalies = (data['performance_value'] < lower_bound) | (data['performance_value'] > upper_bound)
            
            # Group consecutive anomalies into periods
            anomaly_starts = []
            anomaly_ends = []
            in_anomaly = False
            
            for idx, is_anomaly in anomalies.items():
                if is_anomaly and not in_anomaly:
                    anomaly_starts.append(idx)
                    in_anomaly = True
                elif not is_anomaly and in_anomaly:
                    anomaly_ends.append(idx)
                    in_anomaly = False
            
            # Handle case where data ends during an anomaly
            if in_anomaly and anomaly_starts:
                anomaly_ends.append(data.index[-1])
            
            # Combine start and end times
            for start, end in zip(anomaly_starts, anomaly_ends):
                if isinstance(start, pd.Timestamp) and isinstance(end, pd.Timestamp):
                    anomaly_periods.append((start.to_pydatetime(), end.to_pydatetime()))
            
            return anomaly_periods
            
        except Exception as e:
            logger.error(f"Failed to detect anomaly periods: {e}")
            return []
    
    async def _get_current_thresholds(self, service_type: str) -> Dict[str, Any]:
        """Get current SLA thresholds for the service type."""
        try:
            # Mock current thresholds - in production would come from SLA configuration
            threshold_config = {
                'pr_review_time': {'threshold_value': 7200, 'unit': 'seconds'},  # 2 hours
                'build_time': {'threshold_value': 1800, 'unit': 'seconds'},      # 30 minutes
                'test_execution': {'threshold_value': 900, 'unit': 'seconds'},   # 15 minutes
                'deployment_time': {'threshold_value': 3600, 'unit': 'seconds'}, # 1 hour
                'agent_response': {'threshold_value': 300, 'unit': 'seconds'},   # 5 minutes
                'task_completion': {'threshold_value': 14400, 'unit': 'seconds'} # 4 hours
            }
            
            current_threshold = threshold_config.get(service_type, {'threshold_value': 3600, 'unit': 'seconds'})
            
            # Get current violation rate
            violation_rate = await self._calculate_current_violation_rate(service_type, current_threshold['threshold_value'])
            
            return {
                'threshold_value': current_threshold['threshold_value'],
                'unit': current_threshold['unit'],
                'violation_rate': violation_rate,
                'last_updated': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get current thresholds: {e}")
            return {'threshold_value': 3600, 'unit': 'seconds', 'violation_rate': 0.0}
    
    async def _calculate_current_violation_rate(self, service_type: str, threshold_value: float) -> float:
        """Calculate current violation rate for the service type."""
        try:
            # Get recent performance data (last 7 days)
            recent_data = await self._get_historical_performance_data(service_type, 7)
            
            if recent_data.empty or 'performance_value' not in recent_data.columns:
                return 0.0
            
            # Calculate violation rate
            violations = (recent_data['performance_value'] > threshold_value).sum()
            total_samples = len(recent_data)
            
            violation_rate = violations / total_samples if total_samples > 0 else 0.0
            
            return float(violation_rate)
            
        except Exception as e:
            logger.error(f"Failed to calculate violation rate: {e}")
            return 0.0
    
    def _calculate_data_quality_score(self, data: pd.DataFrame) -> float:
        """Calculate data quality score based on completeness and consistency."""
        try:
            if data.empty:
                return 0.0
            
            # Completeness score
            total_fields = len(data.columns)
            complete_fields = data.count().sum()
            total_possible = len(data) * total_fields
            completeness_score = complete_fields / total_possible if total_possible > 0 else 0.0
            
            # Consistency score (check for outliers)
            if 'performance_value' in data.columns:
                values = data['performance_value'].dropna()
                if len(values) > 10:
                    q75, q25 = values.quantile([0.75, 0.25])
                    iqr = q75 - q25
                    lower_bound = q25 - 1.5 * iqr
                    upper_bound = q75 + 1.5 * iqr
                    
                    outliers = ((values < lower_bound) | (values > upper_bound)).sum()
                    consistency_score = 1.0 - (outliers / len(values))
                else:
                    consistency_score = 1.0
            else:
                consistency_score = 0.5
            
            # Recency score (prefer more recent data)
            if not data.empty and hasattr(data.index, 'max'):
                latest_time = data.index.max()
                time_diff = datetime.now() - latest_time.to_pydatetime()
                recency_score = max(0.0, 1.0 - (time_diff.days / 7))  # Decay over 7 days
            else:
                recency_score = 0.5
            
            # Overall quality score (weighted average)
            quality_score = (
                0.4 * completeness_score +
                0.4 * consistency_score +
                0.2 * recency_score
            )
            
            return float(min(1.0, max(0.0, quality_score)))
            
        except Exception as e:
            logger.error(f"Failed to calculate data quality score: {e}")
            return 0.5
    
    async def generate_performance_report(
        self, 
        service_types: List[str],
        analysis_period_days: int = 30
    ) -> Dict[str, SLAPerformanceAnalysis]:
        """Generate comprehensive performance report for multiple service types."""
        try:
            report = {}
            
            # Analyze each service type
            for service_type in service_types:
                try:
                    analysis = await self.analyze_service_performance(
                        service_type, analysis_period_days
                    )
                    report[service_type] = analysis
                except Exception as e:
                    logger.error(f"Failed to analyze {service_type}: {e}")
                    # Continue with other service types
            
            return report
            
        except Exception as e:
            logger.error(f"Failed to generate performance report: {e}")
            return {}