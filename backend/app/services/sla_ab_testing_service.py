"""
SLA A/B Testing Service for Story 3.5
Controlled threshold experimentation with statistical significance testing.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update, delete
from scipy import stats
import asyncio

from app.models.workflow import SLAViolation

logger = logging.getLogger(__name__)


class ExperimentStatus(Enum):
    """Status of A/B testing experiments."""
    PLANNING = "planning"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    EARLY_STOPPED = "early_stopped"


class ExperimentGroup(Enum):
    """Experiment group assignments."""
    CONTROL = "control"
    TEST = "test"


class StoppingReason(Enum):
    """Reasons for early experiment stopping."""
    STATISTICAL_SIGNIFICANCE = "statistical_significance"
    PERFORMANCE_DEGRADATION = "performance_degradation"
    INSUFFICIENT_DATA = "insufficient_data"
    MANUAL_STOP = "manual_stop"
    TIME_LIMIT = "time_limit"


@dataclass
class ExperimentConfig:
    """Configuration for A/B testing experiment."""
    experiment_id: str
    service_type: str
    control_threshold: float
    test_threshold: float
    experiment_duration_days: int
    minimum_sample_size: int
    significance_level: float
    power: float
    effect_size: float
    traffic_split: float  # Percentage in test group (0.0 to 1.0)
    early_stopping_enabled: bool
    rollback_on_degradation: bool


@dataclass
class ExperimentStatus:
    """Current status of running experiment."""
    experiment_id: str
    status: ExperimentStatus
    start_time: datetime
    end_time: Optional[datetime]
    current_sample_size: int
    control_group_size: int
    test_group_size: int
    days_running: int
    statistical_power: float
    current_p_value: Optional[float]
    effect_size_observed: Optional[float]
    stopping_probability: float


@dataclass
class ExperimentMetrics:
    """Performance metrics for experiment groups."""
    group: ExperimentGroup
    sample_size: int
    violation_rate: float
    mean_performance: float
    std_performance: float
    percentile_95: float
    percentile_99: float
    improvement_rate: float


@dataclass
class StatisticalAnalysis:
    """Statistical analysis results for A/B test."""
    p_value: float
    confidence_interval: Tuple[float, float]
    effect_size: float
    statistical_power: float
    significance_level: float
    test_statistic: float
    degrees_of_freedom: int
    test_method: str


@dataclass
class ExperimentResult:
    """Complete A/B test experiment results."""
    experiment_id: str
    service_type: str
    experiment_config: ExperimentConfig
    control_metrics: ExperimentMetrics
    test_metrics: ExperimentMetrics
    statistical_analysis: StatisticalAnalysis
    business_impact: Dict[str, float]
    recommendation: str
    confidence_score: float
    completion_timestamp: datetime


class SLAABTestingService:
    """
    A/B testing service for SLA threshold optimization.
    Provides controlled experimentation with statistical rigor.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.min_sample_size = 100
        self.default_significance_level = 0.05
        self.default_power = 0.8
        self.check_interval_hours = 6
        
        # Statistical parameters
        self.early_stopping_check_frequency = 24  # hours
        self.minimum_experiment_duration = 3  # days
        self.maximum_experiment_duration = 30  # days
    
    async def create_experiment(
        self,
        service_type: str,
        control_threshold: float,
        test_threshold: float,
        experiment_duration_days: int = 14,
        traffic_split: float = 0.5,
        significance_level: float = 0.05,
        power: float = 0.8
    ) -> ExperimentConfig:
        """
        Create a new A/B testing experiment for threshold optimization.
        
        Args:
            service_type: Type of SLA service to test
            control_threshold: Current threshold value
            test_threshold: Proposed new threshold value
            experiment_duration_days: Maximum duration in days
            traffic_split: Fraction of traffic assigned to test group
            significance_level: Statistical significance level (alpha)
            power: Statistical power (1 - beta)
            
        Returns:
            Experiment configuration
        """
        try:
            experiment_id = str(uuid.uuid4())
            
            # Calculate required sample size
            effect_size = self._calculate_effect_size(control_threshold, test_threshold)
            min_sample_size = self._calculate_required_sample_size(
                effect_size, significance_level, power
            )
            
            config = ExperimentConfig(
                experiment_id=experiment_id,
                service_type=service_type,
                control_threshold=control_threshold,
                test_threshold=test_threshold,
                experiment_duration_days=experiment_duration_days,
                minimum_sample_size=min_sample_size,
                significance_level=significance_level,
                power=power,
                effect_size=effect_size,
                traffic_split=traffic_split,
                early_stopping_enabled=True,
                rollback_on_degradation=True
            )
            
            # Store experiment configuration
            await self._store_experiment_config(config)
            
            logger.info(f"Created A/B experiment {experiment_id} for {service_type}")
            return config
            
        except Exception as e:
            logger.error(f"Failed to create experiment: {e}")
            raise
    
    async def start_experiment(self, experiment_id: str) -> bool:
        """Start a configured A/B testing experiment."""
        try:
            config = await self._get_experiment_config(experiment_id)
            if not config:
                raise ValueError(f"Experiment {experiment_id} not found")
            
            # Initialize experiment tracking
            await self._initialize_experiment_tracking(config)
            
            # Start background monitoring
            asyncio.create_task(self._monitor_experiment(experiment_id))
            
            logger.info(f"Started A/B experiment {experiment_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start experiment {experiment_id}: {e}")
            return False
    
    async def get_experiment_status(self, experiment_id: str) -> Optional[ExperimentStatus]:
        """Get current status of running experiment."""
        try:
            # Get experiment data from database
            experiment_data = await self._get_experiment_data(experiment_id)
            if not experiment_data:
                return None
            
            config = experiment_data['config']
            metrics = experiment_data['metrics']
            
            # Calculate current statistics
            current_p_value = None
            effect_size_observed = None
            statistical_power = 0.0
            
            if len(metrics['control']) >= 10 and len(metrics['test']) >= 10:
                control_violations = [m['violation'] for m in metrics['control']]
                test_violations = [m['violation'] for m in metrics['test']]
                
                # Perform statistical test
                stat, p_value = stats.chi2_contingency([
                    [sum(control_violations), len(control_violations) - sum(control_violations)],
                    [sum(test_violations), len(test_violations) - sum(test_violations)]
                ])[:2]
                
                current_p_value = float(p_value)
                
                # Calculate observed effect size
                control_rate = np.mean(control_violations)
                test_rate = np.mean(test_violations)
                effect_size_observed = abs(test_rate - control_rate)
                
                # Calculate current statistical power
                statistical_power = self._calculate_statistical_power(
                    len(metrics['control']), len(metrics['test']), 
                    effect_size_observed, config.significance_level
                )
            
            # Calculate stopping probability
            days_running = (datetime.utcnow() - experiment_data['start_time']).days
            stopping_probability = self._calculate_stopping_probability(
                days_running, current_p_value, statistical_power, config
            )
            
            return ExperimentStatus(
                experiment_id=experiment_id,
                status=experiment_data['status'],
                start_time=experiment_data['start_time'],
                end_time=experiment_data.get('end_time'),
                current_sample_size=len(metrics['control']) + len(metrics['test']),
                control_group_size=len(metrics['control']),
                test_group_size=len(metrics['test']),
                days_running=days_running,
                statistical_power=statistical_power,
                current_p_value=current_p_value,
                effect_size_observed=effect_size_observed,
                stopping_probability=stopping_probability
            )
            
        except Exception as e:
            logger.error(f"Failed to get experiment status: {e}")
            return None
    
    async def stop_experiment(
        self, 
        experiment_id: str, 
        reason: StoppingReason = StoppingReason.MANUAL_STOP
    ) -> bool:
        """Stop a running experiment."""
        try:
            # Update experiment status
            await self._update_experiment_status(experiment_id, ExperimentStatus.COMPLETED)
            
            # Generate final results
            results = await self.analyze_experiment_results(experiment_id)
            
            if results:
                await self._store_experiment_results(results)
                logger.info(f"Stopped experiment {experiment_id} with reason: {reason.value}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to stop experiment {experiment_id}: {e}")
            return False
    
    async def analyze_experiment_results(self, experiment_id: str) -> Optional[ExperimentResult]:
        """Analyze A/B test results and generate recommendations."""
        try:
            experiment_data = await self._get_experiment_data(experiment_id)
            if not experiment_data:
                return None
            
            config = experiment_data['config']
            metrics = experiment_data['metrics']
            
            # Calculate group metrics
            control_metrics = self._calculate_group_metrics(
                metrics['control'], ExperimentGroup.CONTROL
            )
            test_metrics = self._calculate_group_metrics(
                metrics['test'], ExperimentGroup.TEST
            )
            
            # Perform statistical analysis
            statistical_analysis = self._perform_statistical_analysis(
                metrics['control'], metrics['test'], config.significance_level
            )
            
            # Calculate business impact
            business_impact = self._calculate_business_impact(
                control_metrics, test_metrics
            )
            
            # Generate recommendation
            recommendation, confidence_score = self._generate_recommendation(
                control_metrics, test_metrics, statistical_analysis, business_impact
            )
            
            return ExperimentResult(
                experiment_id=experiment_id,
                service_type=config.service_type,
                experiment_config=config,
                control_metrics=control_metrics,
                test_metrics=test_metrics,
                statistical_analysis=statistical_analysis,
                business_impact=business_impact,
                recommendation=recommendation,
                confidence_score=confidence_score,
                completion_timestamp=datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Failed to analyze experiment results: {e}")
            return None
    
    async def _monitor_experiment(self, experiment_id: str):
        """Background monitoring of experiment progress."""
        try:
            while True:
                await asyncio.sleep(self.check_interval_hours * 3600)  # Check every N hours
                
                status = await self.get_experiment_status(experiment_id)
                if not status or status.status != ExperimentStatus.RUNNING:
                    break
                
                # Check for early stopping conditions
                should_stop, reason = await self._check_early_stopping_conditions(status)
                
                if should_stop:
                    await self.stop_experiment(experiment_id, reason)
                    break
                
                # Check for performance degradation
                if await self._check_performance_degradation(experiment_id):
                    await self.stop_experiment(experiment_id, StoppingReason.PERFORMANCE_DEGRADATION)
                    break
                
        except Exception as e:
            logger.error(f"Error monitoring experiment {experiment_id}: {e}")
    
    def _calculate_effect_size(self, control_threshold: float, test_threshold: float) -> float:
        """Calculate expected effect size for sample size calculation."""
        try:
            # Estimate effect size based on threshold difference
            relative_change = abs(test_threshold - control_threshold) / control_threshold
            
            # Convert to Cohen's d approximation
            # Assumption: larger threshold changes have proportionally larger effect sizes
            effect_size = min(1.0, relative_change * 2.0)  # Cap at 1.0 (large effect)
            
            return max(0.1, effect_size)  # Minimum small effect size
            
        except Exception as e:
            logger.error(f"Failed to calculate effect size: {e}")
            return 0.3  # Default medium effect size
    
    def _calculate_required_sample_size(
        self, 
        effect_size: float, 
        alpha: float, 
        power: float
    ) -> int:
        """Calculate minimum required sample size for experiment."""
        try:
            # Use Cohen's formula for sample size calculation
            # For two-proportion z-test
            
            z_alpha = stats.norm.ppf(1 - alpha/2)  # Two-tailed test
            z_beta = stats.norm.ppf(power)
            
            # Approximate sample size per group
            n_per_group = ((z_alpha + z_beta) ** 2) / (effect_size ** 2)
            
            # Total sample size (both groups)
            total_sample_size = int(n_per_group * 2)
            
            return max(self.min_sample_size, total_sample_size)
            
        except Exception as e:
            logger.error(f"Failed to calculate required sample size: {e}")
            return self.min_sample_size * 2
    
    def _calculate_statistical_power(
        self, 
        control_size: int, 
        test_size: int, 
        observed_effect: float, 
        alpha: float
    ) -> float:
        """Calculate current statistical power of experiment."""
        try:
            if observed_effect == 0:
                return 0.0
            
            # Calculate power for two-proportion test
            n_effective = (control_size * test_size) / (control_size + test_size)
            z_alpha = stats.norm.ppf(1 - alpha/2)
            
            # Power calculation
            z_beta = np.sqrt(n_effective) * observed_effect - z_alpha
            power = stats.norm.cdf(z_beta)
            
            return max(0.0, min(1.0, power))
            
        except Exception as e:
            logger.error(f"Failed to calculate statistical power: {e}")
            return 0.0
    
    def _calculate_stopping_probability(
        self, 
        days_running: int, 
        p_value: Optional[float], 
        power: float, 
        config: ExperimentConfig
    ) -> float:
        """Calculate probability of stopping experiment soon."""
        try:
            stopping_prob = 0.0
            
            # Time-based stopping probability
            time_factor = days_running / config.experiment_duration_days
            stopping_prob += time_factor * 0.3
            
            # Statistical significance factor
            if p_value is not None:
                if p_value < config.significance_level:
                    stopping_prob += 0.5  # High probability if significant
                elif p_value < config.significance_level * 2:
                    stopping_prob += 0.2  # Moderate probability if close
            
            # Power factor
            if power > config.power:
                stopping_prob += 0.2
            
            # Minimum duration factor
            if days_running < self.minimum_experiment_duration:
                stopping_prob *= 0.1  # Reduce probability if too early
            
            return min(1.0, stopping_prob)
            
        except Exception as e:
            logger.error(f"Failed to calculate stopping probability: {e}")
            return 0.0
    
    async def _check_early_stopping_conditions(
        self, 
        status: ExperimentStatus
    ) -> Tuple[bool, StoppingReason]:
        """Check if experiment should be stopped early."""
        try:
            # Check statistical significance
            if (status.current_p_value is not None and 
                status.current_p_value < 0.01 and  # Very significant
                status.statistical_power > 0.8 and
                status.days_running >= self.minimum_experiment_duration):
                return True, StoppingReason.STATISTICAL_SIGNIFICANCE
            
            # Check insufficient data collection
            if (status.days_running > 10 and 
                status.current_sample_size < self.min_sample_size):
                return True, StoppingReason.INSUFFICIENT_DATA
            
            # Check time limit
            if status.days_running >= self.maximum_experiment_duration:
                return True, StoppingReason.TIME_LIMIT
            
            return False, StoppingReason.MANUAL_STOP
            
        except Exception as e:
            logger.error(f"Failed to check early stopping conditions: {e}")
            return False, StoppingReason.MANUAL_STOP
    
    async def _check_performance_degradation(self, experiment_id: str) -> bool:
        """Check if test group shows significant performance degradation."""
        try:
            experiment_data = await self._get_experiment_data(experiment_id)
            if not experiment_data:
                return False
            
            metrics = experiment_data['metrics']
            
            if len(metrics['control']) < 50 or len(metrics['test']) < 50:
                return False  # Insufficient data
            
            # Calculate recent performance (last 24 hours)
            recent_cutoff = datetime.utcnow() - timedelta(hours=24)
            
            recent_control = [m for m in metrics['control'] 
                            if m['timestamp'] > recent_cutoff]
            recent_test = [m for m in metrics['test'] 
                         if m['timestamp'] > recent_cutoff]
            
            if len(recent_control) < 10 or len(recent_test) < 10:
                return False
            
            # Check violation rate increase
            control_violations = np.mean([m['violation'] for m in recent_control])
            test_violations = np.mean([m['violation'] for m in recent_test])
            
            # Flag if test group has >50% higher violation rate
            if test_violations > control_violations * 1.5 and test_violations > 0.2:
                logger.warning(f"Performance degradation detected in experiment {experiment_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to check performance degradation: {e}")
            return False
    
    def _calculate_group_metrics(
        self, 
        group_data: List[Dict], 
        group: ExperimentGroup
    ) -> ExperimentMetrics:
        """Calculate performance metrics for experiment group."""
        try:
            if not group_data:
                return ExperimentMetrics(
                    group=group,
                    sample_size=0,
                    violation_rate=0.0,
                    mean_performance=0.0,
                    std_performance=0.0,
                    percentile_95=0.0,
                    percentile_99=0.0,
                    improvement_rate=0.0
                )
            
            violations = [d['violation'] for d in group_data]
            performance_values = [d['performance_time'] for d in group_data]
            
            violation_rate = np.mean(violations)
            mean_performance = np.mean(performance_values)
            std_performance = np.std(performance_values)
            percentile_95 = np.percentile(performance_values, 95)
            percentile_99 = np.percentile(performance_values, 99)
            
            # Calculate improvement rate (decrease in violations over time)
            if len(group_data) > 20:
                early_violations = violations[:len(violations)//2]
                recent_violations = violations[len(violations)//2:]
                improvement_rate = (np.mean(early_violations) - np.mean(recent_violations)) / np.mean(early_violations)
            else:
                improvement_rate = 0.0
            
            return ExperimentMetrics(
                group=group,
                sample_size=len(group_data),
                violation_rate=float(violation_rate),
                mean_performance=float(mean_performance),
                std_performance=float(std_performance),
                percentile_95=float(percentile_95),
                percentile_99=float(percentile_99),
                improvement_rate=float(improvement_rate)
            )
            
        except Exception as e:
            logger.error(f"Failed to calculate group metrics: {e}")
            return ExperimentMetrics(
                group=group, sample_size=0, violation_rate=0.0,
                mean_performance=0.0, std_performance=0.0,
                percentile_95=0.0, percentile_99=0.0, improvement_rate=0.0
            )
    
    def _perform_statistical_analysis(
        self, 
        control_data: List[Dict], 
        test_data: List[Dict], 
        significance_level: float
    ) -> StatisticalAnalysis:
        """Perform comprehensive statistical analysis of A/B test."""
        try:
            control_violations = [d['violation'] for d in control_data]
            test_violations = [d['violation'] for d in test_data]
            
            # Chi-square test for proportions
            contingency_table = [
                [sum(control_violations), len(control_violations) - sum(control_violations)],
                [sum(test_violations), len(test_violations) - sum(test_violations)]
            ]
            
            chi2_stat, p_value, dof, expected = stats.chi2_contingency(contingency_table)
            
            # Effect size (Cohen's h for proportions)
            p1 = np.mean(control_violations)
            p2 = np.mean(test_violations)
            effect_size = 2 * (np.arcsin(np.sqrt(p2)) - np.arcsin(np.sqrt(p1)))
            
            # Confidence interval for difference in proportions
            se_diff = np.sqrt(p1*(1-p1)/len(control_violations) + p2*(1-p2)/len(test_violations))
            z_critical = stats.norm.ppf(1 - significance_level/2)
            diff = p2 - p1
            ci_lower = diff - z_critical * se_diff
            ci_upper = diff + z_critical * se_diff
            
            # Statistical power
            power = self._calculate_statistical_power(
                len(control_violations), len(test_violations), 
                abs(effect_size), significance_level
            )
            
            return StatisticalAnalysis(
                p_value=float(p_value),
                confidence_interval=(float(ci_lower), float(ci_upper)),
                effect_size=float(effect_size),
                statistical_power=float(power),
                significance_level=significance_level,
                test_statistic=float(chi2_stat),
                degrees_of_freedom=int(dof),
                test_method="Chi-square test for independence"
            )
            
        except Exception as e:
            logger.error(f"Failed to perform statistical analysis: {e}")
            return StatisticalAnalysis(
                p_value=1.0, confidence_interval=(0.0, 0.0), effect_size=0.0,
                statistical_power=0.0, significance_level=significance_level,
                test_statistic=0.0, degrees_of_freedom=1, test_method="Failed"
            )
    
    def _calculate_business_impact(
        self, 
        control_metrics: ExperimentMetrics, 
        test_metrics: ExperimentMetrics
    ) -> Dict[str, float]:
        """Calculate business impact metrics."""
        try:
            if control_metrics.violation_rate == 0:
                violation_rate_change = 0.0
            else:
                violation_rate_change = (test_metrics.violation_rate - control_metrics.violation_rate) / control_metrics.violation_rate
            
            performance_improvement = (control_metrics.mean_performance - test_metrics.mean_performance) / control_metrics.mean_performance
            reliability_improvement = -violation_rate_change  # Negative violation change = positive reliability
            
            # Estimate operational cost impact
            cost_impact = violation_rate_change * -50  # $50 per violation avoided
            
            # Estimate team productivity impact
            productivity_impact = reliability_improvement * 0.1  # 10% productivity per reliability unit
            
            return {
                "violation_rate_change": float(violation_rate_change),
                "performance_improvement": float(performance_improvement),
                "reliability_improvement": float(reliability_improvement),
                "estimated_cost_impact": float(cost_impact),
                "team_productivity_impact": float(productivity_impact)
            }
            
        except Exception as e:
            logger.error(f"Failed to calculate business impact: {e}")
            return {
                "violation_rate_change": 0.0,
                "performance_improvement": 0.0,
                "reliability_improvement": 0.0,
                "estimated_cost_impact": 0.0,
                "team_productivity_impact": 0.0
            }
    
    def _generate_recommendation(
        self,
        control_metrics: ExperimentMetrics,
        test_metrics: ExperimentMetrics,
        statistical_analysis: StatisticalAnalysis,
        business_impact: Dict[str, float]
    ) -> Tuple[str, float]:
        """Generate recommendation based on experiment results."""
        try:
            is_significant = statistical_analysis.p_value < statistical_analysis.significance_level
            effect_is_positive = business_impact["reliability_improvement"] > 0
            
            confidence_factors = []
            
            # Statistical significance factor
            if is_significant:
                confidence_factors.append(0.4)
            else:
                confidence_factors.append(0.1)
            
            # Effect size factor
            effect_magnitude = abs(statistical_analysis.effect_size)
            if effect_magnitude > 0.5:  # Large effect
                confidence_factors.append(0.3)
            elif effect_magnitude > 0.3:  # Medium effect
                confidence_factors.append(0.2)
            else:  # Small effect
                confidence_factors.append(0.1)
            
            # Business impact factor
            if business_impact["reliability_improvement"] > 0.1:
                confidence_factors.append(0.2)
            elif business_impact["reliability_improvement"] > 0.05:
                confidence_factors.append(0.15)
            else:
                confidence_factors.append(0.05)
            
            # Statistical power factor
            if statistical_analysis.statistical_power > 0.8:
                confidence_factors.append(0.1)
            else:
                confidence_factors.append(0.05)
            
            confidence_score = sum(confidence_factors)
            
            # Generate recommendation
            if is_significant and effect_is_positive and confidence_score > 0.7:
                recommendation = f"ADOPT: Test threshold shows statistically significant improvement ({statistical_analysis.p_value:.3f} p-value). " \
                               f"Reliability improved by {business_impact['reliability_improvement']:.1%} with {effect_magnitude:.2f} effect size."
            elif is_significant and not effect_is_positive:
                recommendation = f"REJECT: Test threshold shows statistically significant degradation ({statistical_analysis.p_value:.3f} p-value). " \
                               f"Reliability decreased by {abs(business_impact['reliability_improvement']):.1%}."
            elif not is_significant and statistical_analysis.statistical_power > 0.8:
                recommendation = f"NO CHANGE: No statistically significant difference detected (p={statistical_analysis.p_value:.3f}) " \
                               f"with adequate power ({statistical_analysis.statistical_power:.2f}). Current threshold is optimal."
            else:
                recommendation = f"INCONCLUSIVE: Insufficient evidence to make recommendation. " \
                               f"Consider extending experiment duration or increasing sample size."
            
            return recommendation, float(confidence_score)
            
        except Exception as e:
            logger.error(f"Failed to generate recommendation: {e}")
            return "ERROR: Unable to generate recommendation due to analysis failure.", 0.0
    
    # Mock database operations (in production, these would interact with actual database)
    async def _store_experiment_config(self, config: ExperimentConfig):
        """Store experiment configuration in database."""
        # Mock implementation
        pass
    
    async def _get_experiment_config(self, experiment_id: str) -> Optional[ExperimentConfig]:
        """Retrieve experiment configuration from database."""
        # Mock implementation
        return None
    
    async def _initialize_experiment_tracking(self, config: ExperimentConfig):
        """Initialize experiment tracking in database."""
        # Mock implementation
        pass
    
    async def _get_experiment_data(self, experiment_id: str) -> Optional[Dict]:
        """Get experiment data from database."""
        # Mock implementation - return sample data
        return {
            'config': ExperimentConfig(
                experiment_id=experiment_id,
                service_type='build_time',
                control_threshold=1800.0,
                test_threshold=2100.0,
                experiment_duration_days=14,
                minimum_sample_size=200,
                significance_level=0.05,
                power=0.8,
                effect_size=0.3,
                traffic_split=0.5,
                early_stopping_enabled=True,
                rollback_on_degradation=True
            ),
            'status': ExperimentStatus.RUNNING,
            'start_time': datetime.utcnow() - timedelta(days=5),
            'metrics': {
                'control': [{'violation': np.random.binomial(1, 0.15), 'performance_time': np.random.exponential(1500), 'timestamp': datetime.utcnow() - timedelta(hours=i)} for i in range(150)],
                'test': [{'violation': np.random.binomial(1, 0.10), 'performance_time': np.random.exponential(1400), 'timestamp': datetime.utcnow() - timedelta(hours=i)} for i in range(145)]
            }
        }
    
    async def _update_experiment_status(self, experiment_id: str, status: ExperimentStatus):
        """Update experiment status in database."""
        # Mock implementation
        pass
    
    async def _store_experiment_results(self, results: ExperimentResult):
        """Store experiment results in database."""
        # Mock implementation
        pass