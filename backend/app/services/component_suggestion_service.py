"""
Epic 4 - Story 4.1: Intelligent Component Suggestion Service
AI-powered component suggestions using semantic analysis and performance data.
"""

import asyncio
import logging
import json
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload

from app.models.template import TemplateComponent
from app.models.analytics import WorkflowAnalyticsEvent
from app.services.ai_service import AIService
from app.services.workflow_analytics_service import WorkflowAnalyticsService

logger = logging.getLogger(__name__)


class ComponentSuggestionService:
    """
    Epic 4 - Story 4.1: Intelligent Component Suggestions
    Provides AI-powered component recommendations based on context analysis,
    user patterns, and performance data from Epic 3 analytics.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AIService()
        self.analytics_service = WorkflowAnalyticsService(db)
        
        # Component performance cache
        self.component_performance_cache = {}
        self.cache_expiry = {}
        
        # Semantic similarity thresholds
        self.similarity_threshold = 0.75
        self.confidence_threshold = 0.6
        
    async def suggest_components(
        self,
        user_id: str,
        context: Dict[str, Any],
        current_components: List[Dict[str, Any]] = None,
        max_suggestions: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate intelligent component suggestions based on comprehensive context analysis.
        
        Args:
            user_id: User requesting suggestions
            context: Building context (industry, goals, current page state, etc.)
            current_components: Currently added components
            max_suggestions: Maximum number of suggestions to return
            
        Returns:
            List of component suggestions with reasoning and confidence scores
        """
        try:
            # Analyze user patterns and preferences
            user_patterns = await self._analyze_user_patterns(user_id)
            
            # Get component performance data
            performance_data = await self._get_component_performance_data()
            
            # Analyze current page context
            page_analysis = await self._analyze_page_context(context, current_components)
            
            # Generate AI-powered suggestions
            ai_suggestions = await self._generate_ai_suggestions(
                context=context,
                current_components=current_components or [],
                user_patterns=user_patterns,
                performance_data=performance_data,
                page_analysis=page_analysis
            )
            
            # Rank and filter suggestions
            ranked_suggestions = await self._rank_suggestions(
                suggestions=ai_suggestions,
                user_patterns=user_patterns,
                performance_data=performance_data
            )
            
            # Apply business rules and filters
            filtered_suggestions = await self._apply_business_filters(
                suggestions=ranked_suggestions,
                context=context,
                current_components=current_components or []
            )
            
            # Track suggestion generation for analytics
            await self._track_suggestion_generation(
                user_id=user_id,
                context=context,
                suggestions=filtered_suggestions[:max_suggestions],
                processing_time=datetime.utcnow()
            )
            
            return filtered_suggestions[:max_suggestions]
            
        except Exception as e:
            logger.error(f"Component suggestion generation failed for user {user_id}: {e}")
            return await self._get_fallback_suggestions(context, current_components)
    
    async def _analyze_user_patterns(self, user_id: str) -> Dict[str, Any]:
        """Analyze user's historical component usage patterns."""
        try:
            # Get user's component usage from analytics (Epic 3)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            usage_query = select(WorkflowAnalyticsEvent).where(
                and_(
                    WorkflowAnalyticsEvent.user_id == user_id,
                    WorkflowAnalyticsEvent.timestamp >= thirty_days_ago,
                    WorkflowAnalyticsEvent.component_id.isnot(None)
                )
            ).order_by(desc(WorkflowAnalyticsEvent.timestamp))
            
            result = await self.db.execute(usage_query)
            usage_events = result.scalars().all()
            
            # Analyze patterns
            component_frequency = {}
            component_success_rate = {}
            recent_preferences = []
            
            for event in usage_events:
                component_id = event.component_id
                if component_id:
                    component_frequency[component_id] = component_frequency.get(component_id, 0) + 1
                    
                    # Track success rate (conversion events)
                    if event.event_type.value == 'CONVERSION':
                        component_success_rate[component_id] = component_success_rate.get(component_id, 0) + 1
                    
                    # Track recent preferences (last 7 days)
                    if event.timestamp >= datetime.utcnow() - timedelta(days=7):
                        recent_preferences.append(component_id)
            
            return {
                'component_frequency': component_frequency,
                'component_success_rate': component_success_rate,
                'recent_preferences': recent_preferences[-10:],  # Last 10 components used
                'total_events': len(usage_events),
                'active_days': len(set(event.timestamp.date() for event in usage_events))
            }
            
        except Exception as e:
            logger.error(f"Failed to analyze user patterns for {user_id}: {e}")
            return {
                'component_frequency': {},
                'component_success_rate': {},
                'recent_preferences': [],
                'total_events': 0,
                'active_days': 0
            }
    
    async def _get_component_performance_data(self) -> Dict[str, Any]:
        """Get component performance data from Epic 3 analytics."""
        cache_key = 'component_performance'
        
        # Check cache
        if (cache_key in self.component_performance_cache and 
            cache_key in self.cache_expiry and 
            self.cache_expiry[cache_key] > datetime.utcnow()):
            return self.component_performance_cache[cache_key]
        
        try:
            # Get all template components with usage stats
            components_query = select(TemplateComponent).options(
                selectinload(TemplateComponent.usage_count)
            )
            result = await self.db.execute(components_query)
            components = result.scalars().all()
            
            # Calculate performance metrics for each component
            performance_data = {}
            
            for component in components:
                # Get analytics data for this component
                component_analytics = await self.analytics_service.get_component_performance_metrics(
                    component.id
                )
                
                performance_data[component.id] = {
                    'component_type': component.component_type,
                    'category': component.category,
                    'usage_count': component.usage_count,
                    'conversion_rate': component_analytics.get('conversion_rate', 0.0),
                    'engagement_score': component_analytics.get('engagement_score', 0.0),
                    'performance_score': component_analytics.get('performance_score', 0.0),
                    'popularity_score': min(component.usage_count / 100, 1.0),  # Normalized popularity
                    'tags': component.tags or []
                }
            
            # Cache for 1 hour
            self.component_performance_cache[cache_key] = performance_data
            self.cache_expiry[cache_key] = datetime.utcnow() + timedelta(hours=1)
            
            return performance_data
            
        except Exception as e:
            logger.error(f"Failed to get component performance data: {e}")
            return {}
    
    async def _analyze_page_context(
        self, 
        context: Dict[str, Any], 
        current_components: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze current page context for intelligent suggestions."""
        
        # Extract context information
        industry = context.get('industry', 'general')
        business_type = context.get('business_type', 'general')
        page_type = context.get('page_type', 'landing_page')
        goals = context.get('goals', [])
        target_audience = context.get('target_audience', 'general')
        
        # Analyze current components
        current_types = [comp.get('type', 'unknown') for comp in current_components]
        component_count = len(current_components)
        
        # Identify missing essential components
        essential_components = self._get_essential_components_for_context(
            industry, business_type, page_type, goals
        )
        
        missing_essentials = [
            comp for comp in essential_components 
            if comp not in current_types
        ]
        
        # Calculate page completeness score
        completeness_score = len(current_types) / max(len(essential_components), 1)
        
        return {
            'industry': industry,
            'business_type': business_type,
            'page_type': page_type,
            'goals': goals,
            'target_audience': target_audience,
            'current_component_types': current_types,
            'component_count': component_count,
            'essential_components': essential_components,
            'missing_essentials': missing_essentials,
            'completeness_score': min(completeness_score, 1.0),
            'conversion_funnel_stage': self._identify_conversion_stage(current_types),
            'user_journey_gaps': self._identify_user_journey_gaps(current_types, goals)
        }
    
    def _get_essential_components_for_context(
        self, 
        industry: str, 
        business_type: str, 
        page_type: str, 
        goals: List[str]
    ) -> List[str]:
        """Get essential component types for the given context."""
        
        # Base essentials for most pages
        essentials = ['header', 'hero', 'footer']
        
        # Page type specific essentials
        if page_type == 'landing_page':
            essentials.extend(['hero', 'features', 'cta', 'testimonials'])
        elif page_type == 'contact':
            essentials.extend(['contact-form', 'contact-info'])
        elif page_type == 'about':
            essentials.extend(['team', 'story', 'values'])
        elif page_type == 'product':
            essentials.extend(['product-gallery', 'product-details', 'pricing'])
        
        # Industry specific essentials
        if industry == 'ecommerce':
            essentials.extend(['product-grid', 'shopping-cart', 'payment'])
        elif industry == 'restaurant':
            essentials.extend(['menu', 'reservation', 'location'])
        elif industry == 'healthcare':
            essentials.extend(['services', 'appointment', 'credentials'])
        elif industry == 'real_estate':
            essentials.extend(['property-gallery', 'search', 'contact-agent'])
        
        # Goal specific essentials
        if 'lead_generation' in goals:
            essentials.extend(['contact-form', 'newsletter-signup', 'lead-magnet'])
        if 'sales' in goals:
            essentials.extend(['pricing', 'product-showcase', 'checkout'])
        if 'brand_awareness' in goals:
            essentials.extend(['brand-story', 'social-proof', 'blog'])
        
        return list(set(essentials))  # Remove duplicates
    
    def _identify_conversion_stage(self, current_types: List[str]) -> str:
        """Identify which stage of conversion funnel the page is at."""
        
        # Awareness stage components
        awareness_components = ['hero', 'brand-story', 'video', 'blog']
        
        # Consideration stage components  
        consideration_components = ['features', 'testimonials', 'case-studies', 'comparison']
        
        # Decision stage components
        decision_components = ['pricing', 'cta', 'contact-form', 'free-trial']
        
        # Action stage components
        action_components = ['checkout', 'payment', 'signup-form', 'download']
        
        # Count components in each stage
        awareness_count = sum(1 for comp in current_types if comp in awareness_components)
        consideration_count = sum(1 for comp in current_types if comp in consideration_components)
        decision_count = sum(1 for comp in current_types if comp in decision_components)
        action_count = sum(1 for comp in current_types if comp in action_components)
        
        # Determine dominant stage
        counts = {
            'awareness': awareness_count,
            'consideration': consideration_count,
            'decision': decision_count,
            'action': action_count
        }
        
        return max(counts.items(), key=lambda x: x[1])[0]
    
    def _identify_user_journey_gaps(self, current_types: List[str], goals: List[str]) -> List[str]:
        """Identify gaps in the user journey based on current components and goals."""
        gaps = []
        
        # Check for trust building elements
        trust_components = ['testimonials', 'reviews', 'certifications', 'security-badges']
        if not any(comp in current_types for comp in trust_components):
            gaps.append('trust_building')
        
        # Check for engagement elements
        engagement_components = ['interactive-demo', 'calculator', 'quiz', 'video']
        if not any(comp in current_types for comp in engagement_components):
            gaps.append('engagement')
        
        # Check for conversion elements
        conversion_components = ['cta', 'contact-form', 'pricing', 'signup']
        if not any(comp in current_types for comp in conversion_components):
            gaps.append('conversion')
        
        # Goal-specific gaps
        if 'lead_generation' in goals:
            lead_components = ['lead-magnet', 'newsletter-signup', 'contact-form']
            if not any(comp in current_types for comp in lead_components):
                gaps.append('lead_capture')
        
        return gaps
    
    async def _generate_ai_suggestions(
        self,
        context: Dict[str, Any],
        current_components: List[Dict[str, Any]],
        user_patterns: Dict[str, Any],
        performance_data: Dict[str, Any],
        page_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate AI-powered component suggestions."""
        
        try:
            # Use enhanced AI service from Epic 4
            suggestions = await self.ai_service.generate_component_suggestions(
                context={
                    'page_context': context,
                    'current_components': current_components,
                    'user_patterns': user_patterns,
                    'page_analysis': page_analysis,
                    'missing_essentials': page_analysis['missing_essentials'],
                    'conversion_stage': page_analysis['conversion_funnel_stage'],
                    'user_journey_gaps': page_analysis['user_journey_gaps']
                },
                current_components=current_components,
                user_preferences={
                    'recent_components': user_patterns['recent_preferences'],
                    'successful_components': list(user_patterns['component_success_rate'].keys())
                }
            )
            
            # Enhance AI suggestions with performance data
            enhanced_suggestions = []
            for suggestion in suggestions:
                component_type = suggestion.get('component_type')
                
                # Find matching components in performance data
                matching_components = [
                    (comp_id, data) for comp_id, data in performance_data.items()
                    if data['component_type'] == component_type
                ]
                
                if matching_components:
                    # Get best performing component of this type
                    best_component = max(
                        matching_components, 
                        key=lambda x: x[1]['performance_score']
                    )
                    
                    suggestion['recommended_component_id'] = best_component[0]
                    suggestion['performance_data'] = best_component[1]
                    suggestion['expected_performance'] = best_component[1]['performance_score']
                else:
                    suggestion['expected_performance'] = 0.5  # Default moderate performance
                
                enhanced_suggestions.append(suggestion)
            
            return enhanced_suggestions
            
        except Exception as e:
            logger.error(f"AI suggestion generation failed: {e}")
            return await self._get_rule_based_suggestions(context, current_components, page_analysis)
    
    async def _get_rule_based_suggestions(
        self, 
        context: Dict[str, Any], 
        current_components: List[Dict[str, Any]],
        page_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Fallback rule-based suggestions when AI fails."""
        
        suggestions = []
        current_types = [comp.get('type') for comp in current_components]
        
        # Suggest missing essential components first
        for essential in page_analysis['missing_essentials'][:3]:
            suggestions.append({
                'component_type': essential,
                'reasoning': f'Essential component for {page_analysis["page_type"]} pages in {page_analysis["industry"]} industry',
                'priority': 'high',
                'expected_impact': 'High - Essential for page completeness and user experience',
                'customization_suggestions': [f'Customize {essential} for {page_analysis["industry"]} industry'],
                'confidence_score': 0.9
            })
        
        # Suggest conversion optimization components
        if page_analysis['conversion_funnel_stage'] == 'awareness':
            suggestions.append({
                'component_type': 'testimonials',
                'reasoning': 'Build trust and credibility in awareness stage',
                'priority': 'medium',
                'expected_impact': 'Medium - Increases trust and engagement',
                'customization_suggestions': ['Add customer photos and specific results'],
                'confidence_score': 0.7
            })
        
        return suggestions[:5]
    
    async def _rank_suggestions(
        self,
        suggestions: List[Dict[str, Any]],
        user_patterns: Dict[str, Any],
        performance_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Rank suggestions based on multiple factors."""
        
        for suggestion in suggestions:
            score = 0.0
            
            # Base confidence score from AI
            score += suggestion.get('confidence_score', 0.0) * 0.3
            
            # Performance data weight
            score += suggestion.get('expected_performance', 0.0) * 0.3
            
            # Priority weight
            priority_weights = {'high': 1.0, 'medium': 0.7, 'low': 0.4}
            score += priority_weights.get(suggestion.get('priority', 'medium'), 0.7) * 0.2
            
            # User pattern weight (if user has used this component type before)
            component_type = suggestion.get('component_type')
            if component_type in user_patterns['component_frequency']:
                frequency_score = min(user_patterns['component_frequency'][component_type] / 10, 1.0)
                score += frequency_score * 0.2
            
            suggestion['ranking_score'] = score
        
        # Sort by ranking score
        return sorted(suggestions, key=lambda x: x.get('ranking_score', 0.0), reverse=True)
    
    async def _apply_business_filters(
        self,
        suggestions: List[Dict[str, Any]],
        context: Dict[str, Any],
        current_components: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Apply business rules and filters to suggestions."""
        
        filtered_suggestions = []
        current_types = [comp.get('type') for comp in current_components]
        
        for suggestion in suggestions:
            component_type = suggestion.get('component_type')
            
            # Skip if component already exists (unless it can have multiple instances)
            multi_instance_components = ['cta', 'testimonial', 'feature-card']
            if (component_type in current_types and 
                component_type not in multi_instance_components):
                continue
            
            # Skip if confidence is too low
            if suggestion.get('confidence_score', 0.0) < self.confidence_threshold:
                continue
            
            # Add business context validation
            suggestion['validation_passed'] = True
            suggestion['filter_reasons'] = []
            
            filtered_suggestions.append(suggestion)
        
        return filtered_suggestions
    
    async def _track_suggestion_generation(
        self,
        user_id: str,
        context: Dict[str, Any],
        suggestions: List[Dict[str, Any]],
        processing_time: datetime
    ):
        """Track suggestion generation for analytics and improvement."""
        
        try:
            # This would integrate with Epic 3 analytics system
            # For now, just log the generation
            logger.info(
                f"Generated {len(suggestions)} component suggestions for user {user_id} "
                f"in {context.get('industry', 'unknown')} industry"
            )
            
            # TODO: Store in ai_feature_usage_analytics table
            # This will help track adoption rates and improve suggestions
            
        except Exception as e:
            logger.error(f"Failed to track suggestion generation: {e}")
    
    async def _get_fallback_suggestions(
        self, 
        context: Dict[str, Any], 
        current_components: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Get basic fallback suggestions when all else fails."""
        
        return [
            {
                'component_type': 'hero',
                'reasoning': 'Hero section is essential for most pages',
                'priority': 'high',
                'expected_impact': 'High - First impression and key messaging',
                'customization_suggestions': ['Add compelling headline and clear value proposition'],
                'confidence_score': 0.8,
                'ranking_score': 0.8
            },
            {
                'component_type': 'cta',
                'reasoning': 'Call-to-action drives conversions',
                'priority': 'high',
                'expected_impact': 'High - Direct impact on conversion rate',
                'customization_suggestions': ['Use action-oriented text and contrasting colors'],
                'confidence_score': 0.8,
                'ranking_score': 0.8
            }
        ]
    
    async def record_suggestion_feedback(
        self,
        user_id: str,
        suggestion_id: str,
        accepted: bool,
        feedback_score: Optional[int] = None,
        feedback_comments: Optional[str] = None
    ):
        """Record user feedback on suggestions for learning and improvement."""
        
        try:
            # TODO: Update component_suggestions table with feedback
            # This data will be used to improve future suggestions
            
            logger.info(
                f"Recorded suggestion feedback: user={user_id}, "
                f"accepted={accepted}, score={feedback_score}"
            )
            
        except Exception as e:
            logger.error(f"Failed to record suggestion feedback: {e}")
    
    async def get_suggestion_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get analytics on suggestion performance for user."""
        
        try:
            # TODO: Query ai_feature_usage_analytics table
            # Return suggestion acceptance rates, popular components, etc.
            
            return {
                'total_suggestions_generated': 0,
                'acceptance_rate': 0.0,
                'most_accepted_components': [],
                'average_satisfaction_score': 0.0
            }
            
        except Exception as e:
            logger.error(f"Failed to get suggestion analytics: {e}")
            return {}
    
    # Utility methods for component analysis
    
    def calculate_component_similarity(self, comp1: Dict[str, Any], comp2: Dict[str, Any]) -> float:
        """Calculate semantic similarity between two components."""
        # This would use embeddings in production
        # For now, simple rule-based similarity
        
        if comp1.get('type') == comp2.get('type'):
            return 1.0
        
        if comp1.get('category') == comp2.get('category'):
            return 0.7
        
        # Check for functional similarity
        similar_functions = {
            ('hero', 'banner'): 0.8,
            ('testimonials', 'reviews'): 0.9,
            ('contact-form', 'signup-form'): 0.8,
            ('pricing', 'plans'): 0.9
        }
        
        comp_pair = (comp1.get('type'), comp2.get('type'))
        reverse_pair = (comp2.get('type'), comp1.get('type'))
        
        return similar_functions.get(comp_pair, similar_functions.get(reverse_pair, 0.0))
    
    def get_component_conversion_impact(self, component_type: str, industry: str) -> float:
        """Get estimated conversion impact for component type in industry."""
        
        # Industry-specific conversion impacts
        impact_matrix = {
            'saas': {
                'hero': 0.85,
                'pricing': 0.95,
                'testimonials': 0.8,
                'free-trial': 0.9,
                'features': 0.75
            },
            'ecommerce': {
                'product-gallery': 0.9,
                'reviews': 0.85,
                'pricing': 0.9,
                'shipping-info': 0.7,
                'security-badges': 0.75
            },
            'default': {
                'hero': 0.8,
                'cta': 0.9,
                'testimonials': 0.75,
                'contact-form': 0.85,
                'features': 0.7
            }
        }
        
        industry_impacts = impact_matrix.get(industry, impact_matrix['default'])
        return industry_impacts.get(component_type, 0.6)  # Default moderate impact