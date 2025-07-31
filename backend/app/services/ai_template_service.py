"""
AI-powered template generation service.
Provides intelligent template creation, optimization, and customization.
"""

import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.template import Template, TemplateComponent, TemplateCategory, TemplateStatus
from app.models.user import User
from app.services.template_service import TemplateService
from app.services.ai_service import AIService
from app.schemas.template import TemplateCreate, TemplateComponentCreate
from app.core.celery import celery_app

logger = logging.getLogger(__name__)


class AITemplateService:
    """AI-powered template generation and optimization service."""
    
    def __init__(self, db: AsyncSession, ai_service: AIService = None):
        self.db = db
        self.template_service = TemplateService(db)
        self.ai_service = ai_service or AIService()
    
    async def generate_template_from_description(
        self, 
        description: str, 
        category: TemplateCategory,
        user_id: Optional[int] = None,
        style_preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a complete template from natural language description.
        
        Args:
            description: Natural language description of desired template
            category: Template category (landing, ecommerce, etc.)
            user_id: Optional user ID for personalization
            style_preferences: Style and layout preferences
            
        Returns:
            Generated template data with components
        """
        try:
            # Generate template structure using AI
            prompt = self._build_template_generation_prompt(
                description, category, style_preferences
            )
            
            ai_response = await self.ai_service.generate_json_response(
                prompt,
                expected_schema={
                    "template": {
                        "name": str,
                        "description": str,
                        "category": str,
                        "components": List[Dict],
                        "layout": Dict,
                        "styles": Dict
                    }
                }
            )
            
            template_data = ai_response.get("template", {})
            
            # Create template object
            template_create = TemplateCreate(
                name=template_data.get("name", f"AI Generated {category.value.title()}"),
                description=template_data.get("description", description),
                category=category,
                thumbnail="/api/placeholder/400/300",  # Placeholder
                components=template_data.get("components", []),
                is_featured=False,
                is_premium=False,
                created_by=user_id,
                ai_generated=True,
                generation_metadata={
                    "original_description": description,
                    "style_preferences": style_preferences or {},
                    "generation_time": datetime.utcnow().isoformat(),
                    "ai_model": "gemini-1.5-flash"
                }
            )
            
            # Save template to database
            template = await self.template_service.create(template_create)
            
            # Queue optimization task
            if template:
                await self._queue_template_optimization(template.id)
            
            return {
                "success": True,
                "template": template,
                "components_count": len(template_data.get("components", [])),
                "optimization_queued": template is not None
            }
            
        except Exception as e:
            logger.error(f"Error generating template: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "template": None
            }
    
    async def optimize_template_for_conversion(
        self, 
        template_id: int, 
        target_metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Optimize existing template for better conversion rates.
        
        Args:
            template_id: ID of template to optimize
            target_metrics: Target conversion metrics (CTR, bounce rate, etc.)
            
        Returns:
            Optimization results with suggestions
        """
        try:
            template = await self.template_service.get_by_id(template_id)
            if not template:
                return {"success": False, "error": "Template not found"}
            
            # Analyze template for optimization opportunities
            prompt = self._build_optimization_prompt(template, target_metrics)
            
            ai_response = await self.ai_service.generate_json_response(
                prompt,
                expected_schema={
                    "optimization": {
                        "suggestions": List[Dict],
                        "a_b_test_variants": List[Dict],
                        "performance_predictions": Dict,
                        "priority_changes": List[Dict]
                    }
                }
            )
            
            optimization_data = ai_response.get("optimization", {})
            
            # Save optimization metadata
            template.optimization_metadata = {
                **(template.optimization_metadata or {}),
                "last_optimization": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "target_metrics": target_metrics,
                    "suggestions": optimization_data.get("suggestions", []),
                    "a_b_test_variants": optimization_data.get("a_b_test_variants", [])
                }
            }
            
            await self.db.commit()
            
            return {
                "success": True,
                "template_id": template_id,
                "suggestions": optimization_data.get("suggestions", []),
                "a_b_test_variants": optimization_data.get("a_b_test_variants", []),
                "performance_predictions": optimization_data.get("performance_predictions", {})
            }
            
        except Exception as e:
            logger.error(f"Error optimizing template: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def generate_template_variants(
        self,
        base_template_id: int,
        variant_count: int = 3,
        variation_type: str = "aesthetic"
    ) -> List[Dict[str, Any]]:
        """
        Generate multiple variants of a template for A/B testing.
        
        Args:
            base_template_id: ID of base template
            variant_count: Number of variants to generate
            variation_type: Type of variation (aesthetic, layout, content)
            
        Returns:
            List of template variants
        """
        try:
            base_template = await self.template_service.get_by_id(base_template_id)
            if not base_template:
                return []
            
            prompt = self._build_variant_generation_prompt(
                base_template, variant_count, variation_type
            )
            
            ai_response = await self.ai_service.generate_json_response(
                prompt,
                expected_schema={
                    "variants": List[Dict]
                }
            )
            
            variants = []
            for i, variant_data in enumerate(ai_response.get("variants", [])):
                variant_create = TemplateCreate(
                    name=f"{base_template.name} - Variant {i+1}",
                    description=f"{base_template.description} (Variant {i+1})",
                    category=base_template.category,
                    thumbnail=f"/api/placeholder/400/300?text=Variant+{i+1}",
                    components=variant_data.get("components", []),
                    is_featured=False,
                    is_premium=False,
                    parent_template_id=base_template_id,
                    variant_type=variation_type,
                    generation_metadata={
                        "base_template_id": base_template_id,
                        "variant_number": i+1,
                        "variation_type": variation_type,
                        "generation_time": datetime.utcnow().isoformat()
                    }
                )
                
                variant = await self.template_service.create(variant_create)
                if variant:
                    variants.append(variant)
            
            return variants
            
        except Exception as e:
            logger.error(f"Error generating variants: {str(e)}")
            return []
    
    async def personalize_template(
        self,
        template_id: int,
        user_data: Dict[str, Any],
        industry: str,
        brand_preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Personalize template based on user data and brand preferences.
        
        Args:
            template_id: ID of template to personalize
            user_data: User demographic and behavioral data
            industry: Target industry/business type
            brand_preferences: Brand colors, fonts, tone, etc.
            
        Returns:
            Personalized template data
        """
        try:
            template = await self.template_service.get_by_id(template_id)
            if not template:
                return {"success": False, "error": "Template not found"}
            
            prompt = self._build_personalization_prompt(
                template, user_data, industry, brand_preferences
            )
            
            ai_response = await self.ai_service.generate_json_response(
                prompt,
                expected_schema={
                    "personalization": {
                        "customized_components": List[Dict],
                        "style_adjustments": Dict,
                        "content_recommendations": List[Dict],
                        "seo_optimizations": Dict
                    }
                }
            )
            
            personalization_data = ai_response.get("personalization", {})
            
            # Create personalized template
            personalized_create = TemplateCreate(
                name=f"{template.name} - Personalized",
                description=f"Personalized version of {template.description}",
                category=template.category,
                thumbnail=template.thumbnail,
                components=personalization_data.get("customized_components", template.components),
                is_featured=False,
                is_premium=True,  # Personalized templates are premium
                personalization_metadata={
                    "base_template_id": template_id,
                    "user_data_hash": hash(str(user_data)),  # Hash for privacy
                    "industry": industry,
                    "brand_preferences": brand_preferences,
                    "personalization_time": datetime.utcnow().isoformat()
                }
            )
            
            personalized_template = await self.template_service.create(personalized_create)
            
            return {
                "success": True,
                "personalized_template": personalized_template,
                "style_adjustments": personalization_data.get("style_adjustments", {}),
                "content_recommendations": personalization_data.get("content_recommendations", []),
                "seo_optimizations": personalization_data.get("seo_optimizations", {})
            }
            
        except Exception as e:
            logger.error(f"Error personalizing template: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _build_template_generation_prompt(
        self, 
        description: str, 
        category: TemplateCategory,
        style_preferences: Optional[Dict[str, Any]]
    ) -> str:
        """Build AI prompt for template generation."""
        style_prefs = json.dumps(style_preferences or {}, indent=2)
        
        return f"""
        Generate a high-converting {category.value} website template based on the following requirements:
        
        DESCRIPTION: {description}
        CATEGORY: {category.value}
        STYLE PREFERENCES: {style_prefs}
        
        Requirements:
        1. Create a complete template with 5-10 strategically arranged components
        2. Optimize for conversion rates and user experience
        3. Include modern design patterns and best practices
        4. Ensure mobile responsiveness
        5. Add appropriate CTAs and conversion elements
        6. Use semantic HTML and accessibility best practices
        
        Return a JSON object with:
        - template: object with name, description, category, components, layout, and styles
        - Each component should have: type, name, props, styles, and positioning info
        - Focus on {category.value} industry best practices
        - Include performance optimization recommendations
        """
    
    def _build_optimization_prompt(
        self, 
        template: Template, 
        target_metrics: Dict[str, Any]
    ) -> str:
        """Build AI prompt for template optimization."""
        return f"""
        Analyze and optimize the following website template for better conversion rates:
        
        TEMPLATE: {template.name}
        DESCRIPTION: {template.description}
        CATEGORY: {template.category}
        TARGET METRICS: {json.dumps(target_metrics, indent=2)}
        
        Components: {len(template.components)} elements
        
        Provide optimization suggestions focusing on:
        1. Conversion rate optimization (CRO)
        2. User experience improvements
        3. A/B test variants
        4. Performance predictions
        5. Priority changes based on impact
        
        Return JSON with optimization recommendations.
        """
    
    def _build_variant_generation_prompt(
        self,
        template: Template,
        variant_count: int,
        variation_type: str
    ) -> str:
        """Build AI prompt for variant generation."""
        return f"""
        Create {variant_count} {variation_type} variants of this website template for A/B testing:
        
        BASE TEMPLATE: {template.name}
        DESCRIPTION: {template.description}
        CATEGORY: {template.category}
        VARIATION TYPE: {variation_type}
        
        Original components: {len(template.components)} elements
        
        Generate variants that test different:
        - Layout arrangements
        - Color schemes and styling
        - Component configurations
        - Content variations
        - CTA placements and designs
        
        Ensure each variant is significantly different for meaningful A/B testing.
        """
    
    def _build_personalization_prompt(
        self,
        template: Template,
        user_data: Dict[str, Any],
        industry: str,
        brand_preferences: Dict[str, Any]
    ) -> str:
        """Build AI prompt for personalization."""
        return f"""
        Personalize this website template for a {industry} business:
        
        TEMPLATE: {template.name}
        DESCRIPTION: {template.description}
        USER DATA: {json.dumps(user_data, indent=2)}
        BRAND PREFERENCES: {json.dumps(brand_preferences, indent=2)}
        
        Customize:
        1. Content and messaging for {industry}
        2. Visual styling based on brand preferences
        3. Component selection and arrangement
        4. Color schemes and typography
        5. Industry-specific features and CTAs
        6. SEO optimizations for {industry}
        
        Ensure the personalized template maintains conversion optimization while matching brand identity.
        """
    
    async def _queue_template_optimization(self, template_id: int):
        """Queue template optimization task for async processing."""
        try:
            celery_app.send_task(
                "optimize_template_async",
                args=[template_id],
                countdown=300  # 5 minutes delay
            )
        except Exception as e:
            logger.error(f"Error queuing optimization: {str(e)}")


@celery_app.task
def optimize_template_async(template_id: int):
    """Async task for template optimization."""
    # This would run optimization algorithms, generate performance reports,
    # and update template metadata with optimization suggestions
    logger.info(f"Queued optimization for template {template_id}")