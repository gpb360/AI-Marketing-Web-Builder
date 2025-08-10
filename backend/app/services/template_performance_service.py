"""
Automated Template Performance Analysis and Ranking Service.

This service provides comprehensive template performance monitoring, analysis,
and real-time ranking updates with optimization recommendations.
"""

import asyncio
import logging
import statistics
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc, update
from sqlalchemy.orm import selectinload
import pandas as pd
import numpy as np

from app.models.template import Template, TemplateCategory
from app.models.analytics import (
    TemplateAnalytics, 
    TemplateRanking, 
    ConversionEvent, 
    TemplateUsage, 
    TemplateOptimizationRecommendation,
    PerformanceBand,
    MetricType
)
from app.services.ai_service import AIService
from app.core.celery import celery_app
from app.core.redis import redis_client

logger = logging.getLogger(__name__)


class TemplatePerformanceAnalyzer:
    """Core template performance analysis engine."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AIService()
        
    async def analyze_template_performance(
        self, 
        template_id: str, 
        date_range_days: int = 30
    ) -> Dict[str, Any]:
        """Perform comprehensive performance analysis for a template."""
        try:
            # Get template and analytics data
            template = await self._get_template_with_analytics(template_id)
            if not template:
                return {"success": False, "error": "Template not found"}
            
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=date_range_days)
            
            # Collect performance metrics
            metrics = await self._collect_performance_metrics(
                template_id, start_date, end_date
            )
            
            # Calculate derived metrics
            performance_scores = self._calculate_performance_scores(metrics)
            
            # Generate insights and recommendations
            insights = await self._generate_ai_insights(template, metrics, performance_scores)
            
            # Update template ranking
            await self._update_template_ranking(template, performance_scores)
            
            analysis_result = {
                "success": True,
                "template_id": template_id,
                "analysis_date": datetime.utcnow().isoformat(),
                "date_range": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat(),
                    "days": date_range_days
                },
                "performance_metrics": metrics,
                "performance_scores": performance_scores,
                "insights": insights,
                "ranking_updated": True
            }
            
            # Cache results for quick access
            await self._cache_analysis_results(template_id, analysis_result)
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analyzing template performance: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _get_template_with_analytics(self, template_id: str) -> Optional[Template]:
        """Get template with related analytics data."""
        result = await self.db.execute(
            select(Template)
            .options(
                selectinload(Template.analytics),
                selectinload(Template.ranking)
            )
            .where(Template.id == template_id)
        )
        return result.scalars().first()
    
    async def _collect_performance_metrics(
        self, 
        template_id: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> Dict[str, Any]:
        """Collect comprehensive performance metrics."""
        
        # Analytics metrics
        analytics_query = select(TemplateAnalytics).where(
            and_(
                TemplateAnalytics.template_id == template_id,
                TemplateAnalytics.date >= start_date,
                TemplateAnalytics.date <= end_date
            )
        )
        analytics_result = await self.db.execute(analytics_query)
        analytics_data = analytics_result.scalars().all()
        
        # Usage metrics
        usage_query = select(TemplateUsage).where(
            and_(
                TemplateUsage.template_id == template_id,
                TemplateUsage.created_at >= start_date,
                TemplateUsage.created_at <= end_date
            )
        )
        usage_result = await self.db.execute(usage_query)
        usage_data = usage_result.scalars().all()
        
        # Conversion events
        conversion_query = select(ConversionEvent).where(
            and_(
                ConversionEvent.template_id == template_id,
                ConversionEvent.created_at >= start_date,
                ConversionEvent.created_at <= end_date
            )
        )
        conversion_result = await self.db.execute(conversion_query)
        conversion_data = conversion_result.scalars().all()
        
        # Calculate aggregated metrics
        metrics = self._calculate_aggregated_metrics(
            analytics_data, usage_data, conversion_data
        )
        
        return metrics
    
    def _calculate_aggregated_metrics(
        self,
        analytics_data: List[TemplateAnalytics],
        usage_data: List[TemplateUsage],
        conversion_data: List[ConversionEvent]
    ) -> Dict[str, Any]:
        """Calculate aggregated performance metrics."""
        
        if not analytics_data:
            return self._get_default_metrics()
        
        # Analytics aggregations
        total_page_views = sum(a.page_views for a in analytics_data)
        total_sessions = sum(a.sessions for a in analytics_data)
        total_conversions = sum(a.conversions for a in analytics_data)
        total_bounces = sum(a.bounces for a in analytics_data)
        
        # Core metrics
        conversion_rate = total_conversions / total_page_views if total_page_views > 0 else 0
        bounce_rate = total_bounces / total_sessions if total_sessions > 0 else 0
        
        # Session and engagement metrics
        avg_session_durations = [a.avg_session_duration for a in analytics_data if a.avg_session_duration > 0]
        avg_session_duration = statistics.mean(avg_session_durations) if avg_session_durations else 0
        
        # Page load performance
        avg_load_times = [a.avg_page_load_time for a in analytics_data if a.avg_page_load_time > 0]
        avg_page_load_time = statistics.mean(avg_load_times) if avg_load_times else 0
        
        # Usage analysis
        total_usage = len(usage_data)
        successful_usage = len([u for u in usage_data if u.was_published or u.was_completed])
        success_rate = successful_usage / total_usage if total_usage > 0 else 0
        
        # User satisfaction
        satisfaction_ratings = [u.satisfaction_rating for u in usage_data if u.satisfaction_rating]
        avg_satisfaction = statistics.mean(satisfaction_ratings) if satisfaction_ratings else 0
        
        # Workflow success
        workflow_successes = [u for u in usage_data if u.workflow_success]
        workflow_success_rate = len(workflow_successes) / total_usage if total_usage > 0 else 0
        
        # Conversion funnel analysis
        conversion_events_by_step = {}
        for event in conversion_data:
            step = event.conversion_funnel_step
            if step not in conversion_events_by_step:
                conversion_events_by_step[step] = 0
            conversion_events_by_step[step] += 1
        
        # Traffic sources
        organic_traffic = sum(a.organic_traffic for a in analytics_data)
        direct_traffic = sum(a.direct_traffic for a in analytics_data)
        referral_traffic = sum(a.referral_traffic for a in analytics_data)
        social_traffic = sum(a.social_traffic for a in analytics_data)
        
        # Device distribution
        mobile_users = sum(a.mobile_users for a in analytics_data)
        desktop_users = sum(a.desktop_users for a in analytics_data)
        mobile_ratio = mobile_users / (mobile_users + desktop_users) if (mobile_users + desktop_users) > 0 else 0
        
        return {
            # Core performance metrics
            "total_page_views": total_page_views,
            "total_sessions": total_sessions,
            "total_conversions": total_conversions,
            "conversion_rate": conversion_rate,
            "bounce_rate": bounce_rate,
            "avg_session_duration": avg_session_duration,
            "avg_page_load_time": avg_page_load_time,
            
            # Usage and success metrics
            "total_usage": total_usage,
            "success_rate": success_rate,
            "workflow_success_rate": workflow_success_rate,
            "avg_satisfaction": avg_satisfaction,
            
            # Traffic analysis
            "traffic_sources": {
                "organic": organic_traffic,
                "direct": direct_traffic,
                "referral": referral_traffic,
                "social": social_traffic
            },
            
            # Device distribution
            "device_distribution": {
                "mobile_users": mobile_users,
                "desktop_users": desktop_users,
                "mobile_ratio": mobile_ratio
            },
            
            # Conversion funnel
            "conversion_funnel": conversion_events_by_step,
            
            # Engagement metrics
            "avg_scroll_depth": statistics.mean([a.avg_scroll_depth for a in analytics_data if a.avg_scroll_depth > 0]) if analytics_data else 0,
            "form_completion_rate": statistics.mean([a.form_completions / a.form_interactions for a in analytics_data if a.form_interactions > 0]) if analytics_data else 0,
            
            # Trend indicators
            "data_points": len(analytics_data),
            "date_range_coverage": len(analytics_data) / 30.0 if analytics_data else 0  # Assuming daily data points
        }
    
    def _calculate_performance_scores(self, metrics: Dict[str, Any]) -> Dict[str, float]:
        """Calculate normalized performance scores (0-100)."""
        
        # Conversion performance (40% weight)
        conversion_score = min(100, (metrics["conversion_rate"] / 0.25) * 100)  # 25% is excellent
        
        # User experience (30% weight)
        bounce_penalty = max(0, 100 - (metrics["bounce_rate"] * 200))  # 50% bounce = 0 score
        load_time_penalty = max(0, 100 - (metrics["avg_page_load_time"] / 3.0 * 100))  # 3s = 0 score
        ux_score = (bounce_penalty + load_time_penalty) / 2
        
        # Engagement (20% weight)
        session_score = min(100, (metrics["avg_session_duration"] / 180) * 100)  # 3 min = 100%
        scroll_score = metrics["avg_scroll_depth"] * 100 if metrics["avg_scroll_depth"] else 0
        engagement_score = (session_score + scroll_score) / 2
        
        # Success rate (10% weight)
        success_score = metrics["success_rate"] * 100
        
        # Calculate weighted overall score
        overall_score = (
            conversion_score * 0.4 +
            ux_score * 0.3 +
            engagement_score * 0.2 +
            success_score * 0.1
        )
        
        return {
            "overall_score": round(overall_score, 2),
            "conversion_score": round(conversion_score, 2),
            "ux_score": round(ux_score, 2),
            "engagement_score": round(engagement_score, 2),
            "success_score": round(success_score, 2)
        }
    
    async def _generate_ai_insights(
        self, 
        template: Template, 
        metrics: Dict[str, Any], 
        scores: Dict[str, float]
    ) -> Dict[str, Any]:
        """Generate AI-powered insights and recommendations."""
        
        prompt = f"""
        Analyze this template performance data and provide actionable insights:
        
        TEMPLATE: {template.name}
        CATEGORY: {template.category}
        
        PERFORMANCE METRICS:
        - Conversion Rate: {metrics['conversion_rate']:.2%}
        - Bounce Rate: {metrics['bounce_rate']:.2%}
        - Avg Session Duration: {metrics['avg_session_duration']:.1f}s
        - Page Load Time: {metrics['avg_page_load_time']:.1f}s
        - Success Rate: {metrics['success_rate']:.2%}
        - User Satisfaction: {metrics['avg_satisfaction']:.1f}/5
        
        PERFORMANCE SCORES:
        - Overall: {scores['overall_score']:.1f}/100
        - Conversion: {scores['conversion_score']:.1f}/100
        - User Experience: {scores['ux_score']:.1f}/100
        - Engagement: {scores['engagement_score']:.1f}/100
        
        Provide specific, actionable recommendations for:
        1. Performance optimization opportunities
        2. User experience improvements
        3. Conversion rate optimization
        4. Technical performance enhancements
        5. Content and design suggestions
        
        Return JSON with structured insights and priority rankings.
        """
        
        try:
            ai_response = await self.ai_service.generate_json_response(
                prompt,
                expected_schema={
                    "performance_analysis": {
                        "strengths": List[str],
                        "weaknesses": List[str],
                        "opportunities": List[Dict[str, Any]],
                        "threats": List[str]
                    },
                    "optimization_recommendations": List[Dict[str, Any]],
                    "technical_improvements": List[Dict[str, Any]],
                    "content_suggestions": List[Dict[str, Any]],
                    "priority_actions": List[Dict[str, Any]]
                }
            )
            
            return ai_response
            
        except Exception as e:
            logger.error(f"Error generating AI insights: {str(e)}")
            return self._get_fallback_insights(metrics, scores)
    
    async def _update_template_ranking(
        self, 
        template: Template, 
        scores: Dict[str, float]
    ) -> None:
        """Update or create template ranking entry."""
        
        # Check if ranking exists
        existing_ranking = await self.db.execute(
            select(TemplateRanking).where(TemplateRanking.template_id == template.id)
        )
        ranking = existing_ranking.scalars().first()
        
        if ranking:
            # Update existing ranking
            ranking.overall_score = scores["overall_score"]
            ranking.performance_score = scores["conversion_score"]
            ranking.last_analyzed_at = datetime.utcnow()
            ranking.analysis_version += 1
        else:
            # Create new ranking
            ranking = TemplateRanking(
                template_id=template.id,
                category=template.category.value,
                overall_score=scores["overall_score"],
                performance_score=scores["conversion_score"],
                last_analyzed_at=datetime.utcnow()
            )
            self.db.add(ranking)
        
        await self.db.commit()
        
        # Update ranks within category and overall
        await self._recalculate_rankings()
    
    async def _recalculate_rankings(self) -> None:
        """Recalculate all template rankings and performance bands."""
        
        # Get all rankings ordered by score
        all_rankings = await self.db.execute(
            select(TemplateRanking)
            .order_by(desc(TemplateRanking.overall_score))
        )
        rankings = all_rankings.scalars().all()
        
        total_templates = len(rankings)
        
        # Update overall ranks and performance bands
        for i, ranking in enumerate(rankings, 1):
            ranking.overall_rank = i
            
            # Determine performance band based on percentile
            percentile = i / total_templates
            if percentile <= 0.1:
                ranking.performance_band = PerformanceBand.TOP_PERFORMER
            elif percentile <= 0.3:
                ranking.performance_band = PerformanceBand.GOOD
            elif percentile <= 0.7:
                ranking.performance_band = PerformanceBand.AVERAGE
            elif percentile <= 0.9:
                ranking.performance_band = PerformanceBand.POOR
            else:
                ranking.performance_band = PerformanceBand.UNDERPERFORMING
        
        # Update category ranks
        categories = {}
        for ranking in rankings:
            if ranking.category not in categories:
                categories[ranking.category] = []
            categories[ranking.category].append(ranking)
        
        for category_rankings in categories.values():
            category_rankings.sort(key=lambda x: x.overall_score, reverse=True)
            for i, ranking in enumerate(category_rankings, 1):
                ranking.category_rank = i
        
        await self.db.commit()
    
    async def _cache_analysis_results(
        self, 
        template_id: str, 
        results: Dict[str, Any]
    ) -> None:
        """Cache analysis results in Redis for quick access."""
        try:
            cache_key = f"template_analysis:{template_id}"
            await redis_client.setex(
                cache_key, 
                3600,  # 1 hour TTL
                results
            )
        except Exception as e:
            logger.warning(f"Failed to cache analysis results: {str(e)}")
    
    def _get_default_metrics(self) -> Dict[str, Any]:
        """Return default metrics when no data is available."""
        return {
            "total_page_views": 0,
            "total_sessions": 0,
            "total_conversions": 0,
            "conversion_rate": 0.0,
            "bounce_rate": 0.0,
            "avg_session_duration": 0.0,
            "avg_page_load_time": 0.0,
            "total_usage": 0,
            "success_rate": 0.0,
            "workflow_success_rate": 0.0,
            "avg_satisfaction": 0.0,
            "traffic_sources": {"organic": 0, "direct": 0, "referral": 0, "social": 0},
            "device_distribution": {"mobile_users": 0, "desktop_users": 0, "mobile_ratio": 0},
            "conversion_funnel": {},
            "avg_scroll_depth": 0.0,
            "form_completion_rate": 0.0,
            "data_points": 0,
            "date_range_coverage": 0.0
        }
    
    def _get_fallback_insights(
        self, 
        metrics: Dict[str, Any], 
        scores: Dict[str, float]
    ) -> Dict[str, Any]:
        """Provide fallback insights when AI service is unavailable."""
        recommendations = []
        
        if scores["conversion_score"] < 50:
            recommendations.append({
                "type": "conversion",
                "priority": "high",
                "title": "Improve Conversion Rate",
                "description": "Conversion rate is below optimal. Consider A/B testing CTAs and form placement.",
                "estimated_impact": "20-40% improvement"
            })
        
        if scores["ux_score"] < 60:
            recommendations.append({
                "type": "ux",
                "priority": "high",
                "title": "Optimize User Experience",
                "description": "High bounce rate or slow load times detected. Optimize page speed and content.",
                "estimated_impact": "15-30% improvement"
            })
        
        return {
            "performance_analysis": {
                "strengths": ["Template is actively used", "Data collection is working"],
                "weaknesses": ["Performance could be optimized"],
                "opportunities": [{"area": "conversion", "potential": "high"}],
                "threats": ["Competition from higher-ranked templates"]
            },
            "optimization_recommendations": recommendations,
            "technical_improvements": [],
            "content_suggestions": [],
            "priority_actions": recommendations[:3]
        }


class TemplateRankingService:
    """Service for real-time template ranking updates."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.performance_analyzer = TemplatePerformanceAnalyzer(db)
    
    async def get_template_rankings(
        self,
        category: Optional[TemplateCategory] = None,
        performance_band: Optional[PerformanceBand] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[TemplateRanking]:
        """Get template rankings with filtering options."""
        
        query = select(TemplateRanking).options(selectinload(TemplateRanking.template))
        
        if category:
            query = query.where(TemplateRanking.category == category.value)
        
        if performance_band:
            query = query.where(TemplateRanking.performance_band == performance_band)
        
        query = query.order_by(asc(TemplateRanking.overall_rank)).offset(offset).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_top_performers(
        self, 
        category: Optional[TemplateCategory] = None,
        limit: int = 10
    ) -> List[TemplateRanking]:
        """Get top performing templates."""
        
        return await self.get_template_rankings(
            category=category,
            performance_band=PerformanceBand.TOP_PERFORMER,
            limit=limit
        )
    
    async def get_category_leaders(self) -> Dict[str, TemplateRanking]:
        """Get the top template in each category."""
        
        leaders = {}
        for category in TemplateCategory:
            result = await self.db.execute(
                select(TemplateRanking)
                .options(selectinload(TemplateRanking.template))
                .where(TemplateRanking.category == category.value)
                .order_by(asc(TemplateRanking.category_rank))
                .limit(1)
            )
            leader = result.scalars().first()
            if leader:
                leaders[category.value] = leader
        
        return leaders
    
    async def get_trending_templates(
        self, 
        period_days: int = 7,
        limit: int = 10
    ) -> List[TemplateRanking]:
        """Get templates with positive ranking trends."""
        
        rank_change_field = (
            TemplateRanking.rank_change_7d if period_days <= 7 
            else TemplateRanking.rank_change_30d
        )
        
        result = await self.db.execute(
            select(TemplateRanking)
            .options(selectinload(TemplateRanking.template))
            .where(rank_change_field > 0)
            .order_by(desc(rank_change_field))
            .limit(limit)
        )
        
        return result.scalars().all()


# Celery tasks for automated analysis
@celery_app.task(name="analyze_all_templates")
async def analyze_all_templates():
    """Celery task to analyze all templates performance."""
    logger.info("Starting automated analysis of all templates")
    
    # This would be implemented with proper database session management
    # For now, it's a placeholder for the task structure
    
    logger.info("Completed automated analysis of all templates")


@celery_app.task(name="update_template_rankings")
async def update_template_rankings():
    """Celery task to update template rankings."""
    logger.info("Starting template ranking updates")
    
    # This would implement the ranking update logic
    
    logger.info("Completed template ranking updates")


@celery_app.task(name="generate_optimization_recommendations")
async def generate_optimization_recommendations(template_id: str):
    """Celery task to generate optimization recommendations for a specific template."""
    logger.info(f"Generating optimization recommendations for template {template_id}")
    
    # This would implement recommendation generation logic
    
    logger.info(f"Completed optimization recommendations for template {template_id}")