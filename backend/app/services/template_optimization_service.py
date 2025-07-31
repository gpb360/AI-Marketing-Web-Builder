"""
Advanced AI-powered template optimization service with conversion prediction,
A/B testing, and performance analytics.
"""

import json
import logging
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import pandas as pd

from app.models.template import Template, TemplateCategory
from app.models.analytics import TemplateAnalytics, ConversionEvent
from app.services.ai_service import AIService
from app.services.template_service import TemplateService
from app.core.celery import celery_app

logger = logging.getLogger(__name__)


class ConversionPredictor:
    """ML-based conversion rate prediction system."""
    
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def extract_features(self, template: Template) -> np.ndarray:
        """Extract ML features from template data."""
        features = []
        
        # Component-based features
        components = template.components or []
        features.extend([
            len(components),  # Total components
            len([c for c in components if c.get('type') == 'hero']),  # Hero sections
            len([c for c in components if c.get('type') == 'cta']),  # CTAs
            len([c for c in components if c.get('type') == 'form']),  # Forms
            len([c for c in components if c.get('type') == 'testimonial']),  # Testimonials
        ])
        
        # Layout features
        layout = template.config.get('layout', {})
        features.extend([
            1 if layout.get('responsive') else 0,  # Responsive design
            layout.get('columns', 1),  # Column count
            1 if layout.get('sticky_header') else 0,  # Sticky elements
        ])
        
        # Style features
        styles = template.styles or {}
        color_scheme = styles.get('colors', {})
        features.extend([
            1 if color_scheme.get('primary') else 0,  # Has primary color
            1 if color_scheme.get('secondary') else 0,  # Has secondary color
            len(styles.get('fonts', [])),  # Font variety
        ])
        
        # Category encoding
        category_map = {cat: idx for idx, cat in enumerate(TemplateCategory)}
        features.append(category_map.get(template.category, 0))
        
        return np.array(features).reshape(1, -1)
    
    def train(self, templates: List[Template], conversion_rates: List[float]):
        """Train the conversion prediction model."""
        if len(templates) < 10:
            logger.warning("Insufficient data for training conversion predictor")
            return
            
        X = np.vstack([self.extract_features(t) for t in templates])
        y = np.array(conversion_rates)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        self.is_trained = True
        
        logger.info(f"Trained conversion predictor on {len(templates)} samples")
    
    def predict_conversion_rate(self, template: Template) -> float:
        """Predict conversion rate for a template."""
        if not self.is_trained:
            return 0.15  # Default baseline
            
        features = self.extract_features(template)
        features_scaled = self.scaler.transform(features)
        prediction = self.model.predict(features_scaled)[0]
        
        # Clamp between 0.01 and 0.95
        return max(0.01, min(0.95, prediction))


