"""
Advanced A/B testing service for template optimization with statistical analysis.
"""

import json
import logging
import uuid
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
import numpy as np
from scipy import stats

from app.models.template import Template
from app.models.ab_test import ABTest, ABTestVariant, ABTestStatus, ABTestResult
from app.services.ai_service import AIService
from app.services.template_service import TemplateService
from app.core.celery import celery_app

logger = logging.getLogger(__name__)


class StatisticalAnalyzer:
    """Statistical analysis utilities for A/B testing."""
    
    @staticmethod
    def calculate_sample_size(
        baseline_rate: float,
        minimum_effect: float = 0.05,
        power: float = 0.8,
        alpha: float = 0.05
    ) -> int:
        """Calculate required sample size for A/B test."""
        if baseline_rate <= 0 or baseline_rate >= 1:
            return 1000
            
        # Cohen's h effect size
        p1 = baseline_rate
        p2 = baseline_rate + minimum_effect
        
        # Standard normal quantiles
        z_alpha = stats.norm.ppf(1 - alpha/2)
        z_beta = stats.norm.ppf(power)
        
        # Pooled proportion
        p_pool = (p1 + p2) / 2
        
        # Sample size calculation
        numerator = (z_alpha * np.sqrt(2 * p_pool * (1 - p_pool)) + 
                    z_beta * np.sqrt(p1 * (1 - p1) + p2 * (1 - p2)))**2
        denominator = (p2 - p1)**2
        
        sample_size = int(np.ceil(numerator / denominator))
        return max(sample_size, 100)  # Minimum 100 samples
    
    @staticmethod
    def calculate_confidence_interval(
        successes: int,
        trials: int,
        confidence: float = 0.95
    ) -> Tuple[float, float]:
        """Calculate Wilson confidence interval for conversion rate."""
        if trials == 0:
            return (0.0, 0.0)
            
        p = successes / trials
        z = stats.norm.ppf(1 - (1 - confidence) / 2)
        
        denominator = 1 + z**2 / trials
        centre = (p + z**2 / (2 * trials)) / denominator
        half_width = z * np.sqrt(p * (1 - p) / trials + z**2 / (4 * trials**2)) / denominator
        
        return (max(0, centre - half_width), min(1, centre + half_width))
    
    @staticmethod
    def perform_chi_square_test(
        variant_a_successes: int,
        variant_a_trials: int,
        variant_b_successes: int,
        variant_b_trials: int
    ) -> Dict[str, Any]:
        """Perform chi-square test for conversion rate difference."""
        if variant_a_trials == 0 or variant_b_trials == 0:
            return {"significant": False, "p_value": 1.0}
            
        # Contingency table
        table = [
            [variant_a_successes, variant_a_trials - variant_a_successes],
            [variant_b_successes, variant_b_trials - variant_b_successes]
        ]
        
        chi2, p_value = stats.chi2_contingency(table)[:2]
        
        return {
            "significant": p_value < 0.05,
            "p_value": float(p_value),
            "chi_square": float(chi2),
            "effect_size": abs(
                variant_b_successes / variant_b_trials - 
                variant_a_successes / variant_a_trials
            )
        }


