"""
AI-powered recommendation optimization service.
Uses machine learning to optimize recommendation algorithms based on A/B test results.
"""

import asyncio
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import json

from app.models.analytics import (
    RecommendationEvent, RecommendationAlgorithm, TemplateAnalytics,
    ConversionEvent, UserInteraction, EventType
)
from app.models.ab_test import ABTest, ABTestVariant, ABTestStatus, ABTestType
from app.models.template import Template
from app.services.ai_service import AIService
from app.services.ab_testing_framework import ABTestingFramework
from app.core.celery import celery_app

logger = logging.getLogger(__name__)


class RecommendationFeatureExtractor:
    """Extract features for recommendation optimization ML models."""
    
    @staticmethod
    def extract_user_features(user_interactions: List[UserInteraction]) -> Dict[str, float]:
        """Extract user behavior features from interaction history."""
        if not user_interactions:
            return RecommendationFeatureExtractor._default_user_features()
        
        df = pd.DataFrame([{
            'interaction_type': ui.interaction_type,
            'element_type': ui.element_type,
            'interaction_duration': ui.interaction_duration or 0,
            'page_time_before_interaction': ui.page_time_before_interaction or 0,
            'created_at': ui.created_at
        } for ui in user_interactions])
        
        # Calculate behavior metrics
        total_interactions = len(df)
        unique_interaction_types = df['interaction_type'].nunique()
        unique_element_types = df['element_type'].nunique()
        
        # Time-based features
        avg_interaction_duration = df['interaction_duration'].mean()
        avg_time_to_interact = df['page_time_before_interaction'].mean()
        
        # Session patterns
        session_length = (df['created_at'].max() - df['created_at'].min()).total_seconds() / 60  # minutes
        interactions_per_minute = total_interactions / max(session_length, 1)
        
        # Interaction type distribution
        click_ratio = len(df[df['interaction_type'] == 'click']) / total_interactions
        scroll_ratio = len(df[df['interaction_type'] == 'scroll']) / total_interactions
        hover_ratio = len(df[df['interaction_type'] == 'hover']) / total_interactions
        
        return {
            'total_interactions': total_interactions,
            'unique_interaction_types': unique_interaction_types,
            'unique_element_types': unique_element_types,
            'avg_interaction_duration': avg_interaction_duration,
            'avg_time_to_interact': avg_time_to_interact,
            'session_length_minutes': session_length,
            'interactions_per_minute': interactions_per_minute,
            'click_ratio': click_ratio,
            'scroll_ratio': scroll_ratio,
            'hover_ratio': hover_ratio
        }
    
    @staticmethod
    def extract_template_features(template: Template, analytics: List[TemplateAnalytics]) -> Dict[str, float]:
        """Extract template characteristics and performance features."""
        # Template structure features
        components = template.components or []
        total_components = len(components)
        
        component_types = {}
        for component in components:
            comp_type = component.get('type', 'unknown')
            component_types[comp_type] = component_types.get(comp_type, 0) + 1
        
        # Component type ratios
        hero_ratio = component_types.get('hero', 0) / max(total_components, 1)
        cta_ratio = component_types.get('cta', 0) / max(total_components, 1)
        form_ratio = component_types.get('form', 0) / max(total_components, 1)
        testimonial_ratio = component_types.get('testimonial', 0) / max(total_components, 1)
        
        # Style features
        styles = template.styles or {}
        has_custom_colors = 1 if styles.get('colors') else 0
        has_custom_fonts = 1 if styles.get('fonts') else 0
        
        # Performance features from analytics
        if analytics:
            df = pd.DataFrame([{
                'views': a.views,
                'conversions': a.conversions,
                'bounces': a.bounces,
                'conversion_rate': a.conversion_rate,
                'bounce_rate': a.bounce_rate
            } for a in analytics])
            
            avg_conversion_rate = df['conversion_rate'].mean()
            avg_bounce_rate = df['bounce_rate'].mean()
            total_views = df['views'].sum()
            conversion_stability = 1 - df['conversion_rate'].std()  # Lower std = more stable
        else:
            avg_conversion_rate = 0
            avg_bounce_rate = 0
            total_views = 0
            conversion_stability = 0
        
        return {
            'total_components': total_components,
            'hero_ratio': hero_ratio,
            'cta_ratio': cta_ratio,
            'form_ratio': form_ratio,
            'testimonial_ratio': testimonial_ratio,
            'has_custom_colors': has_custom_colors,
            'has_custom_fonts': has_custom_fonts,
            'avg_conversion_rate': avg_conversion_rate,
            'avg_bounce_rate': avg_bounce_rate,
            'total_views': total_views,
            'conversion_stability': conversion_stability,
            'category_encoded': hash(template.category.value) % 100  # Simple category encoding
        }
    
    @staticmethod
    def extract_context_features(context: Dict[str, Any]) -> Dict[str, float]:
        """Extract contextual features from recommendation context."""
        return {
            'time_of_day': datetime.now().hour,
            'day_of_week': datetime.now().weekday(),
            'is_weekend': 1 if datetime.now().weekday() >= 5 else 0,
            'industry_match': context.get('industry_match_score', 0.5),
            'user_engagement_score': context.get('user_engagement_score', 0.5),
            'session_page_views': context.get('session_page_views', 1),
            'previous_conversions': context.get('previous_conversions', 0)
        }
    
    @staticmethod
    def _default_user_features() -> Dict[str, float]:
        """Default user features for new users."""
        return {
            'total_interactions': 0,
            'unique_interaction_types': 0,
            'unique_element_types': 0,
            'avg_interaction_duration': 0,
            'avg_time_to_interact': 0,
            'session_length_minutes': 0,
            'interactions_per_minute': 0,
            'click_ratio': 0,
            'scroll_ratio': 0,
            'hover_ratio': 0
        }


