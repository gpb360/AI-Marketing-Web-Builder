"""
Context Analysis Service for intelligent template recommendations.
Analyzes user context including industry, company size, goals, and business requirements.
"""

import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import json
import asyncio
from dataclasses import dataclass, asdict

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_

from app.services.base_service import BaseService
from app.services.ai_service import AIService
from app.models.template import Template, TemplateCategory
from app.models.user import User
from app.models.analytics import ComponentAnalytics, SiteAnalytics

logger = logging.getLogger(__name__)


@dataclass
class UserContext:
    """User context data structure."""
    industry: Optional[str] = None
    company_size: Optional[str] = None
    business_stage: Optional[str] = None
    target_audience: Optional[str] = None
    geographic_region: Optional[str] = None
    technical_expertise: Optional[str] = None
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    marketing_goals: List[str] = None
    existing_brand_assets: bool = False
    competitor_analysis: Dict[str, Any] = None

    def __post_init__(self):
        if self.marketing_goals is None:
            self.marketing_goals = []
        if self.competitor_analysis is None:
            self.competitor_analysis = {}


@dataclass
class BusinessRequirements:
    """Business requirements analysis."""
    primary_goal: str
    secondary_goals: List[str]
    required_features: List[str]
    preferred_style: str
    content_complexity: str
    integration_needs: List[str]
    compliance_requirements: List[str]
    performance_priorities: List[str]
    success_metrics: List[str]


@dataclass
class ContextAnalysisResult:
    """Result of context analysis."""
    context_score: float
    confidence_level: str
    industry_match: bool
    size_match: bool
    goals_alignment: float
    technical_fit: float
    budget_compatibility: float
    recommended_categories: List[str]
    suggested_features: List[str]
    potential_challenges: List[str]
    success_probability: float
    analysis_metadata: Dict[str, Any]