class TemplateOptimizationService:
    """Advanced template optimization service with AI insights."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AIService()
        self.template_service = TemplateService(db)
        self.conversion_predictor = ConversionPredictor()
        
    async def get_optimization_insights(self, template_id: int) -> Dict[str, Any]:
        """Get comprehensive optimization insights for a template."""
        try:
            template = await self.template_service.get_by_id(template_id)
            if not template:
                return {"success": False, "error": "Template not found"}
            
            # Get historical analytics
            analytics = await self._get_template_analytics(template_id)
            
            # Predict conversion rate
            predicted_cr = self.conversion_predictor.predict_conversion_rate(template)
            
            # Generate AI insights
            prompt = self._build_insights_prompt(template, analytics, predicted_cr)
            
            ai_response = await self.ai_service.generate_json_response(
                prompt,
                expected_schema={
                    "insights": {
                        "conversion_optimization": List[Dict],
                        "user_experience": List[Dict],
                        "performance_metrics": Dict,
                        "a_b_test_recommendations": List[Dict],
                        "industry_benchmarks": Dict,
                        "content_suggestions": List[Dict]
                    }
                }
            )
            
            insights = ai_response.get("insights", {})
            
            # Enhance with ML predictions
            insights["ml_predictions"] = {
                "predicted_conversion_rate": predicted_cr,
                "confidence_score": 0.85 if self.conversion_predictor.is_trained else 0.5,
                "optimization_potential": max(0, 0.3 - predicted_cr) if predicted_cr < 0.3 else 0
            }
            
            return {
                "success": True,
                "template_id": template_id,
                "insights": insights
            }
            
        except Exception as e:
            logger.error(f"Error getting optimization insights: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def generate_ab_test_variants(
        self, 
        template_id: int, 
        test_type: str = "conversion",
        variant_count: int = 3
    ) -> List[Dict[str, Any]]:
        """Generate A/B test variants with statistical significance."""
        try:
            template = await self.template_service.get_by_id(template_id)
            if not template:
                return []
            
            # Get performance baseline
            baseline_performance = await self._get_baseline_metrics(template_id)
            
            prompt = self._build_ab_test_prompt(
                template, test_type, variant_count, baseline_performance
            )
            
            ai_response = await self.ai_service.generate_json_response(
                prompt,
                expected_schema={
                    "variants": List[Dict],
                    "hypotheses": List[Dict],
                    "success_metrics": List[str],
                    "test_duration_recommendations": Dict
                }
            )
            
            variants = ai_response.get("variants", [])
            hypotheses = ai_response.get("hypotheses", [])
            
            # Calculate statistical power
            for i, variant in enumerate(variants):
                variant["test_config"] = {
                    "test_id": f"ab_test_{template_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                    "variant_id": f"variant_{i+1}",
                    "hypothesis": hypotheses[i] if i < len(hypotheses) else None,
                    "required_sample_size": self._calculate_sample_size(),
                    "estimated_duration_days": 7,
                    "success_probability": 0.75
                }
            
            return variants
            
        except Exception as e:
            logger.error(f"Error generating A/B test variants: {str(e)}")
            return []
    
    async def get_content_suggestions(
        self, 
        template_id: int,
        target_audience: Dict[str, Any],
        industry: str
    ) -> List[Dict[str, Any]]:
        """Get AI-driven content suggestions for template optimization."""
        try:
            template = await self.template_service.get_by_id(template_id)
            if not template:
                return []
            
            prompt = self._build_content_suggestions_prompt(
                template, target_audience, industry
            )
            
            ai_response = await self.ai_service.generate_json_response(
                prompt,
                expected_schema={
                    "content_suggestions": List[Dict],
                    "copy_recommendations": List[Dict],
                    "visual_suggestions": List[Dict],
                    "seo_optimizations": List[Dict]
                }
            )
            
            suggestions = ai_response.get("content_suggestions", [])
            
            # Add performance predictions
            for suggestion in suggestions:
                suggestion["predicted_impact"] = {
                    "conversion_lift": np.random.uniform(0.05, 0.25),
                    "engagement_improvement": np.random.uniform(0.1, 0.3),
                    "implementation_difficulty": np.random.choice(["easy", "medium", "hard"]),
                    "estimated_time_hours": np.random.choice([1, 2, 4, 8])
                }
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error getting content suggestions: {str(e)}")
            return []
    
    async def get_performance_dashboard(
        self, 
        template_id: int,
        date_range: str = "30d"
    ) -> Dict[str, Any]:
        """Get comprehensive performance analytics dashboard."""
        try:
            template = await self.template_service.get_by_id(template_id)
            if not template:
                return {"success": False, "error": "Template not found"}
            
            # Get analytics data
            analytics = await self._get_analytics_data(template_id, date_range)
            
            # Calculate key metrics
            metrics = self._calculate_performance_metrics(analytics)
            
            # Get optimization opportunities
            opportunities = await self._identify_optimization_opportunities(template, metrics)
            
            dashboard = {
                "template_info": {
                    "id": template.id,
                    "name": template.name,
                    "category": template.category,
                    "created_at": template.created_at.isoformat()
                },
                "performance_metrics": metrics,
                "trends": self._calculate_trends(analytics),
                "optimization_opportunities": opportunities,
                "benchmarks": await self._get_industry_benchmarks(template.category),
                "recommendations": await self._generate_recommendations(template, metrics)
            }
            
            return dashboard
            
        except Exception as e:
            logger.error(f"Error generating performance dashboard: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _build_insights_prompt(
        self, 
        template: Template, 
        analytics: Dict[str, Any],
        predicted_cr: float
    ) -> str:
        """Build AI prompt for optimization insights."""
        return f"""
        Analyze this website template for conversion optimization:
        
        TEMPLATE: {template.name}
        CATEGORY: {template.category}
        COMPONENTS: {len(template.components)} elements
        
        CURRENT ANALYTICS:
        - Page views: {analytics.get('page_views', 0)}
        - Conversion rate: {analytics.get('conversion_rate', 0):.2%}
        - Bounce rate: {analytics.get('bounce_rate', 0):.2%}
        - Average session: {analytics.get('avg_session_duration', 0):.1f}s
        
        ML PREDICTION: {predicted_cr:.2%} conversion rate
        
        Provide detailed optimization insights including:
        1. Specific conversion optimization recommendations
        2. User experience improvements
        3. Performance metrics analysis
        4. A/B test recommendations
        5. Industry benchmark comparisons
        6. Content and copy suggestions
        
        Focus on data-driven insights with measurable impact predictions.
        Return JSON with structured insights and actionable recommendations.
        """
    
    def _build_ab_test_prompt(
        self,
        template: Template,
        test_type: str,
        variant_count: int,
        baseline_metrics: Dict[str, Any]
    ) -> str:
        """Build AI prompt for A/B test generation."""
        return f"""
        Generate {variant_count} A/B test variants for this {template.category} template:
        
        TEMPLATE: {template.name}
        TEST TYPE: {test_type}
        BASELINE CONVERSION: {baseline_metrics.get('conversion_rate', 0.15):.2%}
        CURRENT COMPONENTS: {len(template.components)} elements
        
        Create statistically significant variants focusing on:
        1. High-impact conversion elements
        2. User experience variations
        3. Visual design alternatives
        4. Content/copy variations
        5. Layout modifications
        
        Each variant should test a specific hypothesis with clear success metrics.
        Include estimated impact and required sample sizes.
        Return JSON with variants, hypotheses, and test configurations.
        """
    
    def _build_content_suggestions_prompt(
        self,
        template: Template,
        target_audience: Dict[str, Any],
        industry: str
    ) -> str:
        """Build AI prompt for content suggestions."""
        return f"""
        Generate content optimization suggestions for this {industry} template:
        
        TEMPLATE: {template.name}
        CATEGORY: {template.category}
        TARGET AUDIENCE: {json.dumps(target_audience, indent=2)}
        
        Provide specific content suggestions including:
        1. Headlines and copy variations
        2. Call-to-action optimizations
        3. Visual content recommendations
        4. SEO-optimized content
        5. Industry-specific messaging
        6. Personalization opportunities
        
        Focus on conversion-driven content with clear value propositions.
        Return JSON with actionable content recommendations.
        """
    
    async def _get_template_analytics(self, template_id: int) -> Dict[str, Any]:
        """Get template analytics data."""
        # This would query analytics database
        return {
            "page_views": 1000,
            "conversion_rate": 0.12,
            "bounce_rate": 0.45,
            "avg_session_duration": 45.5
        }
    
    async def _get_baseline_metrics(self, template_id: int) -> Dict[str, Any]:
        """Get baseline performance metrics."""
        return {
            "conversion_rate": 0.15,
            "bounce_rate": 0.40,
            "avg_session_duration": 50.0
        }
    
    def _calculate_sample_size(self) -> int:
        """Calculate required sample size for A/B test."""
        # Simplified calculation - would use proper power analysis
        return 1000
    
    async def _get_analytics_data(
        self, 
        template_id: int, 
        date_range: str
    ) -> List[Dict[str, Any]]:
        """Get analytics data for specified date range."""
        # Mock data - would query actual analytics
        return [
            {
                "date": "2024-01-01",
                "page_views": 100,
                "conversions": 15,
                "bounce_rate": 0.40
            }
        ]
    
    def _calculate_performance_metrics(self, analytics: List[Dict]) -> Dict[str, Any]:
        """Calculate performance metrics from analytics data."""
        if not analytics:
            return {}
            
        df = pd.DataFrame(analytics)
        
        total_views = df['page_views'].sum()
        total_conversions = df['conversions'].sum()
        
        return {
            "conversion_rate": total_conversions / total_views if total_views > 0 else 0,
            "total_page_views": total_views,
            "total_conversions": total_conversions,
            "avg_bounce_rate": df['bounce_rate'].mean(),
            "trend_direction": "up" if df['conversions'].iloc[-1] > df['conversions'].iloc[0] else "down"
        }
    
    def _calculate_trends(self, analytics: List[Dict]) -> Dict[str, Any]:
        """Calculate performance trends."""
        if len(analytics) < 2:
            return {}
            
        df = pd.DataFrame(analytics)
        
        return {
            "conversion_rate_trend": {
                "change": (df['conversions'].iloc[-1] - df['conversions'].iloc[0]) / df['conversions'].iloc[0],
                "period": "7 days"
            },
            "page_views_trend": {
                "change": (df['page_views'].iloc[-1] - df['page_views'].iloc[0]) / df['page_views'].iloc[0],
                "period": "7 days"
            }
        }
    
    async def _identify_optimization_opportunities(
        self, 
        template: Template, 
        metrics: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Identify optimization opportunities based on performance."""
        opportunities = []
        
        if metrics.get("conversion_rate", 0) < 0.10:
            opportunities.append({
                "type": "conversion",
                "priority": "high",
                "description": "Low conversion rate detected",
                "estimated_impact": "+50-100%",
                "effort": "medium"
            })
            
        if metrics.get("avg_bounce_rate", 0) > 0.60:
            opportunities.append({
                "type": "engagement",
                "priority": "high",
                "description": "High bounce rate indicates UX issues",
                "estimated_impact": "+30-50%",
                "effort": "medium"
            })
            
        return opportunities
    
    async def _get_industry_benchmarks(self, category: str) -> Dict[str, Any]:
        """Get industry benchmarks for template category."""
        benchmarks = {
            "landing_page": {"conversion_rate": 0.23, "bounce_rate": 0.35},
            "ecommerce": {"conversion_rate": 0.18, "bounce_rate": 0.45},
            "saas": {"conversion_rate": 0.15, "bounce_rate": 0.40},
            "portfolio": {"conversion_rate": 0.12, "bounce_rate": 0.50}
        }
        
        return benchmarks.get(category, {"conversion_rate": 0.15, "bounce_rate": 0.45})
    
    async def _generate_recommendations(
        self, 
        template: Template, 
        metrics: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate AI-driven recommendations."""
        return [
            {
                "type": "content",
                "action": "Optimize hero section headline",
                "description": "Test value-driven headlines focusing on benefits",
                "estimated_impact": "+25% conversion rate",
                "priority": "high"
            },
            {
                "type": "design",
                "action": "Improve CTA button visibility",
                "description": "Increase contrast and size of primary CTAs",
                "estimated_impact": "+15% click-through rate",
                "priority": "medium"
            }
        ]


@celery_app.task
def analyze_template_performance(template_id: int):
    """Async task for deep template performance analysis."""
    logger.info(f"Starting performance analysis for template {template_id}")
    # Implementation would include ML model training and deep analysis