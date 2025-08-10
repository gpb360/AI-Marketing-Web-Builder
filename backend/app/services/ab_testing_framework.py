"""
Comprehensive A/B testing framework for AI recommendation algorithm optimization.
Provides statistical rigor, real-time monitoring, and automatic optimization.
"""

import asyncio
import logging
import math
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from scipy import stats
from scipy.stats import chi2_contingency, fisher_exact
import json

from app.models.ab_test import ABTest, ABTestVariant, ABTestStatus, ABTestType
from app.models.analytics import (
    RecommendationEvent, TemplateAnalytics, ABTestMetrics, 
    ConversionEvent, UserInteraction, RecommendationAlgorithm,
    EventType
)
from app.models.template import Template
from app.services.ai_service import AIService
from app.core.celery import celery_app

logger = logging.getLogger(__name__)


class StatisticalAnalyzer:
    """Statistical analysis toolkit for A/B testing."""
    
    @staticmethod
    def calculate_sample_size(
        baseline_rate: float,
        minimum_detectable_effect: float,
        power: float = 0.8,
        alpha: float = 0.05
    ) -> int:
        """Calculate required sample size using power analysis."""
        if baseline_rate <= 0 or baseline_rate >= 1:
            raise ValueError("Baseline rate must be between 0 and 1")
        
        # Effect size (Cohen's h for proportions)
        p1 = baseline_rate
        p2 = baseline_rate * (1 + minimum_detectable_effect)
        p2 = min(0.99, max(0.01, p2))  # Clamp between 0.01 and 0.99
        
        # Cohen's h
        h = 2 * (math.asin(math.sqrt(p1)) - math.asin(math.sqrt(p2)))
        
        # Z-scores for power and alpha
        z_alpha = stats.norm.ppf(1 - alpha / 2)
        z_beta = stats.norm.ppf(power)
        
        # Sample size calculation
        n = (z_alpha + z_beta) ** 2 / (h ** 2)
        
        return max(100, int(math.ceil(n)))  # Minimum 100 samples
    
    @staticmethod
    def two_proportion_test(
        n1: int, x1: int, n2: int, x2: int, 
        confidence_level: float = 0.95
    ) -> Dict[str, Any]:
        """Perform two-proportion z-test with confidence intervals."""
        if n1 == 0 or n2 == 0:
            return {"error": "Sample sizes must be greater than 0"}
        
        p1 = x1 / n1
        p2 = x2 / n2
        
        # Pooled proportion for test statistic
        p_pool = (x1 + x2) / (n1 + n2)
        se_pool = math.sqrt(p_pool * (1 - p_pool) * (1/n1 + 1/n2))
        
        # Test statistic
        if se_pool == 0:
            z_score = 0
            p_value = 1.0
        else:
            z_score = (p1 - p2) / se_pool
            p_value = 2 * (1 - stats.norm.cdf(abs(z_score)))
        
        # Confidence interval for difference
        se_diff = math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)
        alpha = 1 - confidence_level
        z_critical = stats.norm.ppf(1 - alpha / 2)
        diff = p1 - p2
        ci_lower = diff - z_critical * se_diff
        ci_upper = diff + z_critical * se_diff
        
        # Effect size (relative improvement)
        relative_improvement = ((p1 - p2) / p2 * 100) if p2 > 0 else 0
        
        return {
            "control_rate": p2,
            "variant_rate": p1,
            "absolute_difference": diff,
            "relative_improvement": relative_improvement,
            "z_score": z_score,
            "p_value": p_value,
            "is_significant": p_value < (1 - confidence_level),
            "confidence_interval": {
                "lower": ci_lower,
                "upper": ci_upper,
                "level": confidence_level
            },
            "effect_size": abs(diff)
        }
    
    @staticmethod
    def bayesian_probability(
        n1: int, x1: int, n2: int, x2: int,
        prior_alpha: float = 1, prior_beta: float = 1
    ) -> Dict[str, Any]:
        """Calculate Bayesian probability that variant is better."""
        # Beta-binomial conjugate prior
        posterior_alpha1 = prior_alpha + x1
        posterior_beta1 = prior_beta + n1 - x1
        
        posterior_alpha2 = prior_alpha + x2
        posterior_beta2 = prior_beta + n2 - x2
        
        # Monte Carlo simulation to estimate P(p1 > p2)
        samples = 10000
        p1_samples = np.random.beta(posterior_alpha1, posterior_beta1, samples)
        p2_samples = np.random.beta(posterior_alpha2, posterior_beta2, samples)
        
        prob_variant_better = np.mean(p1_samples > p2_samples)
        
        # Expected values
        expected_p1 = posterior_alpha1 / (posterior_alpha1 + posterior_beta1)
        expected_p2 = posterior_alpha2 / (posterior_alpha2 + posterior_beta2)
        
        return {
            "probability_variant_better": prob_variant_better,
            "probability_control_better": 1 - prob_variant_better,
            "expected_variant_rate": expected_p1,
            "expected_control_rate": expected_p2,
            "credible_interval_variant": {
                "lower": np.percentile(p1_samples, 2.5),
                "upper": np.percentile(p1_samples, 97.5)
            },
            "credible_interval_control": {
                "lower": np.percentile(p2_samples, 2.5),
                "upper": np.percentile(p2_samples, 97.5)
            }
        }