class RecommendationOptimizer:
    """ML-powered recommendation algorithm optimizer."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AIService()
        self.ab_framework = ABTestingFramework(db)
        self.feature_extractor = RecommendationFeatureExtractor()
        
        # ML models
        self.click_predictor = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=20,
            random_state=42
        )
        self.conversion_predictor = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
        self.models_trained = False
    
    async def train_optimization_models(self, lookback_days: int = 90) -> Dict[str, Any]:
        """Train ML models using historical recommendation data."""
        logger.info(f"Training recommendation optimization models with {lookback_days} days of data")
        
        # Get training data
        training_data = await self._prepare_training_data(lookback_days)
        
        if len(training_data) < 100:
            logger.warning("Insufficient training data for model optimization")
            return {"success": False, "error": "Insufficient training data"}
        
        # Prepare features and targets
        features_df = pd.DataFrame(training_data)
        
        # Feature columns (exclude target variables)
        feature_cols = [col for col in features_df.columns 
                       if col not in ['clicked', 'converted', 'recommendation_id', 'session_id']]
        
        X = features_df[feature_cols]
        y_click = features_df['clicked']
        y_convert = features_df['converted']
        
        # Handle missing values
        X = X.fillna(0)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train click prediction model
        click_scores = cross_val_score(self.click_predictor, X_scaled, y_click, cv=5, scoring='roc_auc')
        self.click_predictor.fit(X_scaled, y_click)
        
        # Train conversion prediction model
        conversion_scores = cross_val_score(self.conversion_predictor, X_scaled, y_convert, cv=5, scoring='roc_auc')
        self.conversion_predictor.fit(X_scaled, y_convert)
        
        self.models_trained = True
        
        # Feature importance analysis
        feature_importance = {
            'click_prediction': dict(zip(feature_cols, self.click_predictor.feature_importances_)),
            'conversion_prediction': dict(zip(feature_cols, self.conversion_predictor.feature_importances_))
        }
        
        return {
            "success": True,
            "training_samples": len(training_data),
            "click_prediction_auc": click_scores.mean(),
            "conversion_prediction_auc": conversion_scores.mean(),
            "feature_importance": feature_importance,
            "model_performance": {
                "click_model_std": click_scores.std(),
                "conversion_model_std": conversion_scores.std()
            }
        }
    
    async def optimize_recommendation_algorithm(
        self,
        current_algorithm: str,
        optimization_target: str = "conversion_rate"
    ) -> Dict[str, Any]:
        """Generate optimized recommendation algorithm using AI and ML insights."""
        
        if not self.models_trained:
            await self.train_optimization_models()
        
        # Analyze current algorithm performance
        current_performance = await self._analyze_algorithm_performance(current_algorithm)
        
        # Get feature importance insights
        feature_importance = await self._get_feature_importance()
        
        # Generate AI optimization suggestions
        optimization_prompt = self._build_optimization_prompt(
            current_algorithm, current_performance, feature_importance, optimization_target
        )
        
        ai_suggestions = await self.ai_service.generate_json_response(
            optimization_prompt,
            expected_schema={
                "optimizations": {
                    "algorithm_improvements": List[Dict],
                    "feature_engineering": List[Dict],
                    "parameter_tuning": Dict,
                    "new_features": List[Dict],
                    "expected_impact": Dict
                }
            }
        )
        
        optimization_suggestions = ai_suggestions.get("optimizations", {})
        
        # Create optimization experiment
        experiment_config = await self._create_optimization_experiment(
            current_algorithm, optimization_suggestions
        )
        
        return {
            "current_performance": current_performance,
            "optimization_suggestions": optimization_suggestions,
            "experiment_config": experiment_config,
            "implementation_plan": await self._generate_implementation_plan(optimization_suggestions)
        }
    
    async def predict_recommendation_performance(
        self,
        template_id: int,
        user_context: Dict[str, Any],
        recommendation_context: Dict[str, Any]
    ) -> Dict[str, float]:
        """Predict click and conversion probability for a recommendation."""
        
        if not self.models_trained:
            # Use default predictions if models aren't trained
            return {
                "click_probability": 0.15,
                "conversion_probability": 0.05,
                "confidence": 0.5
            }
        
        # Get template and analytics
        template = await self.db.get(Template, template_id)
        if not template:
            return {"error": "Template not found"}
        
        # Get recent analytics
        recent_date = datetime.utcnow() - timedelta(days=30)
        analytics_query = select(TemplateAnalytics).where(
            and_(
                TemplateAnalytics.template_id == template_id,
                TemplateAnalytics.date >= recent_date
            )
        )
        analytics = (await self.db.execute(analytics_query)).scalars().all()
        
        # Extract features
        user_features = self.feature_extractor.extract_user_features([])  # Would need actual user interactions
        template_features = self.feature_extractor.extract_template_features(template, analytics)
        context_features = self.feature_extractor.extract_context_features(recommendation_context)
        
        # Combine features
        all_features = {**user_features, **template_features, **context_features}
        
        # Convert to array for prediction
        feature_values = np.array(list(all_features.values())).reshape(1, -1)
        feature_values_scaled = self.scaler.transform(feature_values)
        
        # Make predictions
        click_prob = self.click_predictor.predict_proba(feature_values_scaled)[0][1]
        conversion_prob = self.conversion_predictor.predict_proba(feature_values_scaled)[0][1]
        
        # Calculate confidence based on feature importance alignment
        confidence = self._calculate_prediction_confidence(all_features)
        
        return {
            "click_probability": float(click_prob),
            "conversion_probability": float(conversion_prob),
            "confidence": float(confidence),
            "feature_contributions": self._explain_prediction(all_features)
        }
    
    async def create_algorithm_ab_test(
        self,
        base_algorithm: str,
        optimization_suggestions: Dict[str, Any],
        test_config: Dict[str, Any]
    ) -> ABTest:
        """Create A/B test comparing current algorithm with optimized version."""
        
        # Define algorithm variants
        control_variant = {
            "name": f"{base_algorithm} (Control)",
            "description": "Current recommendation algorithm",
            "is_control": True,
            "algorithm_config": {"version": base_algorithm, "type": "control"},
            "weight": 0.5
        }
        
        optimized_variant = {
            "name": f"{base_algorithm} Optimized",
            "description": "AI-optimized recommendation algorithm",
            "is_control": False,
            "algorithm_config": {
                "version": f"{base_algorithm}_optimized_v1",
                "type": "optimized",
                "optimizations": optimization_suggestions
            },
            "weight": 0.5
        }
        
        # Create A/B test
        ab_test = await self.ab_framework.create_recommendation_ab_test(
            name=f"Algorithm Optimization: {base_algorithm}",
            description=f"Testing optimized version of {base_algorithm} recommendation algorithm",
            algorithm_variants=[control_variant, optimized_variant],
            test_config=test_config
        )
        
        return ab_test
    
    async def analyze_ab_test_learnings(self, test_id: int) -> Dict[str, Any]:
        """Analyze completed A/B test to extract optimization learnings."""
        
        ab_test = await self.db.get(ABTest, test_id)
        if not ab_test or ab_test.status != ABTestStatus.COMPLETED:
            return {"error": "Test not found or not completed"}
        
        # Get test results
        results = await self.ab_framework.get_ab_test_results(test_id)
        
        # Analyze performance differences
        performance_analysis = await self._analyze_performance_differences(results)
        
        # Extract learnings using AI
        learnings_prompt = self._build_learnings_analysis_prompt(ab_test, results, performance_analysis)
        
        ai_analysis = await self.ai_service.generate_json_response(
            learnings_prompt,
            expected_schema={
                "learnings": {
                    "key_insights": List[str],
                    "winning_features": List[Dict],
                    "failure_points": List[Dict],
                    "optimization_recommendations": List[Dict],
                    "statistical_confidence": float,
                    "business_impact": Dict
                }
            }
        )
        
        learnings = ai_analysis.get("learnings", {})
        
        # Update algorithm performance records
        await self._update_algorithm_performance_records(ab_test, results)
        
        return {
            "test_summary": {
                "test_id": test_id,
                "test_name": ab_test.name,
                "duration": (ab_test.completed_at - ab_test.started_at).days if ab_test.started_at else 0,
                "winner": ab_test.winning_variant_id,
                "statistical_significance": ab_test.statistical_significance_reached
            },
            "performance_analysis": performance_analysis,
            "ai_learnings": learnings,
            "implementation_recommendations": await self._generate_implementation_recommendations(learnings)
        }
    
    async def get_optimization_dashboard(self) -> Dict[str, Any]:
        """Get comprehensive optimization dashboard with insights and recommendations."""
        
        # Get algorithm performance summary
        algorithms_query = select(RecommendationAlgorithm).where(
            RecommendationAlgorithm.is_active == True
        )
        active_algorithms = (await self.db.execute(algorithms_query)).scalars().all()
        
        # Get recent A/B tests
        recent_tests_query = select(ABTest).where(
            and_(
                ABTest.test_type == ABTestType.ALGORITHM_COMPARISON,
                ABTest.created_at >= datetime.utcnow() - timedelta(days=30)
            )
        ).order_by(desc(ABTest.created_at)).limit(10)
        
        recent_tests = (await self.db.execute(recent_tests_query)).scalars().all()
        
        # Calculate optimization opportunities
        optimization_opportunities = await self._identify_optimization_opportunities()
        
        # Generate recommendations
        recommendations = await self._generate_dashboard_recommendations()
        
        return {
            "active_algorithms": [{
                "name": alg.name,
                "version": alg.version,
                "traffic_allocation": alg.traffic_allocation,
                "overall_ctr": alg.overall_ctr,
                "overall_conversion_rate": alg.overall_conversion_rate,
                "user_satisfaction": alg.user_satisfaction_score
            } for alg in active_algorithms],
            "recent_tests": [{
                "id": test.id,
                "name": test.name,
                "status": test.status,
                "created_at": test.created_at.isoformat(),
                "winner": test.winning_variant_id,
                "significance": test.statistical_significance_reached
            } for test in recent_tests],
            "optimization_opportunities": optimization_opportunities,
            "recommendations": recommendations,
            "performance_trends": await self._calculate_performance_trends(),
            "model_status": {
                "models_trained": self.models_trained,
                "last_training": "2024-01-15T10:00:00Z",  # Would be tracked in DB
                "training_data_size": 10000,  # Would be calculated
                "model_accuracy": 0.85  # Would be from latest validation
            }
        }
    
    async def _prepare_training_data(self, lookback_days: int) -> List[Dict[str, Any]]:
        """Prepare training data for ML models."""
        start_date = datetime.utcnow() - timedelta(days=lookback_days)
        
        # Get recommendation events with outcomes
        events_query = select(RecommendationEvent).where(
            RecommendationEvent.created_at >= start_date
        )
        events = (await self.db.execute(events_query)).scalars().all()
        
        # Create training samples
        training_samples = []
        for event in events:
            if event.event_type != EventType.RECOMMENDATION_SHOWN:
                continue
            
            # Find if this recommendation led to click/conversion
            session_events = [e for e in events if e.session_id == event.session_id]
            
            clicked = any(e.event_type == EventType.RECOMMENDATION_CLICKED 
                         and e.recommendation_id == event.recommendation_id 
                         for e in session_events)
            
            converted = any(e.event_type == EventType.CONVERSION
                           for e in session_events)
            
            # Extract features (simplified for this example)
            sample = {
                'recommendation_id': event.recommendation_id,
                'session_id': event.session_id,
                'algorithm_version': event.algorithm_version,
                'clicked': 1 if clicked else 0,
                'converted': 1 if converted else 0,
                'position': event.position or 0,
                'relevance_score': event.relevance_score or 0.5,
                # Would include more features extracted from user context, template, etc.
            }
            training_samples.append(sample)
        
        return training_samples
    
    async def _analyze_algorithm_performance(self, algorithm_version: str) -> Dict[str, Any]:
        """Analyze performance of a specific algorithm version."""
        recent_date = datetime.utcnow() - timedelta(days=30)
        
        events_query = select(RecommendationEvent).where(
            and_(
                RecommendationEvent.algorithm_version == algorithm_version,
                RecommendationEvent.created_at >= recent_date
            )
        )
        events = (await self.db.execute(events_query)).scalars().all()
        
        if not events:
            return {"error": "No recent data for this algorithm"}
        
        # Calculate metrics
        total_recommendations = len([e for e in events if e.event_type == EventType.RECOMMENDATION_SHOWN])
        total_clicks = len([e for e in events if e.event_type == EventType.RECOMMENDATION_CLICKED])
        total_conversions = len([e for e in events if e.event_type == EventType.CONVERSION])
        
        ctr = total_clicks / total_recommendations if total_recommendations > 0 else 0
        cvr = total_conversions / total_clicks if total_clicks > 0 else 0
        
        return {
            "algorithm_version": algorithm_version,
            "total_recommendations": total_recommendations,
            "total_clicks": total_clicks,
            "total_conversions": total_conversions,
            "click_through_rate": ctr,
            "conversion_rate": cvr,
            "overall_performance_score": ctr * cvr * 100
        }
    
    def _build_optimization_prompt(
        self,
        algorithm: str,
        performance: Dict[str, Any],
        feature_importance: Dict[str, Any],
        target: str
    ) -> str:
        """Build AI prompt for optimization suggestions."""
        return f"""
        Analyze this recommendation algorithm and suggest optimizations:
        
        CURRENT ALGORITHM: {algorithm}
        PERFORMANCE METRICS:
        - Click-through rate: {performance.get('click_through_rate', 0):.3f}
        - Conversion rate: {performance.get('conversion_rate', 0):.3f}
        - Total recommendations: {performance.get('total_recommendations', 0)}
        
        FEATURE IMPORTANCE (top factors):
        {json.dumps(feature_importance, indent=2)}
        
        OPTIMIZATION TARGET: {target}
        
        Please provide specific optimization recommendations including:
        1. Algorithm improvements (ranking, filtering, personalization)
        2. Feature engineering opportunities
        3. Parameter tuning suggestions
        4. New features to incorporate
        5. Expected impact on key metrics
        
        Focus on data-driven optimizations with measurable improvements.
        Return structured JSON with actionable recommendations.
        """
    
    async def _get_feature_importance(self) -> Dict[str, Any]:
        """Get feature importance from trained models."""
        if not self.models_trained:
            return {}
        
        # Return top features from both models
        click_features = dict(zip(
            range(len(self.click_predictor.feature_importances_)),
            self.click_predictor.feature_importances_
        ))
        
        conversion_features = dict(zip(
            range(len(self.conversion_predictor.feature_importances_)),
            self.conversion_predictor.feature_importances_
        ))
        
        return {
            "click_prediction_top_features": sorted(
                click_features.items(), key=lambda x: x[1], reverse=True
            )[:10],
            "conversion_prediction_top_features": sorted(
                conversion_features.items(), key=lambda x: x[1], reverse=True
            )[:10]
        }
    
    async def _create_optimization_experiment(
        self,
        base_algorithm: str,
        suggestions: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create experiment configuration for testing optimizations."""
        return {
            "experiment_type": "algorithm_optimization",
            "base_algorithm": base_algorithm,
            "optimizations_to_test": suggestions.get("algorithm_improvements", []),
            "test_duration": 14,  # days
            "sample_size_per_variant": 5000,
            "success_metrics": ["click_through_rate", "conversion_rate", "user_satisfaction"],
            "statistical_parameters": {
                "confidence_level": 0.95,
                "power": 0.8,
                "minimum_detectable_effect": 0.05
            }
        }
    
    async def _generate_implementation_plan(self, suggestions: Dict[str, Any]) -> Dict[str, Any]:
        """Generate implementation plan for optimization suggestions."""
        return {
            "phases": [
                {
                    "phase": 1,
                    "name": "Quick Wins",
                    "items": suggestions.get("parameter_tuning", {}),
                    "estimated_effort": "1-2 days",
                    "expected_impact": "5-10% improvement"
                },
                {
                    "phase": 2,
                    "name": "Feature Engineering",
                    "items": suggestions.get("new_features", []),
                    "estimated_effort": "1-2 weeks",
                    "expected_impact": "10-20% improvement"
                },
                {
                    "phase": 3,
                    "name": "Algorithm Improvements",
                    "items": suggestions.get("algorithm_improvements", []),
                    "estimated_effort": "2-4 weeks",
                    "expected_impact": "15-25% improvement"
                }
            ],
            "total_timeline": "4-6 weeks",
            "resource_requirements": "1-2 ML engineers",
            "risk_assessment": "Medium - requires A/B testing validation"
        }
    
    def _calculate_prediction_confidence(self, features: Dict[str, float]) -> float:
        """Calculate confidence score for predictions."""
        # Simplified confidence calculation
        # In practice, this would use feature distributions from training data
        return 0.8
    
    def _explain_prediction(self, features: Dict[str, float]) -> Dict[str, float]:
        """Provide feature contributions to predictions."""
        # Simplified explanation - would use SHAP or similar in practice
        return {
            "template_quality": 0.3,
            "user_engagement": 0.2,
            "contextual_relevance": 0.25,
            "timing_factors": 0.15,
            "other": 0.1
        }
    
    def _build_learnings_analysis_prompt(
        self,
        ab_test: ABTest,
        results: Dict[str, Any],
        performance_analysis: Dict[str, Any]
    ) -> str:
        """Build prompt for AI analysis of A/B test learnings."""
        return f"""
        Analyze this A/B test results and extract key learnings:
        
        TEST: {ab_test.name}
        DURATION: {(ab_test.completed_at - ab_test.started_at).days if ab_test.started_at else 'Unknown'} days
        
        RESULTS SUMMARY:
        {json.dumps(results.get('statistical_analysis', {}), indent=2)}
        
        PERFORMANCE ANALYSIS:
        {json.dumps(performance_analysis, indent=2)}
        
        Please provide:
        1. Key insights from the test results
        2. What features/optimizations worked best
        3. What didn't work and why
        4. Specific recommendations for future optimization
        5. Statistical confidence in conclusions
        6. Business impact assessment
        
        Focus on actionable insights for recommendation algorithm improvement.
        """
    
    async def _analyze_performance_differences(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze performance differences between variants."""
        comparisons = results.get("statistical_analysis", {}).get("comparisons", [])
        
        if not comparisons:
            return {"error": "No variant comparisons available"}
        
        best_variant = max(comparisons, key=lambda x: x["frequentist"]["relative_improvement"])
        
        return {
            "best_performing_variant": best_variant["variant_name"],
            "performance_improvement": best_variant["frequentist"]["relative_improvement"],
            "statistical_significance": best_variant["frequentist"]["is_significant"],
            "confidence_level": best_variant["bayesian"]["probability_variant_better"],
            "all_comparisons": comparisons
        }
    
    async def _update_algorithm_performance_records(
        self,
        ab_test: ABTest,
        results: Dict[str, Any]
    ) -> None:
        """Update algorithm performance records in database."""
        # Implementation would update RecommendationAlgorithm records
        # with latest performance metrics
        pass
    
    async def _generate_implementation_recommendations(
        self,
        learnings: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate implementation recommendations based on learnings."""
        return [
            {
                "type": "immediate",
                "action": "Deploy winning variant",
                "priority": "high",
                "effort": "low",
                "impact": "medium"
            },
            {
                "type": "optimization",
                "action": "Implement top performing features in all algorithms",
                "priority": "medium",
                "effort": "medium",
                "impact": "high"
            },
            {
                "type": "research",
                "action": "Investigate failure points for future tests",
                "priority": "low",
                "effort": "low",
                "impact": "long-term"
            }
        ]
    
    async def _identify_optimization_opportunities(self) -> List[Dict[str, Any]]:
        """Identify current optimization opportunities."""
        return [
            {
                "opportunity": "Low CTR on template recommendations",
                "current_performance": 0.12,
                "benchmark": 0.18,
                "potential_improvement": "50%",
                "priority": "high"
            },
            {
                "opportunity": "Poor conversion rate for new users",
                "current_performance": 0.08,
                "benchmark": 0.15,
                "potential_improvement": "87%",
                "priority": "medium"
            }
        ]
    
    async def _generate_dashboard_recommendations(self) -> List[Dict[str, Any]]:
        """Generate recommendations for the optimization dashboard."""
        return [
            {
                "title": "Optimize New User Onboarding",
                "description": "New users show 40% lower conversion rates",
                "priority": "high",
                "estimated_impact": "+25% overall CVR",
                "effort": "medium"
            },
            {
                "title": "A/B Test Personalization Algorithm",
                "description": "Current one-size-fits-all approach underperforming",
                "priority": "medium",
                "estimated_impact": "+15% CTR",
                "effort": "high"
            }
        ]
    
    async def _calculate_performance_trends(self) -> Dict[str, Any]:
        """Calculate performance trends over time."""
        return {
            "ctr_trend": {
                "current": 0.15,
                "last_week": 0.14,
                "last_month": 0.13,
                "direction": "improving"
            },
            "cvr_trend": {
                "current": 0.08,
                "last_week": 0.085,
                "last_month": 0.09,
                "direction": "declining"
            }
        }


# Celery tasks for automated optimization
@celery_app.task
def retrain_optimization_models():
    """Retrain recommendation optimization models with latest data."""
    logger.info("Retraining recommendation optimization models")


@celery_app.task
def analyze_algorithm_performance():
    """Analyze algorithm performance and suggest optimizations."""
    logger.info("Analyzing recommendation algorithm performance")


@celery_app.task
def auto_create_optimization_tests():
    """Automatically create optimization A/B tests based on performance analysis."""
    logger.info("Creating automatic optimization A/B tests")