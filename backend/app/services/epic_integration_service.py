"""
Epic Integration Service - Managing Epic 1-3-4 System Integration
Orchestrates data flow and optimization between business context, analytics, and AI systems.
"""

import logging
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
import json

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.orm import selectinload

from app.services.base_service import BaseService
from app.services.context_analysis_service import ContextAnalysisService
from app.services.business_analysis_service import BusinessAnalysisService
from app.services.ai_service import AIService
from app.services.workflow_analytics_service import WorkflowAnalyticsService
from app.models.business_context import (
    BusinessContextAnalysis,
    TemplateContextScoring,
    BusinessSuccessPattern,
    EpicIntegrationMetrics
)
from app.models.analytics import SiteAnalytics, ComponentAnalytics
from app.models.template import Template
from app.models.user import User

logger = logging.getLogger(__name__)


@dataclass
class IntegrationResult:
    """Result of Epic integration operation."""
    success: bool
    processing_time_ms: int
    data: Dict[str, Any]
    accuracy_score: Optional[float] = None
    error_message: Optional[str] = None
    integration_type: str = ""
    source_system: str = ""
    target_system: str = ""


@dataclass
class CrossEpicInsight:
    """Insight derived from cross-Epic analysis."""
    insight_type: str
    source_data: Dict[str, Any]
    analysis_result: Dict[str, Any]
    confidence_score: float
    recommendations: List[str]
    impact_assessment: Dict[str, Any]