class ContextAnalysisService(BaseService):
    """Service for analyzing user context and business requirements."""

    def __init__(self, db_session: AsyncSession):
        super().__init__(db_session)
        self.ai_service = AIService()
        
        # Industry categorization mapping
        self.industry_categories = {
            "technology": ["saas", "software", "tech_startup", "ai_ml"],
            "ecommerce": ["retail", "online_store", "marketplace", "dropshipping"],
            "professional_services": ["consulting", "legal", "accounting", "healthcare"],
            "creative": ["design", "photography", "marketing_agency", "media"],
            "education": ["online_courses", "schools", "training", "coaching"],
            "finance": ["fintech", "banking", "insurance", "investment"],
            "real_estate": ["property_management", "real_estate_agency", "construction"],
            "food_beverage": ["restaurant", "catering", "food_delivery", "brewery"],
            "fitness_wellness": ["gym", "spa", "wellness", "personal_training"],
            "nonprofit": ["charity", "foundation", "social_cause", "community"]
        }
        
        # Company size impact factors
        self.size_factors = {
            "startup": {"complexity": 0.3, "features": 0.4, "budget": 0.2},
            "small_business": {"complexity": 0.5, "features": 0.6, "budget": 0.5},
            "medium_business": {"complexity": 0.7, "features": 0.8, "budget": 0.8},
            "enterprise": {"complexity": 0.9, "features": 1.0, "budget": 1.0}
        }

    async def analyze_user_context(
        self,
        user_id: str,
        context_data: Dict[str, Any],
        include_historical: bool = True
    ) -> ContextAnalysisResult:
        """
        Analyze comprehensive user context for template recommendations.
        
        Args:
            user_id: User identifier
            context_data: Raw context information
            include_historical: Whether to include historical usage data
            
        Returns:
            ContextAnalysisResult with detailed analysis
        """
        try:
            # Parse context data
            user_context = UserContext(**context_data)
            
            # Get historical data if requested
            historical_data = {}
            if include_historical:
                historical_data = await self._get_historical_context(user_id)
            
            # Perform multi-dimensional analysis
            industry_analysis = await self._analyze_industry_context(user_context)
            size_analysis = await self._analyze_company_size_context(user_context)
            goals_analysis = await self._analyze_goals_alignment(user_context)
            technical_analysis = await self._analyze_technical_requirements(user_context)
            budget_analysis = await self._analyze_budget_constraints(user_context)
            
            # Calculate composite scores
            context_score = await self._calculate_context_score(
                industry_analysis, size_analysis, goals_analysis, 
                technical_analysis, budget_analysis
            )
            
            # Determine confidence level
            confidence_level = self._determine_confidence_level(context_score, user_context)
            
            # Generate recommendations
            recommended_categories = await self._recommend_template_categories(user_context)
            suggested_features = await self._suggest_required_features(user_context)
            potential_challenges = await self._identify_potential_challenges(user_context)
            
            # Calculate success probability
            success_probability = await self._calculate_success_probability(
                user_context, historical_data
            )
            
            # Compile metadata
            analysis_metadata = {
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "industry_category": self._categorize_industry(user_context.industry),
                "size_category": user_context.company_size,
                "primary_goals": user_context.marketing_goals[:3],
                "context_completeness": self._calculate_context_completeness(user_context),
                "historical_data_available": bool(historical_data)
            }
            
            return ContextAnalysisResult(
                context_score=context_score,
                confidence_level=confidence_level,
                industry_match=industry_analysis["match_found"],
                size_match=size_analysis["appropriate_complexity"],
                goals_alignment=goals_analysis["alignment_score"],
                technical_fit=technical_analysis["compatibility_score"],
                budget_compatibility=budget_analysis["compatibility_score"],
                recommended_categories=recommended_categories,
                suggested_features=suggested_features,
                potential_challenges=potential_challenges,
                success_probability=success_probability,
                analysis_metadata=analysis_metadata
            )
            
        except Exception as e:
            logger.error(f"Error analyzing user context: {str(e)}")
            raise

    async def analyze_business_requirements(
        self,
        context_data: Dict[str, Any],
        project_description: str
    ) -> BusinessRequirements:
        """
        Analyze business requirements from context and project description.
        
        Args:
            context_data: User context information
            project_description: Natural language description of the project
            
        Returns:
            BusinessRequirements analysis
        """
        try:
            # Use AI to extract structured requirements
            analysis_prompt = f"""
            Analyze the following business context and project description to extract structured requirements:
            
            Context:
            - Industry: {context_data.get('industry', 'Not specified')}
            - Company Size: {context_data.get('company_size', 'Not specified')}
            - Goals: {', '.join(context_data.get('marketing_goals', []))}
            - Target Audience: {context_data.get('target_audience', 'Not specified')}
            - Budget: {context_data.get('budget_range', 'Not specified')}
            
            Project Description: {project_description}
            
            Extract and return JSON with:
            {{
                "primary_goal": "main business objective",
                "secondary_goals": ["additional objectives"],
                "required_features": ["essential features needed"],
                "preferred_style": "design style preference",
                "content_complexity": "simple/moderate/complex",
                "integration_needs": ["third-party integrations"],
                "compliance_requirements": ["regulatory needs"],
                "performance_priorities": ["performance requirements"],
                "success_metrics": ["how to measure success"]
            }}
            """
            
            ai_result = await self.ai_service.generate_json_response(analysis_prompt)
            
            return BusinessRequirements(
                primary_goal=ai_result.get("primary_goal", ""),
                secondary_goals=ai_result.get("secondary_goals", []),
                required_features=ai_result.get("required_features", []),
                preferred_style=ai_result.get("preferred_style", ""),
                content_complexity=ai_result.get("content_complexity", "moderate"),
                integration_needs=ai_result.get("integration_needs", []),
                compliance_requirements=ai_result.get("compliance_requirements", []),
                performance_priorities=ai_result.get("performance_priorities", []),
                success_metrics=ai_result.get("success_metrics", [])
            )
            
        except Exception as e:
            logger.error(f"Error analyzing business requirements: {str(e)}")
            raise

    async def score_template_suitability(
        self,
        template_id: int,
        user_context: UserContext,
        business_requirements: BusinessRequirements
    ) -> Dict[str, Any]:
        """
        Score how suitable a template is for the given context and requirements.
        
        Args:
            template_id: Template to evaluate
            user_context: User context information
            business_requirements: Business requirements analysis
            
        Returns:
            Detailed suitability scoring
        """
        try:
            # Get template information
            template = await self._get_template_details(template_id)
            if not template:
                raise ValueError(f"Template {template_id} not found")
            
            # Analyze template characteristics
            template_analysis = await self._analyze_template_characteristics(template)
            
            # Calculate dimension scores
            scores = {}
            
            # Industry alignment score
            scores["industry_alignment"] = await self._score_industry_alignment(
                template, user_context.industry
            )
            
            # Complexity match score
            scores["complexity_match"] = await self._score_complexity_match(
                template, user_context.company_size, business_requirements.content_complexity
            )
            
            # Goals alignment score
            scores["goals_alignment"] = await self._score_goals_alignment(
                template, user_context.marketing_goals, business_requirements.primary_goal
            )
            
            # Feature coverage score
            scores["feature_coverage"] = await self._score_feature_coverage(
                template, business_requirements.required_features
            )
            
            # Style compatibility score
            scores["style_compatibility"] = await self._score_style_compatibility(
                template, business_requirements.preferred_style
            )
            
            # Technical fit score
            scores["technical_fit"] = await self._score_technical_fit(
                template, user_context.technical_expertise, business_requirements.integration_needs
            )
            
            # Calculate weighted overall score
            weights = {
                "industry_alignment": 0.25,
                "complexity_match": 0.20,
                "goals_alignment": 0.20,
                "feature_coverage": 0.15,
                "style_compatibility": 0.10,
                "technical_fit": 0.10
            }
            
            overall_score = sum(
                scores[dimension] * weights[dimension]
                for dimension in weights
            )
            
            # Generate explanation
            explanation = await self._generate_suitability_explanation(
                template, scores, overall_score
            )
            
            # Identify potential issues
            potential_issues = await self._identify_template_issues(
                template, user_context, business_requirements, scores
            )
            
            return {
                "template_id": template_id,
                "overall_score": round(overall_score, 2),
                "dimension_scores": {k: round(v, 2) for k, v in scores.items()},
                "explanation": explanation,
                "potential_issues": potential_issues,
                "recommendation": self._get_recommendation_level(overall_score),
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "template_characteristics": template_analysis
            }
            
        except Exception as e:
            logger.error(f"Error scoring template suitability: {str(e)}")
            raise

    async def batch_analyze_templates(
        self,
        template_ids: List[int],
        user_context: UserContext,
        business_requirements: BusinessRequirements
    ) -> List[Dict[str, Any]]:
        """
        Analyze multiple templates in batch for efficiency.
        
        Args:
            template_ids: List of template IDs to analyze
            user_context: User context information
            business_requirements: Business requirements analysis
            
        Returns:
            List of template suitability analyses
        """
        try:
            # Process templates in parallel
            tasks = [
                self.score_template_suitability(template_id, user_context, business_requirements)
                for template_id in template_ids
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out failed analyses
            successful_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Failed to analyze template {template_ids[i]}: {str(result)}")
                else:
                    successful_results.append(result)
            
            # Sort by overall score
            successful_results.sort(key=lambda x: x["overall_score"], reverse=True)
            
            return successful_results
            
        except Exception as e:
            logger.error(f"Error in batch template analysis: {str(e)}")
            raise

    # Private helper methods
    
    async def _get_historical_context(self, user_id: str) -> Dict[str, Any]:
        """Get historical usage patterns for the user."""
        try:
            # Query user's past template usage
            query = select(SiteAnalytics).where(SiteAnalytics.user_id == user_id)
            result = await self.db_session.execute(query)
            analytics = result.scalars().all()
            
            if not analytics:
                return {}
            
            # Analyze patterns
            historical_data = {
                "total_sites": len(analytics),
                "average_conversion_rate": sum(a.conversion_rate or 0 for a in analytics) / len(analytics),
                "most_used_categories": [],
                "performance_trends": [],
                "common_components": []
            }
            
            return historical_data
            
        except Exception as e:
            logger.error(f"Error getting historical context: {str(e)}")
            return {}

    async def _analyze_industry_context(self, context: UserContext) -> Dict[str, Any]:
        """Analyze industry-specific context."""
        if not context.industry:
            return {"match_found": False, "category": None, "confidence": 0.0}
        
        category = self._categorize_industry(context.industry)
        
        return {
            "match_found": category is not None,
            "category": category,
            "confidence": 0.9 if category else 0.1,
            "industry_factors": self._get_industry_factors(context.industry)
        }

    async def _analyze_company_size_context(self, context: UserContext) -> Dict[str, Any]:
        """Analyze company size implications."""
        if not context.company_size:
            return {"appropriate_complexity": False, "size_factors": {}}
        
        size_factors = self.size_factors.get(context.company_size, {})
        
        return {
            "appropriate_complexity": bool(size_factors),
            "size_factors": size_factors,
            "recommended_complexity": self._get_recommended_complexity(context.company_size)
        }

    async def _analyze_goals_alignment(self, context: UserContext) -> Dict[str, Any]:
        """Analyze marketing goals alignment."""
        if not context.marketing_goals:
            return {"alignment_score": 0.0, "goal_categories": []}
        
        # Categorize goals
        goal_categories = []
        for goal in context.marketing_goals:
            category = self._categorize_goal(goal)
            if category:
                goal_categories.append(category)
        
        alignment_score = len(goal_categories) / max(len(context.marketing_goals), 1)
        
        return {
            "alignment_score": alignment_score,
            "goal_categories": goal_categories,
            "primary_focus": goal_categories[0] if goal_categories else None
        }

    async def _analyze_technical_requirements(self, context: UserContext) -> Dict[str, Any]:
        """Analyze technical compatibility."""
        expertise_levels = ["beginner", "intermediate", "advanced", "expert"]
        expertise_score = 0.25  # Default for not specified
        
        if context.technical_expertise in expertise_levels:
            expertise_score = (expertise_levels.index(context.technical_expertise) + 1) / len(expertise_levels)
        
        return {
            "compatibility_score": expertise_score,
            "expertise_level": context.technical_expertise or "beginner",
            "recommended_complexity": self._get_technical_complexity_recommendation(expertise_score)
        }

    async def _analyze_budget_constraints(self, context: UserContext) -> Dict[str, Any]:
        """Analyze budget compatibility."""
        budget_ranges = ["minimal", "low", "medium", "high", "unlimited"]
        budget_score = 0.5  # Default for not specified
        
        if context.budget_range in budget_ranges:
            budget_score = (budget_ranges.index(context.budget_range) + 1) / len(budget_ranges)
        
        return {
            "compatibility_score": budget_score,
            "budget_level": context.budget_range or "medium",
            "feature_recommendations": self._get_budget_appropriate_features(budget_score)
        }

    def _categorize_industry(self, industry: str) -> Optional[str]:
        """Categorize industry into template categories."""
        if not industry:
            return None
        
        industry_lower = industry.lower()
        for category, keywords in self.industry_categories.items():
            if any(keyword in industry_lower for keyword in keywords):
                return category
        
        return "business"  # Default category

    def _categorize_goal(self, goal: str) -> Optional[str]:
        """Categorize marketing goal."""
        goal_lower = goal.lower()
        
        if any(word in goal_lower for word in ["lead", "conversion", "sales"]):
            return "lead_generation"
        elif any(word in goal_lower for word in ["brand", "awareness", "recognition"]):
            return "brand_awareness"
        elif any(word in goal_lower for word in ["engage", "community", "social"]):
            return "engagement"
        elif any(word in goal_lower for word in ["educate", "inform", "content"]):
            return "education"
        elif any(word in goal_lower for word in ["ecommerce", "sell", "product"]):
            return "ecommerce"
        
        return "general"

    async def _calculate_context_score(self, *analyses) -> float:
        """Calculate composite context score."""
        scores = []
        for analysis in analyses:
            if isinstance(analysis, dict):
                if "compatibility_score" in analysis:
                    scores.append(analysis["compatibility_score"])
                elif "alignment_score" in analysis:
                    scores.append(analysis["alignment_score"])
                elif "confidence" in analysis:
                    scores.append(analysis["confidence"])
        
        return sum(scores) / max(len(scores), 1)

    def _determine_confidence_level(self, score: float, context: UserContext) -> str:
        """Determine confidence level of analysis."""
        completeness = self._calculate_context_completeness(context)
        
        if score >= 0.8 and completeness >= 0.7:
            return "high"
        elif score >= 0.6 and completeness >= 0.5:
            return "medium"
        else:
            return "low"

    def _calculate_context_completeness(self, context: UserContext) -> float:
        """Calculate how complete the context information is."""
        fields = asdict(context)
        completed_fields = sum(1 for value in fields.values() if value is not None and value != [] and value != {})
        return completed_fields / len(fields)

    async def _recommend_template_categories(self, context: UserContext) -> List[str]:
        """Recommend template categories based on context."""
        categories = []
        
        # Industry-based recommendations
        if context.industry:
            industry_category = self._categorize_industry(context.industry)
            if industry_category:
                categories.append(industry_category)
        
        # Goal-based recommendations
        for goal in context.marketing_goals:
            goal_category = self._categorize_goal(goal)
            if goal_category and goal_category not in categories:
                categories.append(goal_category)
        
        # Size-based recommendations
        if context.company_size in ["startup", "small_business"]:
            categories.extend(["landing_page", "portfolio"])
        elif context.company_size in ["medium_business", "enterprise"]:
            categories.extend(["corporate", "enterprise"])
        
        return categories[:5]  # Limit to top 5 recommendations

    async def _suggest_required_features(self, context: UserContext) -> List[str]:
        """Suggest required features based on context."""
        features = []
        
        # Industry-specific features
        if context.industry:
            industry_features = self._get_industry_features(context.industry)
            features.extend(industry_features)
        
        # Goal-specific features
        for goal in context.marketing_goals:
            goal_features = self._get_goal_features(goal)
            features.extend(goal_features)
        
        # Size-specific features
        if context.company_size:
            size_features = self._get_size_features(context.company_size)
            features.extend(size_features)
        
        return list(set(features))  # Remove duplicates

    async def _identify_potential_challenges(self, context: UserContext) -> List[str]:
        """Identify potential challenges based on context."""
        challenges = []
        
        if context.technical_expertise == "beginner":
            challenges.append("May need technical support for advanced customizations")
        
        if context.budget_range in ["minimal", "low"]:
            challenges.append("Limited budget may restrict premium features")
        
        if not context.existing_brand_assets:
            challenges.append("Will need to develop brand assets and guidelines")
        
        if context.timeline and "urgent" in context.timeline.lower():
            challenges.append("Tight timeline may limit customization options")
        
        return challenges

    async def _calculate_success_probability(
        self, 
        context: UserContext, 
        historical_data: Dict[str, Any]
    ) -> float:
        """Calculate probability of project success."""
        base_probability = 0.7  # Base 70% success rate
        
        # Adjust based on context completeness
        completeness = self._calculate_context_completeness(context)
        completeness_factor = completeness * 0.2
        
        # Adjust based on technical expertise
        expertise_factor = 0.0
        if context.technical_expertise:
            expertise_levels = ["beginner", "intermediate", "advanced", "expert"]
            if context.technical_expertise in expertise_levels:
                expertise_factor = (expertise_levels.index(context.technical_expertise) + 1) / len(expertise_levels) * 0.1
        
        # Adjust based on historical performance
        historical_factor = 0.0
        if historical_data and "average_conversion_rate" in historical_data:
            historical_factor = min(historical_data["average_conversion_rate"] / 100, 0.1)
        
        return min(base_probability + completeness_factor + expertise_factor + historical_factor, 1.0)

    # Additional helper methods for template scoring
    
    async def _get_template_details(self, template_id: int) -> Optional[Template]:
        """Get detailed template information."""
        query = select(Template).where(Template.id == template_id)
        result = await self.db_session.execute(query)
        return result.scalar_one_or_none()

    async def _analyze_template_characteristics(self, template: Template) -> Dict[str, Any]:
        """Analyze template characteristics for scoring."""
        return {
            "category": template.category,
            "complexity": self._assess_template_complexity(template),
            "features": self._extract_template_features(template),
            "style": self._analyze_template_style(template),
            "industry_focus": self._determine_template_industry_focus(template)
        }

    def _assess_template_complexity(self, template: Template) -> str:
        """Assess template complexity level."""
        component_count = len(template.components) if template.components else 0
        
        if component_count <= 5:
            return "simple"
        elif component_count <= 15:
            return "moderate"
        else:
            return "complex"

    def _extract_template_features(self, template: Template) -> List[str]:
        """Extract features from template."""
        features = []
        
        # Analyze components to identify features
        if template.components:
            for component in template.components:
                if component.get("type") == "contact_form":
                    features.append("contact_form")
                elif component.get("type") == "gallery":
                    features.append("image_gallery")
                elif component.get("type") == "testimonials":
                    features.append("testimonials")
                elif component.get("type") == "blog":
                    features.append("blog")
                elif component.get("type") == "ecommerce":
                    features.append("ecommerce")
        
        return features

    def _get_industry_factors(self, industry: str) -> Dict[str, float]:
        """Get industry-specific factors."""
        return {
            "visual_importance": 0.8 if "creative" in industry.lower() else 0.6,
            "trust_importance": 0.9 if any(word in industry.lower() for word in ["finance", "legal", "healthcare"]) else 0.7,
            "conversion_focus": 0.9 if "ecommerce" in industry.lower() else 0.6
        }

    def _get_industry_features(self, industry: str) -> List[str]:
        """Get features recommended for specific industries."""
        industry_lower = industry.lower()
        
        if "ecommerce" in industry_lower or "retail" in industry_lower:
            return ["product_catalog", "shopping_cart", "payment_integration", "reviews"]
        elif "restaurant" in industry_lower or "food" in industry_lower:
            return ["menu", "reservations", "location_map", "contact_form"]
        elif "professional" in industry_lower or "consulting" in industry_lower:
            return ["services", "testimonials", "contact_form", "about_team"]
        elif "creative" in industry_lower or "portfolio" in industry_lower:
            return ["portfolio", "image_gallery", "about", "contact_form"]
        
        return ["contact_form", "about", "services"]

    def _get_goal_features(self, goal: str) -> List[str]:
        """Get features for specific goals."""
        goal_lower = goal.lower()
        
        if any(word in goal_lower for word in ["lead", "conversion"]):
            return ["contact_form", "cta_buttons", "testimonials"]
        elif any(word in goal_lower for word in ["brand", "awareness"]):
            return ["about", "story", "team", "values"]
        elif "sales" in goal_lower:
            return ["product_showcase", "pricing", "testimonials", "guarantees"]
        
        return []

    def _get_size_features(self, company_size: str) -> List[str]:
        """Get features based on company size."""
        if company_size in ["startup", "small_business"]:
            return ["contact_form", "about", "services"]
        elif company_size in ["medium_business", "enterprise"]:
            return ["team", "case_studies", "resources", "support"]
        
        return []

    async def _score_industry_alignment(self, template: Template, industry: str) -> float:
        """Score industry alignment."""
        if not industry:
            return 0.5
        
        template_industry = self._determine_template_industry_focus(template)
        user_industry_category = self._categorize_industry(industry)
        
        if template_industry == user_industry_category:
            return 1.0
        elif template_industry == "business":  # Generic business template
            return 0.7
        else:
            return 0.3

    async def _score_complexity_match(self, template: Template, company_size: str, content_complexity: str) -> float:
        """Score complexity match."""
        template_complexity = self._assess_template_complexity(template)
        
        # Define ideal complexity mapping
        ideal_complexity = {
            "startup": "simple",
            "small_business": "moderate",
            "medium_business": "moderate",
            "enterprise": "complex"
        }
        
        target_complexity = ideal_complexity.get(company_size, "moderate")
        
        if template_complexity == target_complexity:
            return 1.0
        elif abs(["simple", "moderate", "complex"].index(template_complexity) - 
                 ["simple", "moderate", "complex"].index(target_complexity)) == 1:
            return 0.7
        else:
            return 0.3

    async def _score_goals_alignment(self, template: Template, marketing_goals: List[str], primary_goal: str) -> float:
        """Score goals alignment."""
        if not marketing_goals:
            return 0.5
        
        template_features = self._extract_template_features(template)
        
        # Score based on feature-goal alignment
        alignment_scores = []
        for goal in marketing_goals:
            goal_features = self._get_goal_features(goal)
            common_features = set(template_features) & set(goal_features)
            alignment = len(common_features) / max(len(goal_features), 1) if goal_features else 0.5
            alignment_scores.append(alignment)
        
        return sum(alignment_scores) / len(alignment_scores)

    async def _score_feature_coverage(self, template: Template, required_features: List[str]) -> float:
        """Score feature coverage."""
        if not required_features:
            return 1.0
        
        template_features = self._extract_template_features(template)
        covered_features = set(template_features) & set(required_features)
        
        return len(covered_features) / len(required_features)

    async def _score_style_compatibility(self, template: Template, preferred_style: str) -> float:
        """Score style compatibility."""
        if not preferred_style:
            return 0.8  # Neutral score if no preference
        
        template_style = self._analyze_template_style(template)
        
        # Simple style matching - in production this would be more sophisticated
        if preferred_style.lower() in template_style.lower():
            return 1.0
        else:
            return 0.6

    async def _score_technical_fit(self, template: Template, technical_expertise: str, integration_needs: List[str]) -> float:
        """Score technical fit."""
        complexity = self._assess_template_complexity(template)
        
        # Map expertise to complexity compatibility
        expertise_compatibility = {
            "beginner": {"simple": 1.0, "moderate": 0.6, "complex": 0.2},
            "intermediate": {"simple": 0.8, "moderate": 1.0, "complex": 0.7},
            "advanced": {"simple": 0.6, "moderate": 0.9, "complex": 1.0},
            "expert": {"simple": 0.5, "moderate": 0.8, "complex": 1.0}
        }
        
        expertise = technical_expertise or "beginner"
        return expertise_compatibility.get(expertise, {}).get(complexity, 0.5)

    def _analyze_template_style(self, template: Template) -> str:
        """Analyze template style characteristics."""
        # Placeholder implementation - would analyze actual template styles
        if template.category == "creative":
            return "modern creative"
        elif template.category == "corporate":
            return "professional corporate"
        elif template.category == "ecommerce":
            return "clean commercial"
        else:
            return "versatile business"

    def _determine_template_industry_focus(self, template: Template) -> str:
        """Determine template's industry focus."""
        category_mapping = {
            "portfolio": "creative",
            "ecommerce": "ecommerce", 
            "corporate": "professional_services",
            "restaurant": "food_beverage",
            "fitness": "fitness_wellness",
            "education": "education"
        }
        
        return category_mapping.get(template.category, "business")

    async def _generate_suitability_explanation(
        self, 
        template: Template, 
        scores: Dict[str, float], 
        overall_score: float
    ) -> str:
        """Generate human-readable explanation of suitability."""
        explanations = []
        
        if scores["industry_alignment"] >= 0.8:
            explanations.append("Excellent industry fit")
        elif scores["industry_alignment"] >= 0.6:
            explanations.append("Good industry compatibility")
        
        if scores["feature_coverage"] >= 0.8:
            explanations.append("Covers most required features")
        elif scores["feature_coverage"] < 0.5:
            explanations.append("Missing some key features")
        
        if scores["complexity_match"] >= 0.8:
            explanations.append("Appropriate complexity level")
        
        if overall_score >= 0.8:
            recommendation = "Highly recommended"
        elif overall_score >= 0.6:
            recommendation = "Good fit with minor considerations"
        else:
            recommendation = "May require significant customization"
        
        return f"{recommendation}. {'. '.join(explanations)}."

    async def _identify_template_issues(
        self,
        template: Template,
        context: UserContext,
        requirements: BusinessRequirements,
        scores: Dict[str, float]
    ) -> List[str]:
        """Identify potential issues with template selection."""
        issues = []
        
        if scores["feature_coverage"] < 0.5:
            missing_features = set(requirements.required_features) - set(self._extract_template_features(template))
            issues.append(f"Missing features: {', '.join(list(missing_features)[:3])}")
        
        if scores["complexity_match"] < 0.5:
            issues.append("Template complexity may not match your needs")
        
        if scores["technical_fit"] < 0.5:
            issues.append("May require technical expertise beyond your current level")
        
        if context.budget_range in ["minimal", "low"] and template.premium:
            issues.append("Premium template may exceed budget constraints")
        
        return issues

    def _get_recommendation_level(self, score: float) -> str:
        """Get recommendation level based on score."""
        if score >= 0.8:
            return "highly_recommended"
        elif score >= 0.6:
            return "recommended"
        elif score >= 0.4:
            return "consider_with_modifications"
        else:
            return "not_recommended"

    def _get_recommended_complexity(self, company_size: str) -> str:
        """Get recommended complexity for company size."""
        mapping = {
            "startup": "simple",
            "small_business": "moderate", 
            "medium_business": "moderate",
            "enterprise": "complex"
        }
        return mapping.get(company_size, "moderate")

    def _get_technical_complexity_recommendation(self, expertise_score: float) -> str:
        """Get technical complexity recommendation."""
        if expertise_score >= 0.8:
            return "complex"
        elif expertise_score >= 0.5:
            return "moderate"
        else:
            return "simple"

    def _get_budget_appropriate_features(self, budget_score: float) -> List[str]:
        """Get features appropriate for budget level."""
        if budget_score >= 0.8:
            return ["premium_components", "advanced_integrations", "custom_animations"]
        elif budget_score >= 0.5:
            return ["standard_components", "basic_integrations", "responsive_design"]
        else:
            return ["essential_components", "basic_layout", "mobile_friendly"]