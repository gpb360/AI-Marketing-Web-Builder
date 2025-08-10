"""
Learning Engine Service for Business Workflow Optimization
Story #106: Learning engine from user adoption patterns and workflow success rates

Analyzes workflow performance data to continuously improve template recommendations,
success predictions, and business customizations. Achieves continuous optimization
of the AI-powered business workflow system.
"""

import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import statistics
import json
from dataclasses import dataclass, asdict
from enum import Enum

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc

from app.models.workflow import Workflow, WorkflowExecution, WorkflowCategory
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)


class LearningMetricType(str, Enum):
    """Types of learning metrics tracked by the engine."""
    SUCCESS_RATE = "success_rate"
    CONVERSION_RATE = "conversion_rate"
    SETUP_TIME = "setup_time" 
    USER_ADOPTION = "user_adoption"
    TEMPLATE_EFFECTIVENESS = "template_effectiveness"
    INTEGRATION_SUCCESS = "integration_success"
    ROI_PERFORMANCE = "roi_performance"


@dataclass
class LearningInsight:
    """Individual learning insight from performance data."""
    insight_id: str
    insight_type: LearningMetricType
    confidence: float
    impact_score: float
    business_factors: List[str]
    recommendation: str
    supporting_data: Dict[str, Any]
    timestamp: datetime


@dataclass
class TemplatePerformanceProfile:
    """Performance profile for a specific template type."""
    template_category: str
    industry: str
    business_model: str
    success_rate: float
    avg_conversion_rate: float
    avg_setup_time: float
    user_satisfaction_score: float
    common_customizations: List[str]
    performance_factors: Dict[str, float]


@dataclass
class BusinessSegmentProfile:
    """Performance profile for specific business segment."""
    industry: str
    company_size: str
    marketing_maturity: str
    preferred_categories: List[str]
    success_patterns: List[str]
    avg_roi: Tuple[float, float]
    optimal_complexity: str
    recommended_integrations: List[str]