class ABTestService:
    """A/B testing service for template optimization."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AIService()
        self.template_service = TemplateService(db)
        self.statistical_analyzer = StatisticalAnalyzer()
    
    async def create_ab_test(
        self,
        base_template_id: int,
        test_name: str,
        hypothesis: str,
        primary_metric: str,
        variants_config: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Create a new A/B test with AI-generated variants."""
        try:
            base_template = await self.template_service.get_by_id(base_template_id)
            if not base_template:
                return {"success": False, "error": "Base template not found"}
            
            # Generate AI variants
            ai_variants = await self._generate_ai_variants(
                base_template, variants_config
            )
            
            # Calculate required sample size
            baseline_conversion = await self._get_baseline_conversion(base_template_id)
            required_sample_size = self.statistical_analyzer.calculate_sample_size(
                baseline_conversion
            )
            
            # Create A/B test
            ab_test = ABTest(
                name=test_name,
                description=hypothesis,
                base_template_id=base_template_id,
                primary_metric=primary_metric,
                status=ABTestStatus.DRAFT,
                required_sample_size=required_sample_size,
                estimated_duration_days=14,
                configuration={
                    "baseline_conversion": baseline_conversion,
                    "confidence_level": 0.95,
                    "power": 0.8,
                    "minimum_detectable_effect": 0.05
                }
            )
            
            self.db.add(ab_test)
            await self.db.flush()
            
            # Create variants
            variants = []
            for i, variant_config in enumerate(ai_variants):
                variant = ABTestVariant(
                    ab_test_id=ab_test.id,
                    name=variant_config["name"],
                    description=variant_config["description"],
                    template_data=variant_config["template_data"],
                    weight=1.0 / (len(ai_variants) + 1),  # Equal distribution
                    configuration=variant_config.get("configuration", {})
                )
                variants.append(variant)
                self.db.add(variant)
            
            # Add control variant (original)
            control_variant = ABTestVariant(
                ab_test_id=ab_test.id,
                name="Control (Original)",
                description="Original template as control",
                template_data=base_template.components,
                weight=1.0 / (len(ai_variants) + 1),
                is_control=True,
                configuration={}
            )
            variants.append(control_variant)
            self.db.add(control_variant)
            
            await self.db.commit()
            
            return {
                "success": True,
                "test_id": ab_test.id,
                "test_name": test_name,
                "required_sample_size": required_sample_size,
                "estimated_duration_days": 14,
                "variants": [
                    {
                        "id": v.id,
                        "name": v.name,
                        "description": v.description
                    }
                    for v in variants
                ]
            }
            
        except Exception as e:
            logger.error(f"Error creating A/B test: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def start_ab_test(self, test_id: int) -> Dict[str, Any]:
        """Start an A/B test."""
        try:
            test = await self.db.get(ABTest, test_id)
            if not test:
                return {"success": False, "error": "Test not found"}
            
            if test.status != ABTestStatus.DRAFT:
                return {"success": False, "error": "Test is not in draft status"}
            
            test.status = ABTestStatus.RUNNING
            test.started_at = datetime.utcnow()
            test.expected_completion_date = datetime.utcnow() + timedelta(days=test.estimated_duration_days)
            
            await self.db.commit()
            
            # Queue monitoring task
            celery_app.send_task(
                "monitor_ab_test",
                args=[test_id],
                countdown=3600  # Check in 1 hour
            )
            
            return {
                "success": True,
                "test_id": test_id,
                "status": "running",
                "expected_completion": test.expected_completion_date.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error starting A/B test: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def record_test_event(
        self,
        test_id: int,
        variant_id: int,
        event_type: str,
        user_id: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Record an event for A/B test analysis."""
        try:
            test = await self.db.get(ABTest, test_id)
            if not test:
                return {"success": False, "error": "Test not found"}
            
            variant = await self.db.get(ABTestVariant, variant_id)
            if not variant or variant.ab_test_id != test_id:
                return {"success": False, "error": "Variant not found"}
            
            # Record event based on type
            if event_type == "view":
                variant.views += 1
            elif event_type == "conversion":
                variant.conversions += 1
            elif event_type == "bounce":
                variant.bounces += 1
            
            # Add metadata if provided
            if metadata:
                variant.event_metadata.append({
                    "type": event_type,
                    "timestamp": datetime.utcnow().isoformat(),
                    "metadata": metadata,
                    "user_id": user_id
                })
            
            await self.db.commit()
            
            # Check if test should be analyzed
            if test.status == ABTestStatus.RUNNING:
                await self._check_test_completion(test)
            
            return {"success": True}
            
        except Exception as e:
            logger.error(f"Error recording test event: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_test_results(self, test_id: int) -> Dict[str, Any]:
        """Get comprehensive A/B test results."""
        try:
            test = await self.db.get(ABTest, test_id)
            if not test:
                return {"success": False, "error": "Test not found"}
            
            # Get all variants
            variants = await self.db.execute(
                select(ABTestVariant).where(ABTestVariant.ab_test_id == test_id)
            )
            variants = variants.scalars().all()
            
            # Calculate statistics for each variant
            results = []
            control_variant = None
            
            for variant in variants:
                if variant.is_control:
                    control_variant = variant
                
                conversion_rate = variant.conversions / variant.views if variant.views > 0 else 0
                confidence_interval = self.statistical_analyzer.calculate_confidence_interval(
                    variant.conversions, variant.views
                )
                
                results.append({
                    "variant_id": variant.id,
                    "name": variant.name,
                    "views": variant.views,
                    "conversions": variant.conversions,
                    "conversion_rate": conversion_rate,
                    "confidence_interval": {
                        "lower": confidence_interval[0],
                        "upper": confidence_interval[1]
                    },
                    "is_control": variant.is_control,
                    "is_winner": False  # Will be determined later
                })
            
            # Perform statistical tests
            if control_variant and len(variants) > 1:
                for result in results:
                    if not result["is_control"]:
                        test_result = self.statistical_analyzer.perform_chi_square_test(
                            control_variant.conversions,
                            control_variant.views,
                            result["conversions"],
                            result["views"]
                        )
                        result["statistical_test"] = test_result
                        
                        # Determine winner
                        if (test_result["significant"] and 
                            result["conversion_rate"] > (control_variant.conversions / control_variant.views)):
                            result["is_winner"] = True
            
            # Find overall winner
            winner = max(results, key=lambda x: x["conversion_rate"]) if results else None
            if winner:
                for result in results:
                    result["is_winner"] = (result["variant_id"] == winner["variant_id"] and 
                                         not result["is_control"])
            
            return {
                "success": True,
                "test_id": test_id,
                "test_name": test.name,
                "status": test.status.value,
                "results": results,
                "summary": {
                    "total_views": sum(r["views"] for r in results),
                    "total_conversions": sum(r["conversions"] for r in results),
                    "significant_winner": any(r.get("statistical_test", {}).get("significant", False) 
                                            for r in results),
                    "winner_id": winner["variant_id"] if winner and winner.get("is_winner") else None
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting test results: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def stop_ab_test(self, test_id: int, reason: str = "manual") -> Dict[str, Any]:
        """Stop an A/B test and declare final results."""
        try:
            test = await self.db.get(ABTest, test_id)
            if not test:
                return {"success": False, "error": "Test not found"}
            
            if test.status not in [ABTestStatus.RUNNING, ABTestStatus.COMPLETED]:
                return {"success": False, "error": "Test is not running"}
            
            test.status = ABTestStatus.COMPLETED
            test.completed_at = datetime.utcnow()
            test.stop_reason = reason
            
            # Final analysis
            results = await self.get_test_results(test_id)
            
            # Store final results
            test.final_results = results
            
            await self.db.commit()
            
            return {
                "success": True,
                "test_id": test_id,
                "final_results": results
            }
            
        except Exception as e:
            logger.error(f"Error stopping A/B test: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _generate_ai_variants(
        self,
        base_template: Template,
        variants_config: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate AI-powered test variants."""
        prompt = f"""
        Create A/B test variants for this {base_template.category} template:
        
        TEMPLATE: {base_template.name}
        DESCRIPTION: {base_template.description}
        COMPONENTS: {len(base_template.components)} elements
        
        Generate {len(variants_config)} variants focusing on:
        {json.dumps(variants_config, indent=2)}
        
        Each variant should include:
        1. Specific changes from original
        2. Hypothesis for improvement
        3. Expected impact on conversion
        4. Implementation details
        
        Return JSON with structured variant data.
        """
        
        ai_response = await self.ai_service.generate_json_response(
            prompt,
            expected_schema={
                "variants": List[Dict]
            }
        )
        
        return ai_response.get("variants", [])
    
    async def _get_baseline_conversion(self, template_id: int) -> float:
        """Get baseline conversion rate for template."""
        # Mock implementation - would query analytics
        return 0.15
    
    async def _check_test_completion(self, test: ABTest):
        """Check if A/B test should be completed."""
        try:
            variants = await self.db.execute(
                select(ABTestVariant).where(ABTestVariant.ab_test_id == test.id)
            )
            variants = variants.scalars().all()
            
            total_views = sum(v.views for v in variants)
            
            if total_views >= test.required_sample_size:
                # Auto-complete test
                await self.stop_ab_test(test.id, "sample_size_reached")
                
        except Exception as e:
            logger.error(f"Error checking test completion: {str(e)}")


@celery_app.task
def monitor_ab_test(test_id: int):
    """Monitor A/B test progress and auto-complete if needed."""
    logger.info(f"Monitoring A/B test {test_id}")
    # Implementation would check test status and completion criteria


@celery_app.task
def generate_ab_test_report(test_id: int):
    """Generate comprehensive A/B test report."""
    logger.info(f"Generating report for A/B test {test_id}")
    # Implementation would create detailed analysis and recommendations