class EpicIntegrationService(BaseService):
    """Service orchestrating Epic 1-3-4 integration for enhanced AI marketing capabilities."""
    
    def __init__(self, db_session: AsyncSession):
        super().__init__(db_session)
        self.context_service = ContextAnalysisService(db_session)
        self.business_service = BusinessAnalysisService(db_session)
        self.ai_service = AIService()
        self.analytics_service = WorkflowAnalyticsService(db_session)
    
    async def generate_context_enhanced_recommendations(
        self,
        user_id: str,
        business_context: Dict[str, Any],
        performance_constraints: Optional[Dict[str, Any]] = None
    ) -> IntegrationResult:
        """
        Epic 1→Epic 4→Epic 3 Integration: Generate AI recommendations enhanced with business context and performance data.
        """
        start_time = datetime.utcnow()
        
        try:
            # Step 1: Epic 1 - Analyze business context
            context_analysis = await self.context_service.analyze_user_context(
                user_id=user_id,
                context_data=business_context,
                include_historical=True
            )
            
            # Step 2: Epic 3 - Get performance constraints and historical data
            performance_data = await self._get_performance_constraints(
                user_id=user_id,
                industry=business_context.get("industry"),
                constraints=performance_constraints
            )
            
            # Step 3: Epic 4 - Generate AI recommendations with enhanced context
            enhanced_context = {
                **business_context,
                "context_analysis": {
                    "confidence": context_analysis.confidence_level,
                    "recommended_categories": context_analysis.recommended_categories,
                    "success_probability": context_analysis.success_probability
                },
                "performance_data": performance_data,
                "industry_benchmarks": performance_data.get("benchmarks", {})
            }
            
            ai_recommendations = await self.ai_service.generate_component_suggestions(
                context=enhanced_context,
                current_components=[],
                user_preferences={"performance_focused": True}
            )
            
            # Step 4: Cross-Epic optimization
            optimized_recommendations = await self._optimize_recommendations_with_analytics(
                recommendations=ai_recommendations,
                performance_data=performance_data,
                context_analysis=context_analysis
            )
            
            processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            # Track integration success
            await self._track_integration_metrics(
                user_id=user_id,
                integration_type="epic1_to_epic4_to_epic3",
                source_system="business_context",
                target_system="ai_features",
                operation_type="enhanced_recommendations",
                input_data=business_context,
                output_data={"recommendations_count": len(optimized_recommendations)},
                processing_time_ms=processing_time,
                success=True,
                accuracy_score=context_analysis.context_score
            )
            
            return IntegrationResult(
                success=True,
                processing_time_ms=processing_time,
                data={
                    "context_analysis": context_analysis.__dict__,
                    "performance_insights": performance_data,
                    "ai_recommendations": optimized_recommendations,
                    "optimization_applied": True
                },
                accuracy_score=context_analysis.context_score,
                integration_type="epic1_to_epic4_to_epic3",
                source_system="business_context",
                target_system="ai_features"
            )
            
        except Exception as e:
            processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            await self._track_integration_metrics(
                user_id=user_id,
                integration_type="epic1_to_epic4_to_epic3",
                source_system="business_context",
                target_system="ai_features",
                operation_type="enhanced_recommendations",
                input_data=business_context,
                output_data={},
                processing_time_ms=processing_time,
                success=False,
                error_message=str(e)
            )
            
            logger.error(f"Context-enhanced recommendations failed: {e}")
            return IntegrationResult(
                success=False,
                processing_time_ms=processing_time,
                data={},
                error_message=str(e),
                integration_type="epic1_to_epic4_to_epic3",
                source_system="business_context",
                target_system="ai_features"
            )
    
    async def analyze_performance_with_business_context(
        self,
        user_id: str,
        site_id: str,
        business_context: Optional[Dict[str, Any]] = None
    ) -> IntegrationResult:
        """
        Epic 3→Epic 1→Epic 4 Integration: Analyze site performance with business context for AI-powered insights.
        """
        start_time = datetime.utcnow()
        
        try:
            # Step 1: Epic 3 - Get comprehensive performance data
            performance_data = await self._get_comprehensive_performance_data(site_id)
            
            # Step 2: Epic 1 - Get or analyze business context
            if not business_context:
                business_context = await self._infer_business_context_from_performance(
                    performance_data
                )
            
            context_analysis = await self.context_service.analyze_user_context(
                user_id=user_id,
                context_data=business_context,
                include_historical=True
            )
            
            # Step 3: Epic 4 - Generate AI insights with combined data
            combined_analysis_prompt = f"""
            Analyze this website performance data with business context:
            
            Business Context:
            - Industry: {business_context.get('industry', 'Unknown')}
            - Company Size: {business_context.get('company_size', 'Unknown')}
            - Primary Goals: {business_context.get('marketing_goals', [])}
            
            Performance Data:
            - Conversion Rate: {performance_data.get('conversion_rate', 0):.2%}
            - Bounce Rate: {performance_data.get('bounce_rate', 0):.2%}
            - Time on Page: {performance_data.get('avg_session_duration', 0):.1f}s
            - Page Views/Session: {performance_data.get('pages_per_session', 0):.1f}
            
            Context Analysis:
            - Success Probability: {context_analysis.success_probability:.2%}
            - Confidence Level: {context_analysis.confidence_level}
            - Recommended Categories: {context_analysis.recommended_categories}
            
            Provide comprehensive analysis with:
            {{
                "performance_assessment": {{
                    "overall_health": "excellent/good/needs_improvement/poor",
                    "vs_industry_benchmark": "above/at/below average",
                    "vs_business_goals": "exceeding/meeting/missing goals"
                }},
                "context_performance_alignment": {{
                    "industry_typical": true/false,
                    "size_appropriate": true/false,
                    "goal_alignment_score": 0.0-1.0
                }},
                "improvement_opportunities": [
                    {{
                        "area": "specific improvement area",
                        "impact": "high/medium/low",
                        "effort": "low/medium/high",
                        "recommendation": "specific action"
                    }}
                ],
                "business_insights": [
                    "insight about business performance vs context"
                ],
                "strategic_recommendations": [
                    "strategic recommendation based on context + performance"
                ]
            }}
            """
            
            ai_insights = await self.ai_service.generate_json_response(combined_analysis_prompt)
            
            processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            # Track integration success
            await self._track_integration_metrics(
                user_id=user_id,
                integration_type="epic3_to_epic1_to_epic4",
                source_system="analytics",
                target_system="ai_features",
                operation_type="context_performance_analysis",
                input_data={"site_id": site_id, "business_context": business_context},
                output_data=ai_insights,
                processing_time_ms=processing_time,
                success=True,
                accuracy_score=context_analysis.context_score
            )
            
            return IntegrationResult(
                success=True,
                processing_time_ms=processing_time,
                data={
                    "performance_data": performance_data,
                    "business_context": business_context,
                    "context_analysis": context_analysis.__dict__,
                    "ai_insights": ai_insights,
                    "integration_score": self._calculate_integration_score(
                        performance_data, context_analysis, ai_insights
                    )
                },
                accuracy_score=context_analysis.context_score,
                integration_type="epic3_to_epic1_to_epic4",
                source_system="analytics",
                target_system="ai_features"
            )
            
        except Exception as e:
            processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            await self._track_integration_metrics(
                user_id=user_id,
                integration_type="epic3_to_epic1_to_epic4",
                source_system="analytics",
                target_system="ai_features",
                operation_type="context_performance_analysis",
                input_data={"site_id": site_id},
                output_data={},
                processing_time_ms=processing_time,
                success=False,
                error_message=str(e)
            )
            
            logger.error(f"Performance analysis with context failed: {e}")
            return IntegrationResult(
                success=False,
                processing_time_ms=processing_time,
                data={},
                error_message=str(e),
                integration_type="epic3_to_epic1_to_epic4",
                source_system="analytics",
                target_system="ai_features"
            )
    
    async def discover_cross_epic_insights(
        self,
        user_id: str,
        analysis_window_days: int = 30
    ) -> List[CrossEpicInsight]:
        """
        Discover insights by analyzing patterns across Epic 1-3-4 systems.
        """
        try:
            insights = []
            
            # Insight 1: Business Context → Performance Correlation
            context_performance_insight = await self._analyze_context_performance_correlation(
                user_id, analysis_window_days
            )
            if context_performance_insight:
                insights.append(context_performance_insight)
            
            # Insight 2: AI Recommendations → Actual Outcomes
            ai_outcome_insight = await self._analyze_ai_recommendation_outcomes(
                user_id, analysis_window_days
            )
            if ai_outcome_insight:
                insights.append(ai_outcome_insight)
            
            # Insight 3: Industry Patterns → User Performance
            industry_pattern_insight = await self._analyze_industry_pattern_performance(
                user_id, analysis_window_days
            )
            if industry_pattern_insight:
                insights.append(industry_pattern_insight)
            
            # Insight 4: Template Context Scoring → Real Performance
            template_scoring_insight = await self._analyze_template_scoring_accuracy(
                user_id, analysis_window_days
            )
            if template_scoring_insight:
                insights.append(template_scoring_insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Cross-Epic insights discovery failed: {e}")
            return []
    
    async def optimize_business_context_with_performance_data(
        self,
        user_id: str,
        business_context: Dict[str, Any]
    ) -> IntegrationResult:
        """
        Epic 1↔Epic 3 Integration: Optimize business context recommendations using actual performance data.
        """
        start_time = datetime.utcnow()
        
        try:
            # Get user's historical performance data
            historical_performance = await self._get_user_historical_performance(user_id)
            
            # Get industry performance benchmarks
            industry = business_context.get("industry")
            industry_benchmarks = await self._get_industry_performance_benchmarks(industry)
            
            # Use AI to optimize business context
            optimization_prompt = f"""
            Optimize this business context based on performance data:
            
            Current Business Context:
            {json.dumps(business_context, indent=2)}
            
            User's Historical Performance:
            {json.dumps(historical_performance, indent=2)}
            
            Industry Benchmarks:
            {json.dumps(industry_benchmarks, indent=2)}
            
            Provide optimized business context recommendations:
            {{
                "context_adjustments": {{
                    "industry_refinement": "more specific industry categorization",
                    "goal_prioritization": ["reordered goals based on performance"],
                    "audience_targeting": "refined target audience based on data"
                }},
                "performance_insights": {{
                    "strengths": ["areas where user performs well"],
                    "weaknesses": ["areas needing improvement"],
                    "opportunities": ["untapped potential based on context"]
                }},
                "optimization_strategy": {{
                    "immediate_actions": ["quick wins based on data"],
                    "medium_term_goals": ["strategic improvements"],
                    "long_term_vision": ["aspirational targets"]
                }},
                "confidence_score": 0.0-1.0
            }}
            """
            
            optimization_result = await self.ai_service.generate_json_response(optimization_prompt)
            
            processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return IntegrationResult(
                success=True,
                processing_time_ms=processing_time,
                data={
                    "original_context": business_context,
                    "optimization_result": optimization_result,
                    "historical_performance": historical_performance,
                    "industry_benchmarks": industry_benchmarks
                },
                accuracy_score=optimization_result.get("confidence_score", 0.8),
                integration_type="epic1_to_epic3_optimization",
                source_system="business_context",
                target_system="analytics"
            )
            
        except Exception as e:
            processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            logger.error(f"Business context optimization failed: {e}")
            
            return IntegrationResult(
                success=False,
                processing_time_ms=processing_time,
                data={},
                error_message=str(e),
                integration_type="epic1_to_epic3_optimization",
                source_system="business_context",
                target_system="analytics"
            )
    
    # Private helper methods
    
    async def _get_performance_constraints(
        self,
        user_id: str,
        industry: Optional[str] = None,
        constraints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Get performance constraints and benchmarks for recommendations."""
        
        # Get user's historical performance
        user_performance = await self._get_user_historical_performance(user_id)
        
        # Get industry benchmarks
        industry_benchmarks = {}
        if industry:
            industry_benchmarks = await self._get_industry_performance_benchmarks(industry)
        
        # Apply constraints
        performance_constraints = {
            "user_historical": user_performance,
            "industry_benchmarks": industry_benchmarks,
            "target_metrics": constraints or {},
            "benchmarks": {
                "min_conversion_rate": max(
                    user_performance.get("avg_conversion_rate", 0) * 1.1,  # 10% improvement
                    industry_benchmarks.get("avg_conversion_rate", 0.02)
                ),
                "max_bounce_rate": min(
                    user_performance.get("avg_bounce_rate", 1.0) * 0.9,  # 10% improvement
                    industry_benchmarks.get("avg_bounce_rate", 0.5)
                ),
                "min_session_duration": max(
                    user_performance.get("avg_session_duration", 0) * 1.1,
                    industry_benchmarks.get("avg_session_duration", 120)
                )
            }
        }
        
        return performance_constraints
    
    async def _get_comprehensive_performance_data(self, site_id: str) -> Dict[str, Any]:
        """Get comprehensive performance data for a site."""
        
        # Query site analytics
        query = select(SiteAnalytics).where(SiteAnalytics.site_id == site_id)
        result = await self.db_session.execute(query)
        site_analytics = result.scalar_one_or_none()
        
        if not site_analytics:
            return {
                "conversion_rate": 0.0,
                "bounce_rate": 0.5,
                "avg_session_duration": 120,
                "pages_per_session": 1.5,
                "data_available": False
            }
        
        # Query component analytics for detailed insights
        component_query = select(ComponentAnalytics).where(
            ComponentAnalytics.site_id == site_id
        )
        component_result = await self.db_session.execute(component_query)
        component_analytics = component_result.scalars().all()
        
        # Aggregate component performance
        component_performance = {}
        for comp in component_analytics:
            component_performance[comp.component_type] = {
                "conversion_rate": comp.conversion_rate or 0,
                "interaction_rate": comp.interaction_rate or 0,
                "view_time": comp.view_time or 0
            }
        
        return {
            "conversion_rate": site_analytics.conversion_rate or 0,
            "bounce_rate": site_analytics.bounce_rate or 0.5,
            "avg_session_duration": site_analytics.avg_session_duration or 120,
            "pages_per_session": site_analytics.pages_per_session or 1.5,
            "unique_visitors": site_analytics.unique_visitors or 0,
            "total_sessions": site_analytics.total_sessions or 0,
            "component_performance": component_performance,
            "data_available": True,
            "last_updated": site_analytics.updated_at.isoformat() if site_analytics.updated_at else None
        }
    
    async def _get_user_historical_performance(self, user_id: str) -> Dict[str, Any]:
        """Get user's historical performance across all sites."""
        
        query = select(SiteAnalytics).where(SiteAnalytics.user_id == user_id)
        result = await self.db_session.execute(query)
        analytics = result.scalars().all()
        
        if not analytics:
            return {"data_available": False}
        
        # Calculate averages
        total_sites = len(analytics)
        avg_conversion_rate = sum(a.conversion_rate or 0 for a in analytics) / total_sites
        avg_bounce_rate = sum(a.bounce_rate or 0 for a in analytics) / total_sites
        avg_session_duration = sum(a.avg_session_duration or 0 for a in analytics) / total_sites
        avg_pages_per_session = sum(a.pages_per_session or 0 for a in analytics) / total_sites
        
        return {
            "data_available": True,
            "total_sites": total_sites,
            "avg_conversion_rate": avg_conversion_rate,
            "avg_bounce_rate": avg_bounce_rate,
            "avg_session_duration": avg_session_duration,
            "avg_pages_per_session": avg_pages_per_session,
            "performance_trend": "improving" if avg_conversion_rate > 0.03 else "stable"
        }
    
    async def _get_industry_performance_benchmarks(self, industry: str) -> Dict[str, Any]:
        """Get performance benchmarks for an industry."""
        
        query = select(SiteAnalytics).where(SiteAnalytics.industry == industry)
        result = await self.db_session.execute(query)
        industry_analytics = result.scalars().all()
        
        if not industry_analytics:
            # Return default benchmarks
            return {
                "avg_conversion_rate": 0.03,
                "avg_bounce_rate": 0.45,
                "avg_session_duration": 180,
                "avg_pages_per_session": 2.0,
                "data_source": "default_benchmarks"
            }
        
        # Calculate industry averages
        total = len(industry_analytics)
        return {
            "avg_conversion_rate": sum(a.conversion_rate or 0 for a in industry_analytics) / total,
            "avg_bounce_rate": sum(a.bounce_rate or 0 for a in industry_analytics) / total,
            "avg_session_duration": sum(a.avg_session_duration or 0 for a in industry_analytics) / total,
            "avg_pages_per_session": sum(a.pages_per_session or 0 for a in industry_analytics) / total,
            "sample_size": total,
            "data_source": "historical_data"
        }
    
    async def _optimize_recommendations_with_analytics(
        self,
        recommendations: List[Dict[str, Any]],
        performance_data: Dict[str, Any],
        context_analysis
    ) -> List[Dict[str, Any]]:
        """Optimize AI recommendations using performance data."""
        
        optimized = []
        
        for rec in recommendations:
            # Calculate performance-adjusted score
            base_score = rec.get("confidence_score", 0.5)
            
            # Adjust based on performance constraints
            performance_adjustment = 0.0
            
            # If this component type has performed well historically
            component_type = rec.get("component_type", "")
            if component_type in performance_data.get("component_performance", {}):
                comp_perf = performance_data["component_performance"][component_type]
                if comp_perf.get("conversion_rate", 0) > 0.05:  # Above average
                    performance_adjustment += 0.1
            
            # Adjust based on industry benchmarks
            benchmarks = performance_data.get("benchmarks", {})
            if benchmarks.get("min_conversion_rate", 0) > 0.03:  # High-performing context
                performance_adjustment += 0.05
            
            # Apply context analysis boost
            if rec.get("priority") == "high" and context_analysis.confidence_level == "high":
                performance_adjustment += 0.1
            
            # Create optimized recommendation
            optimized_rec = {
                **rec,
                "confidence_score": min(base_score + performance_adjustment, 1.0),
                "optimization_applied": True,
                "performance_insights": {
                    "base_score": base_score,
                    "performance_adjustment": performance_adjustment,
                    "final_score": min(base_score + performance_adjustment, 1.0)
                }
            }
            
            optimized.append(optimized_rec)
        
        # Re-sort by optimized confidence score
        optimized.sort(key=lambda x: x["confidence_score"], reverse=True)
        
        return optimized
    
    async def _infer_business_context_from_performance(
        self,
        performance_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Infer business context from performance patterns."""
        
        # Analyze performance patterns to infer context
        conversion_rate = performance_data.get("conversion_rate", 0)
        bounce_rate = performance_data.get("bounce_rate", 0.5)
        session_duration = performance_data.get("avg_session_duration", 120)
        
        # Infer industry based on performance patterns
        inferred_industry = "technology"  # Default
        if conversion_rate > 0.05 and session_duration > 200:
            inferred_industry = "professional_services"
        elif conversion_rate > 0.08 and bounce_rate < 0.3:
            inferred_industry = "ecommerce"
        elif session_duration > 300:
            inferred_industry = "education"
        
        # Infer company size based on traffic patterns
        unique_visitors = performance_data.get("unique_visitors", 0)
        inferred_size = "small_business"
        if unique_visitors > 10000:
            inferred_size = "medium_business"
        elif unique_visitors > 50000:
            inferred_size = "enterprise"
        
        return {
            "industry": inferred_industry,
            "company_size": inferred_size,
            "marketing_goals": ["lead_generation", "brand_awareness"],
            "target_audience": "business",
            "inferred_from_performance": True,
            "confidence_level": "medium"
        }
    
    async def _calculate_integration_score(
        self,
        performance_data: Dict[str, Any],
        context_analysis,
        ai_insights: Dict[str, Any]
    ) -> float:
        """Calculate integration effectiveness score."""
        
        scores = []
        
        # Data quality score
        if performance_data.get("data_available", False):
            scores.append(0.8)
        else:
            scores.append(0.3)
        
        # Context analysis confidence
        scores.append(context_analysis.context_score)
        
        # AI insights confidence
        ai_confidence = ai_insights.get("performance_assessment", {}).get("confidence", 0.7)
        scores.append(ai_confidence)
        
        # Integration completeness (all systems involved)
        scores.append(0.9)  # High since we're using all three Epics
        
        return sum(scores) / len(scores)
    
    async def _analyze_context_performance_correlation(
        self,
        user_id: str,
        days: int
    ) -> Optional[CrossEpicInsight]:
        """Analyze correlation between business context and performance."""
        
        try:
            # Get user's context analyses and performance data
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            context_query = select(BusinessContextAnalysis).where(
                and_(
                    BusinessContextAnalysis.user_id == user_id,
                    BusinessContextAnalysis.created_at >= cutoff_date
                )
            )
            context_result = await self.db_session.execute(context_query)
            context_analyses = context_result.scalars().all()
            
            if not context_analyses:
                return None
            
            # Analyze patterns
            industry_performance = {}
            goal_outcomes = {}
            
            for analysis in context_analyses:
                industry = analysis.industry
                confidence = analysis.confidence_score or 0
                
                if industry not in industry_performance:
                    industry_performance[industry] = []
                industry_performance[industry].append(confidence)
            
            # Generate insights
            best_industry = max(industry_performance.keys(), 
                              key=lambda k: sum(industry_performance[k]) / len(industry_performance[k]))
            
            return CrossEpicInsight(
                insight_type="context_performance_correlation",
                source_data={"context_analyses": len(context_analyses)},
                analysis_result={
                    "best_performing_industry": best_industry,
                    "industry_performance": industry_performance
                },
                confidence_score=0.8,
                recommendations=[
                    f"Focus on {best_industry} industry strategies",
                    "Leverage high-confidence context patterns"
                ],
                impact_assessment={
                    "potential_improvement": "15-25%",
                    "confidence_level": "high"
                }
            )
            
        except Exception as e:
            logger.error(f"Context-performance correlation analysis failed: {e}")
            return None
    
    async def _analyze_ai_recommendation_outcomes(
        self,
        user_id: str,
        days: int
    ) -> Optional[CrossEpicInsight]:
        """Analyze AI recommendation success rates."""
        # Implementation would analyze template scoring vs actual performance
        return None
    
    async def _analyze_industry_pattern_performance(
        self,
        user_id: str,
        days: int
    ) -> Optional[CrossEpicInsight]:
        """Analyze industry patterns vs user performance."""
        # Implementation would compare user performance to industry patterns
        return None
    
    async def _analyze_template_scoring_accuracy(
        self,
        user_id: str,
        days: int
    ) -> Optional[CrossEpicInsight]:
        """Analyze template scoring prediction accuracy."""
        # Implementation would compare predicted vs actual template performance
        return None
    
    async def _track_integration_metrics(
        self,
        user_id: str,
        integration_type: str,
        source_system: str,
        target_system: str,
        operation_type: str,
        input_data: Dict[str, Any],
        output_data: Dict[str, Any],
        processing_time_ms: int,
        success: bool,
        accuracy_score: Optional[float] = None,
        error_message: Optional[str] = None,
        user_satisfaction: Optional[int] = None
    ):
        """Track Epic integration metrics for analytics."""
        
        try:
            metric = EpicIntegrationMetrics(
                user_id=user_id,
                integration_type=integration_type,
                source_system=source_system,
                target_system=target_system,
                operation_type=operation_type,
                input_data=input_data,
                output_data=output_data,
                processing_time_ms=processing_time_ms,
                success=success,
                accuracy_score=accuracy_score,
                error_message=error_message,
                user_satisfaction=user_satisfaction
            )
            
            self.db_session.add(metric)
            await self.db_session.commit()
            
        except Exception as e:
            logger.error(f"Failed to track integration metrics: {e}")
            await self.db_session.rollback()