class ABTestingFramework:
    """Comprehensive A/B testing framework for recommendation algorithms."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AIService()
        self.stats_analyzer = StatisticalAnalyzer()
        
    async def create_recommendation_ab_test(
        self,
        name: str,
        description: str,
        algorithm_variants: List[Dict[str, Any]],
        test_config: Dict[str, Any],
        creator_id: Optional[int] = None
    ) -> ABTest:
        """Create a new A/B test for recommendation algorithms."""
        
        # Calculate required sample size
        baseline_rate = test_config.get("baseline_conversion_rate", 0.15)
        min_effect = test_config.get("minimum_detectable_effect", 0.05)
        
        required_sample_size = self.stats_analyzer.calculate_sample_size(
            baseline_rate=baseline_rate,
            minimum_detectable_effect=min_effect,
            power=test_config.get("power", 0.8),
            alpha=1 - test_config.get("confidence_level", 0.95)
        )
        
        # Create AB test
        ab_test = ABTest(
            name=name,
            description=description,
            test_type=ABTestType.ALGORITHM_COMPARISON,
            primary_metric=test_config.get("primary_metric", "conversion_rate"),
            secondary_metrics=test_config.get("secondary_metrics", []),
            required_sample_size=required_sample_size,
            confidence_level=test_config.get("confidence_level", 0.95),
            power=test_config.get("power", 0.8),
            minimum_detectable_effect=min_effect,
            traffic_allocation=test_config.get("traffic_allocation", 1.0),
            max_duration_days=test_config.get("max_duration_days", 30),
            auto_stop_enabled=test_config.get("auto_stop_enabled", True),
            early_stopping_threshold=test_config.get("early_stopping_threshold", 0.99),
            configuration=test_config,
            created_by=creator_id,
            hypothesis=test_config.get("hypothesis"),
            success_criteria=test_config.get("success_criteria", [])
        )
        
        self.db.add(ab_test)
        await self.db.flush()
        
        # Create variants
        for i, variant_config in enumerate(algorithm_variants):
            variant = ABTestVariant(
                ab_test_id=ab_test.id,
                name=variant_config.get("name", f"Variant {i + 1}"),
                description=variant_config.get("description"),
                is_control=variant_config.get("is_control", i == 0),
                weight=variant_config.get("weight", 1.0),
                template_data={},
                configuration=variant_config
            )
            self.db.add(variant)
        
        await self.db.commit()
        return ab_test
    
    async def create_template_recommendation_test(
        self,
        name: str,
        template_variants: List[int],
        test_config: Dict[str, Any],
        creator_id: Optional[int] = None
    ) -> ABTest:
        """Create A/B test for template recommendations."""
        
        # Get template information
        template_query = select(Template).where(Template.id.in_(template_variants))
        templates = (await self.db.execute(template_query)).scalars().all()
        
        if len(templates) != len(template_variants):
            raise ValueError("Some template IDs not found")
        
        # Calculate sample size based on historical data
        baseline_rate = await self._get_template_baseline_conversion_rate(template_variants[0])
        required_sample_size = self.stats_analyzer.calculate_sample_size(
            baseline_rate=baseline_rate,
            minimum_detectable_effect=test_config.get("minimum_detectable_effect", 0.05)
        )
        
        # Create AB test
        ab_test = ABTest(
            name=name,
            description=f"Template recommendation test: {', '.join([t.name for t in templates])}",
            test_type=ABTestType.TEMPLATE_RECOMMENDATION,
            base_template_id=template_variants[0],
            primary_metric="conversion_rate",
            required_sample_size=required_sample_size,
            configuration=test_config,
            created_by=creator_id
        )
        
        self.db.add(ab_test)
        await self.db.flush()
        
        # Create variants
        for i, template in enumerate(templates):
            variant = ABTestVariant(
                ab_test_id=ab_test.id,
                name=f"{template.name} Variant",
                description=f"Template: {template.name}",
                is_control=i == 0,
                weight=1.0,
                template_data={"template_id": template.id},
                configuration={"template_id": template.id}
            )
            self.db.add(variant)
        
        await self.db.commit()
        return ab_test
    
    async def start_ab_test(self, test_id: int) -> Dict[str, Any]:
        """Start an A/B test and initialize monitoring."""
        ab_test = await self.db.get(ABTest, test_id)
        if not ab_test:
            return {"success": False, "error": "Test not found"}
        
        if ab_test.status != ABTestStatus.DRAFT:
            return {"success": False, "error": "Test can only be started from draft status"}
        
        # Start the test
        ab_test.status = ABTestStatus.RUNNING
        ab_test.started_at = datetime.utcnow()
        ab_test.expected_completion_date = datetime.utcnow() + timedelta(days=ab_test.max_duration_days)
        
        # Initialize real-time results
        ab_test.real_time_results = {
            "started_at": datetime.utcnow().isoformat(),
            "variants": [{
                "id": v.id,
                "name": v.name,
                "is_control": v.is_control,
                "weight": v.weight,
                "metrics": {
                    "views": 0,
                    "conversions": 0,
                    "conversion_rate": 0.0
                }
            } for v in ab_test.variants]
        }
        
        await self.db.commit()
        
        # Schedule monitoring task
        celery_app.send_task(
            "monitor_ab_test",
            args=[test_id],
            countdown=300  # Check every 5 minutes
        )
        
        return {
            "success": True,
            "test_id": test_id,
            "status": "running",
            "expected_completion": ab_test.expected_completion_date.isoformat()
        }
    
    async def record_recommendation_event(
        self,
        session_id: str,
        algorithm_version: str,
        recommendation_type: str,
        recommendation_id: str,
        event_type: EventType,
        ab_test_id: Optional[int] = None,
        variant_id: Optional[int] = None,
        user_id: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Record a recommendation event for A/B testing."""
        
        event = RecommendationEvent(
            session_id=session_id,
            user_id=user_id,
            algorithm_version=algorithm_version,
            recommendation_type=recommendation_type,
            recommendation_id=recommendation_id,
            event_type=event_type,
            ab_test_id=ab_test_id,
            variant_id=variant_id,
            user_context=metadata or {},
            recommendation_metadata=metadata or {}
        )
        
        self.db.add(event)
        
        # Update variant metrics if part of A/B test
        if variant_id:
            variant = await self.db.get(ABTestVariant, variant_id)
            if variant:
                if event_type == EventType.VIEW:
                    variant.views += 1
                elif event_type == EventType.CONVERSION:
                    variant.conversions += 1
                elif event_type == EventType.BOUNCE:
                    variant.bounces += 1
                elif event_type == EventType.INTERACTION:
                    variant.interactions += 1
        
        await self.db.commit()
    
    async def get_ab_test_results(self, test_id: int) -> Dict[str, Any]:
        """Get comprehensive A/B test results with statistical analysis."""
        ab_test = await self.db.get(ABTest, test_id)
        if not ab_test:
            return {"error": "Test not found"}
        
        # Get variants with current metrics
        variants_query = select(ABTestVariant).where(ABTestVariant.ab_test_id == test_id)
        variants = (await self.db.execute(variants_query)).scalars().all()
        
        if len(variants) < 2:
            return {"error": "Need at least 2 variants for comparison"}
        
        # Find control variant
        control = next((v for v in variants if v.is_control), variants[0])
        
        # Calculate statistical significance for each variant vs control
        comparisons = []
        for variant in variants:
            if variant.id == control.id:
                continue
            
            if variant.views > 0 and control.views > 0:
                # Frequentist analysis
                freq_result = self.stats_analyzer.two_proportion_test(
                    n1=variant.views, x1=variant.conversions,
                    n2=control.views, x2=control.conversions,
                    confidence_level=ab_test.confidence_level
                )
                
                # Bayesian analysis
                bayes_result = self.stats_analyzer.bayesian_probability(
                    n1=variant.views, x1=variant.conversions,
                    n2=control.views, x2=control.conversions
                )
                
                comparisons.append({
                    "variant_id": variant.id,
                    "variant_name": variant.name,
                    "frequentist": freq_result,
                    "bayesian": bayes_result,
                    "sample_size": variant.views,
                    "sample_size_progress": variant.views / ab_test.required_sample_size
                })
        
        # Overall test status
        total_sample_size = sum(v.views for v in variants)
        sample_progress = total_sample_size / (ab_test.required_sample_size * len(variants))
        
        # Check for early stopping conditions
        early_stop_recommendation = None
        if ab_test.auto_stop_enabled and sample_progress > 0.1:  # At least 10% of required samples
            significant_variants = [c for c in comparisons if c["frequentist"]["is_significant"]]
            if significant_variants:
                # Find the best performing variant
                best_variant = max(significant_variants, 
                                 key=lambda x: x["frequentist"]["relative_improvement"])
                
                if best_variant["bayesian"]["probability_variant_better"] > ab_test.early_stopping_threshold:
                    early_stop_recommendation = {
                        "should_stop": True,
                        "reason": "Statistical significance reached with high confidence",
                        "winner": best_variant["variant_id"],
                        "confidence": best_variant["bayesian"]["probability_variant_better"]
                    }
        
        return {
            "test_id": test_id,
            "test_name": ab_test.name,
            "status": ab_test.status,
            "test_type": ab_test.test_type,
            "started_at": ab_test.started_at.isoformat() if ab_test.started_at else None,
            "control_variant": {
                "id": control.id,
                "name": control.name,
                "views": control.views,
                "conversions": control.conversions,
                "conversion_rate": control.conversion_rate,
                "bounce_rate": control.bounce_rate
            },
            "variants": [{
                "id": v.id,
                "name": v.name,
                "is_control": v.is_control,
                "views": v.views,
                "conversions": v.conversions,
                "conversion_rate": v.conversion_rate,
                "bounce_rate": v.bounce_rate,
                "revenue_per_visitor": v.revenue_per_visitor
            } for v in variants],
            "statistical_analysis": {
                "sample_progress": sample_progress,
                "required_sample_size": ab_test.required_sample_size,
                "total_sample_size": total_sample_size,
                "comparisons": comparisons,
                "overall_significance": any(c["frequentist"]["is_significant"] for c in comparisons)
            },
            "early_stop_recommendation": early_stop_recommendation,
            "metadata": {
                "confidence_level": ab_test.confidence_level,
                "power": ab_test.power,
                "minimum_detectable_effect": ab_test.minimum_detectable_effect
            }
        }
    
    async def update_realtime_metrics(self, test_id: int) -> Dict[str, Any]:
        """Update real-time metrics for an A/B test."""
        ab_test = await self.db.get(ABTest, test_id)
        if not ab_test or ab_test.status != ABTestStatus.RUNNING:
            return {"error": "Test not found or not running"}
        
        # Aggregate recent events (last hour)
        hour_ago = datetime.utcnow() - timedelta(hours=1)
        
        # Query recent recommendation events
        events_query = select(RecommendationEvent).where(
            and_(
                RecommendationEvent.ab_test_id == test_id,
                RecommendationEvent.created_at >= hour_ago
            )
        )
        recent_events = (await self.db.execute(events_query)).scalars().all()
        
        # Update AB test metrics
        for variant in ab_test.variants:
            variant_events = [e for e in recent_events if e.variant_id == variant.id]
            
            # Count event types
            views = len([e for e in variant_events if e.event_type == EventType.VIEW])
            conversions = len([e for e in variant_events if e.event_type == EventType.CONVERSION])
            bounces = len([e for e in variant_events if e.event_type == EventType.BOUNCE])
            
            # Create or update ABTestMetrics record
            metrics_record = ABTestMetrics(
                ab_test_id=test_id,
                variant_id=variant.id,
                views=views,
                conversions=conversions,
                bounces=bounces,
                conversion_rate=conversions / views if views > 0 else 0,
                bounce_rate=bounces / views if views > 0 else 0
            )
            self.db.add(metrics_record)
        
        await self.db.commit()
        return {"success": True, "updated_at": datetime.utcnow().isoformat()}
    
    async def stop_ab_test(self, test_id: int, reason: str = "Manual stop") -> Dict[str, Any]:
        """Stop an A/B test and finalize results."""
        ab_test = await self.db.get(ABTest, test_id)
        if not ab_test:
            return {"error": "Test not found"}
        
        if ab_test.status != ABTestStatus.RUNNING:
            return {"error": "Test is not running"}
        
        # Get final results
        final_results = await self.get_ab_test_results(test_id)
        
        # Determine winner
        if final_results["statistical_analysis"]["overall_significance"]:
            significant_comparisons = [
                c for c in final_results["statistical_analysis"]["comparisons"]
                if c["frequentist"]["is_significant"]
            ]
            
            if significant_comparisons:
                winner = max(significant_comparisons, 
                           key=lambda x: x["frequentist"]["relative_improvement"])
                ab_test.winning_variant_id = winner["variant_id"]
                ab_test.statistical_significance_reached = True
                ab_test.significance_reached_at = datetime.utcnow()
        
        # Update test status
        ab_test.status = ABTestStatus.COMPLETED
        ab_test.completed_at = datetime.utcnow()
        ab_test.final_results = final_results
        ab_test.stop_reason = reason
        
        await self.db.commit()
        
        return {
            "success": True,
            "test_id": test_id,
            "winner_variant_id": ab_test.winning_variant_id,
            "statistical_significance": ab_test.statistical_significance_reached,
            "final_results": final_results
        }
    
    async def get_recommendation_performance_dashboard(
        self, 
        algorithm_version: Optional[str] = None,
        date_range: int = 7
    ) -> Dict[str, Any]:
        """Get performance dashboard for recommendation algorithms."""
        
        start_date = datetime.utcnow() - timedelta(days=date_range)
        
        # Base query for recommendation events
        base_query = select(RecommendationEvent).where(
            RecommendationEvent.created_at >= start_date
        )
        
        if algorithm_version:
            base_query = base_query.where(
                RecommendationEvent.algorithm_version == algorithm_version
            )
        
        events = (await self.db.execute(base_query)).scalars().all()
        
        # Aggregate metrics by algorithm version
        metrics_by_algorithm = {}
        for event in events:
            alg_version = event.algorithm_version
            if alg_version not in metrics_by_algorithm:
                metrics_by_algorithm[alg_version] = {
                    "views": 0,
                    "clicks": 0,
                    "conversions": 0,
                    "recommendations_shown": 0
                }
            
            metrics = metrics_by_algorithm[alg_version]
            if event.event_type == EventType.VIEW:
                metrics["views"] += 1
            elif event.event_type == EventType.CLICK:
                metrics["clicks"] += 1
            elif event.event_type == EventType.CONVERSION:
                metrics["conversions"] += 1
            elif event.event_type == EventType.RECOMMENDATION_SHOWN:
                metrics["recommendations_shown"] += 1
        
        # Calculate rates
        dashboard_data = {}
        for alg_version, metrics in metrics_by_algorithm.items():
            ctr = metrics["clicks"] / metrics["recommendations_shown"] if metrics["recommendations_shown"] > 0 else 0
            cvr = metrics["conversions"] / metrics["clicks"] if metrics["clicks"] > 0 else 0
            overall_cvr = metrics["conversions"] / metrics["views"] if metrics["views"] > 0 else 0
            
            dashboard_data[alg_version] = {
                **metrics,
                "click_through_rate": ctr,
                "conversion_rate": cvr,
                "overall_conversion_rate": overall_cvr,
                "recommendations_per_view": metrics["recommendations_shown"] / metrics["views"] if metrics["views"] > 0 else 0
            }
        
        # Get active A/B tests
        active_tests_query = select(ABTest).where(ABTest.status == ABTestStatus.RUNNING)
        active_tests = (await self.db.execute(active_tests_query)).scalars().all()
        
        return {
            "date_range": f"Last {date_range} days",
            "algorithm_performance": dashboard_data,
            "active_tests": [{
                "id": test.id,
                "name": test.name,
                "type": test.test_type,
                "started_at": test.started_at.isoformat() if test.started_at else None,
                "progress": await self._calculate_test_progress(test)
            } for test in active_tests],
            "summary": {
                "total_algorithms_tested": len(dashboard_data),
                "total_recommendations": sum(m["recommendations_shown"] for m in dashboard_data.values()),
                "overall_ctr": sum(m["clicks"] for m in dashboard_data.values()) / sum(m["recommendations_shown"] for m in dashboard_data.values()) if sum(m["recommendations_shown"] for m in dashboard_data.values()) > 0 else 0,
                "overall_cvr": sum(m["conversions"] for m in dashboard_data.values()) / sum(m["views"] for m in dashboard_data.values()) if sum(m["views"] for m in dashboard_data.values()) > 0 else 0
            }
        }
    
    async def _get_template_baseline_conversion_rate(self, template_id: int) -> float:
        """Get baseline conversion rate for a template from historical data."""
        # Query recent template analytics
        recent_date = datetime.utcnow() - timedelta(days=30)
        
        analytics_query = select(TemplateAnalytics).where(
            and_(
                TemplateAnalytics.template_id == template_id,
                TemplateAnalytics.date >= recent_date
            )
        )
        
        analytics_records = (await self.db.execute(analytics_query)).scalars().all()
        
        if not analytics_records:
            return 0.15  # Default baseline
        
        total_views = sum(record.views for record in analytics_records)
        total_conversions = sum(record.conversions for record in analytics_records)
        
        return total_conversions / total_views if total_views > 0 else 0.15
    
    async def _calculate_test_progress(self, ab_test: ABTest) -> float:
        """Calculate progress percentage for an A/B test."""
        if not ab_test.started_at:
            return 0.0
        
        # Time-based progress
        elapsed_time = datetime.utcnow() - ab_test.started_at
        planned_duration = timedelta(days=ab_test.max_duration_days)
        time_progress = min(1.0, elapsed_time.total_seconds() / planned_duration.total_seconds())
        
        # Sample size progress
        total_views = sum(variant.views for variant in ab_test.variants)
        required_total_samples = ab_test.required_sample_size * len(ab_test.variants)
        sample_progress = min(1.0, total_views / required_total_samples if required_total_samples > 0 else 0)
        
        # Return the maximum progress (either time or sample based)
        return max(time_progress, sample_progress)


# Celery tasks for automated A/B test monitoring
@celery_app.task
def monitor_ab_test(test_id: int):
    """Monitor A/B test for automatic stopping conditions."""
    logger.info(f"Monitoring A/B test {test_id}")
    
    # This would be implemented with proper async handling
    # For now, just log the monitoring action
    
    # Schedule next monitoring check if test is still running
    celery_app.send_task(
        "monitor_ab_test",
        args=[test_id],
        countdown=300  # Check again in 5 minutes
    )


@celery_app.task
def update_ab_test_metrics():
    """Update real-time metrics for all running A/B tests."""
    logger.info("Updating A/B test metrics")
    # Implementation would update metrics for all active tests


@celery_app.task
def analyze_recommendation_performance():
    """Analyze recommendation algorithm performance and suggest optimizations."""
    logger.info("Analyzing recommendation performance")
    # Implementation would use ML to analyze patterns and suggest improvements