class LearningEngine:
    """Learning engine for continuous workflow optimization."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.insights_cache: Dict[str, List[LearningInsight]] = {}
        self.performance_profiles: Dict[str, TemplatePerformanceProfile] = {}
        self.business_segments: Dict[str, BusinessSegmentProfile] = {}
        
    async def process_workflow_performance_data(
        self,
        performance_data: List[Dict[str, Any]],
        time_window_days: int = 30
    ) -> Dict[str, Any]:
        """
        Process workflow performance data to extract learning insights.
        
        Args:
            performance_data: List of workflow performance records
            time_window_days: Time window for analysis
            
        Returns:
            Learning insights and updated recommendations
        """
        try:
            # Analyze performance patterns
            insights = await self._extract_performance_insights(performance_data)
            
            # Update template performance profiles
            await self._update_template_profiles(performance_data)
            
            # Update business segment profiles
            await self._update_business_segments(performance_data)
            
            # Generate optimization recommendations
            recommendations = await self._generate_optimization_recommendations(insights)
            
            # Update prediction models
            model_updates = await self._update_prediction_models(insights)
            
            # Cache insights for future use
            cache_key = f"insights_{datetime.utcnow().strftime('%Y%m%d')}"
            self.insights_cache[cache_key] = insights
            
            result = {
                "insights_processed": len(insights),
                "template_profiles_updated": len(self.performance_profiles),
                "business_segments_updated": len(self.business_segments),
                "optimization_recommendations": recommendations,
                "model_improvements": model_updates,
                "processing_timestamp": datetime.utcnow().isoformat(),
                "confidence_score": self._calculate_overall_confidence(insights)
            }
            
            logger.info(f"Processed learning data: {len(insights)} insights generated")
            return result
            
        except Exception as e:
            logger.error(f"Error processing learning data: {str(e)}")
            raise
    
    async def _extract_performance_insights(
        self,
        performance_data: List[Dict[str, Any]]
    ) -> List[LearningInsight]:
        """Extract actionable insights from performance data."""
        insights = []
        
        # Group data by relevant dimensions
        by_category = defaultdict(list)
        by_industry = defaultdict(list)
        by_business_model = defaultdict(list)
        
        for record in performance_data:
            category = record.get("category", "unknown")
            industry = record.get("business_context", {}).get("business_classification", {}).get("industry", "unknown")
            business_model = record.get("business_context", {}).get("business_classification", {}).get("business_model", "unknown")
            
            by_category[category].append(record)
            by_industry[industry].append(record)
            by_business_model[business_model].append(record)
        
        # Analyze category performance patterns
        for category, records in by_category.items():
            if len(records) >= 5:  # Minimum sample size
                category_insights = await self._analyze_category_performance(category, records)
                insights.extend(category_insights)
        
        # Analyze industry-specific patterns
        for industry, records in by_industry.items():
            if len(records) >= 10:  # Higher threshold for industry insights
                industry_insights = await self._analyze_industry_performance(industry, records)
                insights.extend(industry_insights)
        
        # Analyze cross-dimensional patterns
        cross_insights = await self._analyze_cross_dimensional_patterns(performance_data)
        insights.extend(cross_insights)
        
        return insights
    
    async def _analyze_category_performance(
        self,
        category: str,
        records: List[Dict[str, Any]]
    ) -> List[LearningInsight]:
        """Analyze performance patterns for a specific category."""
        insights = []
        
        # Calculate performance metrics
        success_rates = [r.get("success_rate", 0) for r in records]
        setup_times = [r.get("avg_execution_time", 0) for r in records if r.get("avg_execution_time", 0) > 0]
        trigger_counts = [r.get("trigger_count", 0) for r in records]
        
        if not success_rates:
            return insights
        
        avg_success_rate = statistics.mean(success_rates)
        success_rate_std = statistics.stdev(success_rates) if len(success_rates) > 1 else 0
        
        # High-performing category insight
        if avg_success_rate > 0.8 and len(records) >= 10:
            insights.append(LearningInsight(
                insight_id=f"category_high_performance_{category}_{datetime.utcnow().timestamp()}",
                insight_type=LearningMetricType.SUCCESS_RATE,
                confidence=min(0.95, avg_success_rate),
                impact_score=0.8,
                business_factors=[category, "workflow_design", "user_adoption"],
                recommendation=f"Prioritize {category} workflows - showing {avg_success_rate:.1%} success rate",
                supporting_data={
                    "sample_size": len(records),
                    "avg_success_rate": avg_success_rate,
                    "std_deviation": success_rate_std,
                    "category": category
                },
                timestamp=datetime.utcnow()
            ))
        
        # Setup time optimization insight
        if setup_times:
            avg_setup_time = statistics.mean(setup_times)
            if avg_setup_time > 1800:  # > 30 minutes
                insights.append(LearningInsight(
                    insight_id=f"category_setup_optimization_{category}_{datetime.utcnow().timestamp()}",
                    insight_type=LearningMetricType.SETUP_TIME,
                    confidence=0.7,
                    impact_score=0.6,
                    business_factors=[category, "complexity", "user_experience"],
                    recommendation=f"Simplify {category} workflow setup - current avg: {avg_setup_time/60:.1f} min",
                    supporting_data={
                        "avg_setup_time": avg_setup_time,
                        "category": category,
                        "threshold_exceeded": True
                    },
                    timestamp=datetime.utcnow()
                ))
        
        # Adoption pattern insights
        high_adoption_records = [r for r in records if r.get("trigger_count", 0) > 50]
        if len(high_adoption_records) / len(records) > 0.3:  # > 30% high adoption
            # Analyze common patterns in high-adoption workflows
            common_customizations = self._extract_common_customizations(high_adoption_records)
            
            insights.append(LearningInsight(
                insight_id=f"category_adoption_pattern_{category}_{datetime.utcnow().timestamp()}",
                insight_type=LearningMetricType.USER_ADOPTION,
                confidence=0.8,
                impact_score=0.7,
                business_factors=[category, "customization_patterns", "user_preferences"],
                recommendation=f"Apply successful {category} patterns: {', '.join(common_customizations[:3])}",
                supporting_data={
                    "high_adoption_rate": len(high_adoption_records) / len(records),
                    "common_patterns": common_customizations,
                    "category": category
                },
                timestamp=datetime.utcnow()
            ))
        
        return insights
    
    async def _analyze_industry_performance(
        self,
        industry: str,
        records: List[Dict[str, Any]]
    ) -> List[LearningInsight]:
        """Analyze performance patterns for a specific industry."""
        insights = []
        
        # Category preferences by industry
        category_performance = defaultdict(list)
        for record in records:
            category = record.get("category", "unknown")
            success_rate = record.get("success_rate", 0)
            category_performance[category].append(success_rate)
        
        # Find top-performing categories for this industry
        category_averages = {
            cat: statistics.mean(rates) 
            for cat, rates in category_performance.items() 
            if len(rates) >= 3
        }
        
        if category_averages:
            top_category = max(category_averages.items(), key=lambda x: x[1])
            if top_category[1] > 0.7:
                insights.append(LearningInsight(
                    insight_id=f"industry_category_preference_{industry}_{datetime.utcnow().timestamp()}",
                    insight_type=LearningMetricType.TEMPLATE_EFFECTIVENESS,
                    confidence=0.85,
                    impact_score=0.9,
                    business_factors=[industry, top_category[0], "industry_fit"],
                    recommendation=f"{industry} businesses show strong performance with {top_category[0]} workflows ({top_category[1]:.1%} success rate)",
                    supporting_data={
                        "industry": industry,
                        "top_category": top_category[0],
                        "success_rate": top_category[1],
                        "sample_size": len(category_performance[top_category[0]])
                    },
                    timestamp=datetime.utcnow()
                ))
        
        # Industry-specific optimization patterns
        brand_voice_patterns = defaultdict(list)
        for record in records:
            brand_voice = record.get("business_context", {}).get("content_analysis", {}).get("brand_voice")
            if brand_voice:
                success_rate = record.get("success_rate", 0)
                brand_voice_patterns[brand_voice].append(success_rate)
        
        # Find optimal brand voice for industry
        if brand_voice_patterns:
            optimal_voice = max(brand_voice_patterns.items(), key=lambda x: statistics.mean(x[1]) if x[1] else 0)
            if len(optimal_voice[1]) >= 3 and statistics.mean(optimal_voice[1]) > 0.75:
                insights.append(LearningInsight(
                    insight_id=f"industry_brand_voice_{industry}_{datetime.utcnow().timestamp()}",
                    insight_type=LearningMetricType.TEMPLATE_EFFECTIVENESS,
                    confidence=0.8,
                    impact_score=0.7,
                    business_factors=[industry, optimal_voice[0], "brand_alignment"],
                    recommendation=f"{industry} businesses perform best with {optimal_voice[0]} brand voice",
                    supporting_data={
                        "industry": industry,
                        "optimal_brand_voice": optimal_voice[0],
                        "avg_success_rate": statistics.mean(optimal_voice[1])
                    },
                    timestamp=datetime.utcnow()
                ))
        
        return insights
    
    async def _analyze_cross_dimensional_patterns(
        self,
        performance_data: List[Dict[str, Any]]
    ) -> List[LearningInsight]:
        """Analyze patterns across multiple dimensions."""
        insights = []
        
        # Integration success patterns
        integration_patterns = defaultdict(lambda: {"success": 0, "total": 0})
        
        for record in performance_data:
            customizations = record.get("customizations", [])
            success_rate = record.get("success_rate", 0)
            
            for customization in customizations:
                integration_type = customization.get("component", "unknown")
                integration_patterns[integration_type]["total"] += 1
                if success_rate > 0.7:
                    integration_patterns[integration_type]["success"] += 1
        
        # Find most successful integration patterns
        successful_integrations = []
        for integration, stats in integration_patterns.items():
            if stats["total"] >= 5:
                success_ratio = stats["success"] / stats["total"]
                if success_ratio > 0.8:
                    successful_integrations.append((integration, success_ratio, stats["total"]))
        
        if successful_integrations:
            # Sort by success rate and sample size
            successful_integrations.sort(key=lambda x: (x[1], x[2]), reverse=True)
            top_integration = successful_integrations[0]
            
            insights.append(LearningInsight(
                insight_id=f"integration_success_pattern_{datetime.utcnow().timestamp()}",
                insight_type=LearningMetricType.INTEGRATION_SUCCESS,
                confidence=min(0.9, top_integration[1]),
                impact_score=0.8,
                business_factors=["integration_type", "customization_effectiveness"],
                recommendation=f"Prioritize {top_integration[0]} integrations - {top_integration[1]:.1%} success rate",
                supporting_data={
                    "integration_type": top_integration[0],
                    "success_rate": top_integration[1],
                    "sample_size": top_integration[2]
                },
                timestamp=datetime.utcnow()
            ))
        
        # Time-based performance patterns
        time_performance = defaultdict(list)
        current_time = datetime.utcnow()
        
        for record in performance_data:
            workflow_age = record.get("age_days", 0)
            success_rate = record.get("success_rate", 0)
            
            if workflow_age < 7:
                time_performance["new"].append(success_rate)
            elif workflow_age < 30:
                time_performance["mature"].append(success_rate) 
            else:
                time_performance["established"].append(success_rate)
        
        # Analyze maturation patterns
        if all(len(time_performance[period]) >= 5 for period in ["new", "mature"]):
            new_avg = statistics.mean(time_performance["new"])
            mature_avg = statistics.mean(time_performance["mature"])
            
            if mature_avg > new_avg * 1.2:  # 20% improvement with maturation
                insights.append(LearningInsight(
                    insight_id=f"workflow_maturation_pattern_{datetime.utcnow().timestamp()}",
                    insight_type=LearningMetricType.USER_ADOPTION,
                    confidence=0.8,
                    impact_score=0.6,
                    business_factors=["workflow_age", "optimization", "user_learning"],
                    recommendation=f"Workflows improve {((mature_avg/new_avg - 1) * 100):.1f}% after 1-4 weeks - encourage patience and optimization",
                    supporting_data={
                        "new_avg_success": new_avg,
                        "mature_avg_success": mature_avg,
                        "improvement_ratio": mature_avg / new_avg
                    },
                    timestamp=datetime.utcnow()
                ))
        
        return insights
    
    async def _update_template_profiles(self, performance_data: List[Dict[str, Any]]) -> None:
        """Update template performance profiles based on new data."""
        profile_updates = defaultdict(list)
        
        for record in performance_data:
            # Create profile key
            category = record.get("category", "unknown")
            business_context = record.get("business_context", {})
            industry = business_context.get("business_classification", {}).get("industry", "unknown")
            business_model = business_context.get("business_classification", {}).get("business_model", "unknown")
            
            profile_key = f"{category}_{industry}_{business_model}"
            profile_updates[profile_key].append(record)
        
        # Update or create profiles
        for profile_key, records in profile_updates.items():
            if len(records) >= 3:  # Minimum sample size
                await self._update_single_template_profile(profile_key, records)
    
    async def _update_single_template_profile(
        self,
        profile_key: str,
        records: List[Dict[str, Any]]
    ) -> None:
        """Update a single template performance profile."""
        try:
            parts = profile_key.split("_")
            category = parts[0]
            industry = parts[1] if len(parts) > 1 else "unknown"
            business_model = parts[2] if len(parts) > 2 else "unknown"
            
            # Calculate metrics
            success_rates = [r.get("success_rate", 0) for r in records]
            setup_times = [r.get("avg_execution_time", 0) for r in records if r.get("avg_execution_time", 0) > 0]
            
            # Extract common customizations
            all_customizations = []
            for record in records:
                customizations = record.get("customizations", [])
                for custom in customizations:
                    component = custom.get("component")
                    if component:
                        all_customizations.append(component)
            
            common_customizations = [
                item for item, count in Counter(all_customizations).most_common(5)
            ]
            
            # Create or update profile
            profile = TemplatePerformanceProfile(
                template_category=category,
                industry=industry,
                business_model=business_model,
                success_rate=statistics.mean(success_rates) if success_rates else 0,
                avg_conversion_rate=0.15,  # Placeholder - would be calculated from actual data
                avg_setup_time=statistics.mean(setup_times) if setup_times else 0,
                user_satisfaction_score=0.8,  # Placeholder - would be from user feedback
                common_customizations=common_customizations,
                performance_factors={
                    "sample_size": len(records),
                    "success_variance": statistics.stdev(success_rates) if len(success_rates) > 1 else 0,
                    "consistency_score": 1 - (statistics.stdev(success_rates) if len(success_rates) > 1 else 0)
                }
            )
            
            self.performance_profiles[profile_key] = profile
            
        except Exception as e:
            logger.warning(f"Failed to update template profile {profile_key}: {str(e)}")
    
    async def _update_business_segments(self, performance_data: List[Dict[str, Any]]) -> None:
        """Update business segment profiles."""
        segment_data = defaultdict(list)
        
        for record in performance_data:
            business_context = record.get("business_context", {})
            classification = business_context.get("business_classification", {})
            maturity = business_context.get("marketing_maturity", {})
            
            industry = classification.get("industry", "unknown")
            company_size = classification.get("company_size", "unknown")
            maturity_level = maturity.get("level", "unknown")
            
            segment_key = f"{industry}_{company_size}_{maturity_level}"
            segment_data[segment_key].append(record)
        
        # Update segments with sufficient data
        for segment_key, records in segment_data.items():
            if len(records) >= 5:
                await self._update_single_business_segment(segment_key, records)
    
    async def _update_single_business_segment(
        self,
        segment_key: str,
        records: List[Dict[str, Any]]
    ) -> None:
        """Update a single business segment profile."""
        try:
            parts = segment_key.split("_")
            industry = parts[0]
            company_size = parts[1] if len(parts) > 1 else "unknown"
            maturity_level = parts[2] if len(parts) > 2 else "unknown"
            
            # Analyze preferred categories
            category_counts = Counter(record.get("category", "unknown") for record in records)
            preferred_categories = [cat for cat, _ in category_counts.most_common(3)]
            
            # Extract success patterns
            high_success_records = [r for r in records if r.get("success_rate", 0) > 0.8]
            success_patterns = []
            
            if high_success_records:
                # Analyze patterns in high-success workflows
                for record in high_success_records:
                    customizations = record.get("customizations", [])
                    for custom in customizations:
                        if custom.get("reason"):
                            success_patterns.append(custom["reason"])
            
            common_success_patterns = [
                pattern for pattern, _ in Counter(success_patterns).most_common(3)
            ]
            
            # Create segment profile
            segment_profile = BusinessSegmentProfile(
                industry=industry,
                company_size=company_size,
                marketing_maturity=maturity_level,
                preferred_categories=preferred_categories,
                success_patterns=common_success_patterns,
                avg_roi=(200.0, 400.0),  # Placeholder - would calculate from actual data
                optimal_complexity="moderate",  # Would determine from data
                recommended_integrations=["email", "crm"]  # Would extract from successful workflows
            )
            
            self.business_segments[segment_key] = segment_profile
            
        except Exception as e:
            logger.warning(f"Failed to update business segment {segment_key}: {str(e)}")
    
    async def _generate_optimization_recommendations(
        self,
        insights: List[LearningInsight]
    ) -> List[Dict[str, Any]]:
        """Generate actionable optimization recommendations."""
        recommendations = []
        
        # Group insights by type and impact
        high_impact_insights = [i for i in insights if i.impact_score > 0.7]
        
        for insight in high_impact_insights:
            recommendation = {
                "recommendation_id": f"rec_{insight.insight_id}",
                "type": insight.insight_type.value,
                "priority": "high" if insight.impact_score > 0.8 else "medium",
                "confidence": insight.confidence,
                "action": insight.recommendation,
                "expected_impact": f"{insight.impact_score * 100:.0f}% improvement",
                "implementation_effort": self._estimate_implementation_effort(insight),
                "business_factors": insight.business_factors,
                "supporting_metrics": insight.supporting_data
            }
            recommendations.append(recommendation)
        
        return recommendations
    
    async def _update_prediction_models(
        self,
        insights: List[LearningInsight]
    ) -> Dict[str, Any]:
        """Update prediction models based on learning insights."""
        # This would integrate with ML models in a production system
        # For now, we'll return model improvement suggestions
        
        model_updates = {
            "success_prediction_adjustments": [],
            "roi_estimation_improvements": [],
            "template_ranking_updates": [],
            "customization_recommendations": []
        }
        
        for insight in insights:
            if insight.insight_type == LearningMetricType.SUCCESS_RATE:
                model_updates["success_prediction_adjustments"].append({
                    "adjustment_type": "category_bias",
                    "parameters": insight.supporting_data,
                    "confidence": insight.confidence
                })
            
            elif insight.insight_type == LearningMetricType.TEMPLATE_EFFECTIVENESS:
                model_updates["template_ranking_updates"].append({
                    "ranking_boost": insight.impact_score,
                    "criteria": insight.business_factors,
                    "evidence": insight.supporting_data
                })
        
        return model_updates
    
    def _extract_common_customizations(self, records: List[Dict[str, Any]]) -> List[str]:
        """Extract common customization patterns from records."""
        all_customizations = []
        
        for record in records:
            customizations = record.get("customizations", [])
            for custom in customizations:
                if custom.get("component"):
                    all_customizations.append(custom["component"])
        
        # Return most common customizations
        return [item for item, _ in Counter(all_customizations).most_common(5)]
    
    def _estimate_implementation_effort(self, insight: LearningInsight) -> str:
        """Estimate the effort required to implement an insight."""
        # Simple heuristic based on insight type and complexity
        if insight.insight_type in [LearningMetricType.SUCCESS_RATE, LearningMetricType.TEMPLATE_EFFECTIVENESS]:
            return "low"  # Mainly configuration changes
        elif insight.insight_type in [LearningMetricType.SETUP_TIME, LearningMetricType.USER_ADOPTION]:
            return "medium"  # UI/UX improvements needed
        else:
            return "high"  # Significant system changes required
    
    def _calculate_overall_confidence(self, insights: List[LearningInsight]) -> float:
        """Calculate overall confidence score for the learning batch."""
        if not insights:
            return 0.0
        
        # Weight by impact score and average confidence
        weighted_confidences = [
            insight.confidence * insight.impact_score 
            for insight in insights
        ]
        
        total_weight = sum(insight.impact_score for insight in insights)
        
        if total_weight == 0:
            return 0.0
        
        return sum(weighted_confidences) / total_weight
    
    async def get_recommendations_for_business(
        self,
        business_analysis: Dict[str, Any],
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get personalized recommendations for a specific business."""
        # Extract business characteristics
        classification = business_analysis.get("business_classification", {})
        industry = classification.get("industry", "unknown")
        company_size = classification.get("company_size", "unknown")
        maturity = business_analysis.get("marketing_maturity", {}).get("level", "unknown")
        
        # Find relevant insights
        relevant_insights = []
        
        for insights_list in self.insights_cache.values():
            for insight in insights_list:
                # Check if insight is relevant to this business
                if (industry in insight.business_factors or 
                    company_size in insight.business_factors or
                    maturity in insight.business_factors):
                    relevant_insights.append(insight)
        
        # Sort by relevance and confidence
        relevant_insights.sort(
            key=lambda x: (x.confidence * x.impact_score), 
            reverse=True
        )
        
        # Convert to recommendation format
        recommendations = []
        for insight in relevant_insights[:limit]:
            recommendations.append({
                "recommendation": insight.recommendation,
                "confidence": insight.confidence,
                "impact": insight.impact_score,
                "type": insight.insight_type.value,
                "business_factors": insight.business_factors,
                "timestamp": insight.timestamp.isoformat()
            })
        
        return recommendations
    
    async def export_learning_model(self) -> Dict[str, Any]:
        """Export the current learning model for backup or transfer."""
        return {
            "performance_profiles": {
                key: asdict(profile) 
                for key, profile in self.performance_profiles.items()
            },
            "business_segments": {
                key: asdict(segment) 
                for key, segment in self.business_segments.items()
            },
            "insights_summary": {
                cache_key: [asdict(insight) for insight in insights]
                for cache_key, insights in self.insights_cache.items()
            },
            "export_timestamp": datetime.utcnow().isoformat(),
            "model_version": "1.0"
        }


# Singleton instance for dependency injection
learning_engine = None

async def get_learning_engine(db: AsyncSession) -> LearningEngine:
    """Get or create learning engine instance."""
    global learning_engine
    if learning_engine is None:
        learning_engine = LearningEngine(db)
    return learning_engine