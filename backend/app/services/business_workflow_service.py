"""
Business-specific workflow customization service.
Story #106: Add action customization with business-specific integrations and messaging.

This service provides AI-powered business analysis and customized workflow template generation
with intelligent integrations and messaging personalization.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc

from app.services.ai_service import ai_service
from app.services.workflow_service import WorkflowService
from app.models.workflow import Workflow, WorkflowCategory, WorkflowTemplate, TriggerType
from app.schemas.workflow import WorkflowCreate

logger = logging.getLogger(__name__)


class BusinessWorkflowService:
    """Service for business-specific workflow customization and AI-powered recommendations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.workflow_service = WorkflowService(db)
    
    async def analyze_business_requirements(
        self,
        website_content: Dict[str, Any],
        business_context: Optional[Dict[str, Any]] = None,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Analyze business requirements from website content and context.
        Returns comprehensive business analysis for workflow customization.
        
        Args:
            website_content: Scraped website content (title, meta, sections, etc.)
            business_context: Additional business information provided by user
            user_id: Optional user ID for tracking analysis history
            
        Returns:
            Comprehensive business analysis with workflow recommendations
        """
        try:
            # Use AI service for comprehensive website analysis
            async with ai_service:
                business_analysis = await ai_service.analyze_website_content(
                    website_content=website_content,
                    business_context=business_context
                )
            
            # Add analysis metadata
            business_analysis["analysis_metadata"] = {
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": user_id,
                "analysis_version": "1.0",
                "confidence_score": business_analysis.get("business_classification", {}).get("confidence", 0.8)
            }
            
            # Get industry benchmarks from historical data
            industry = business_analysis.get("business_classification", {}).get("industry", "General")
            benchmarks = await self._get_industry_benchmarks(industry)
            business_analysis["industry_benchmarks"] = benchmarks
            
            logger.info(f"Business analysis completed for industry: {industry}")
            return business_analysis
            
        except Exception as e:
            logger.error(f"Error in business analysis: {str(e)}")
            raise ValueError(f"Failed to analyze business requirements: {str(e)}")
    
    async def generate_customized_workflow_templates(
        self,
        business_analysis: Dict[str, Any],
        categories: List[WorkflowCategory],
        max_templates_per_category: int = 3,
        user_preferences: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate customized workflow templates based on business analysis.
        Creates templates with intelligent defaults and business-specific messaging.
        
        Args:
            business_analysis: Result from analyze_business_requirements
            categories: List of workflow categories to generate templates for
            max_templates_per_category: Maximum number of templates per category
            user_preferences: User preferences for customization
            
        Returns:
            List of customized workflow templates with success predictions
        """
        try:
            customized_templates = []
            
            for category in categories:
                category_name = category.value
                
                # Check if this category is recommended for this business
                workflow_recs = business_analysis.get("workflow_recommendations", {})
                category_rec = workflow_recs.get(category_name, {})
                
                if category_rec.get("priority", "low") == "low":
                    logger.info(f"Skipping low-priority category: {category_name}")
                    continue
                
                # Generate customized template for this category
                async with ai_service:
                    template_data = await ai_service.generate_workflow_template(
                        business_analysis=business_analysis,
                        category=category_name,
                        template_preferences=user_preferences
                    )
                
                # Add category-specific enhancements
                template_data["category_priority"] = category_rec.get("priority", "medium")
                template_data["expected_roi_range"] = category_rec.get("expected_roi", [100, 200])
                template_data["implementation_complexity"] = category_rec.get("implementation_complexity", "moderate")
                
                # Generate success prediction
                success_prediction = await self._predict_template_success(
                    template_data, business_analysis
                )
                template_data["success_prediction"] = success_prediction
                
                customized_templates.append(template_data)
                
                if len(customized_templates) >= max_templates_per_category:
                    break
            
            # Sort templates by success probability and relevance
            customized_templates.sort(
                key=lambda t: (
                    t.get("success_probability", 0.5) * 0.6 + 
                    self._calculate_relevance_score(t, business_analysis) * 0.4
                ),
                reverse=True
            )
            
            logger.info(f"Generated {len(customized_templates)} customized templates")
            return customized_templates
            
        except Exception as e:
            logger.error(f"Error generating customized templates: {str(e)}")
            raise ValueError(f"Failed to generate customized templates: {str(e)}")
    
    async def instantiate_workflow_template(
        self,
        template_data: Dict[str, Any],
        business_analysis: Dict[str, Any],
        user_id: int,
        customizations: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Instantiate a customized workflow template as an active workflow.
        Applies final customizations and creates the workflow in the system.
        
        Args:
            template_data: Generated template data
            business_analysis: Business analysis context
            user_id: User ID for workflow ownership
            customizations: Additional user customizations
            
        Returns:
            Created workflow details with setup instructions
        """
        try:
            # Apply final customizations
            final_customizations = customizations or {}
            
            # Generate customized email templates if workflow includes email actions
            email_templates = {}
            if self._workflow_has_email_actions(template_data):
                async with ai_service:
                    email_templates = await ai_service.customize_email_templates(
                        business_analysis=business_analysis,
                        template_context=template_data,
                        email_types=["welcome_email", "follow_up_email", "nurture_sequence"]
                    )
            
            # Create workflow using the workflow service
            workflow_create_data = WorkflowCreate(
                name=template_data.get("name", "Custom Workflow"),
                description=template_data.get("description", "AI-generated custom workflow"),
                category=WorkflowCategory(template_data.get("category", "marketing")),
                trigger_type=self._extract_trigger_type(template_data),
                nodes=template_data.get("nodes", []),
                connections=template_data.get("connections", []),
                settings={
                    "business_analysis": business_analysis,
                    "customizations_applied": template_data.get("customizations_applied", []),
                    "email_templates": email_templates,
                    "integration_requirements": template_data.get("integration_requirements", []),
                    "performance_predictions": template_data.get("performance_predictions", {}),
                    "success_prediction": template_data.get("success_prediction", {}),
                    "template_id": template_data.get("template_id"),
                    "ai_generated": True,
                    "generation_timestamp": datetime.utcnow().isoformat()
                }
            )
            
            # Create the workflow
            workflow = await self.workflow_service.create(
                workflow_create_data,
                owner_id=user_id
            )
            
            # Track template instantiation for learning engine
            await self._track_template_instantiation(template_data, workflow.id, user_id)
            
            # Generate setup instructions
            setup_instructions = await self._generate_setup_instructions(
                template_data, workflow, business_analysis
            )
            
            result = {
                "workflow_id": workflow.id,
                "workflow_name": workflow.name,
                "customizations_applied": template_data.get("customizations_applied", []),
                "estimated_setup_time": template_data.get("estimated_setup_time", 30),
                "setup_instructions": setup_instructions,
                "email_templates": email_templates,
                "integration_requirements": template_data.get("integration_requirements", []),
                "success_prediction": template_data.get("success_prediction", {}),
                "next_steps": [
                    "Review and customize email templates",
                    "Configure integrations (CRM, email service)",
                    "Test workflow with sample data",
                    "Activate workflow for production use",
                    "Monitor performance metrics"
                ]
            }
            
            logger.info(f"Instantiated workflow template: {workflow.id}")
            return result
            
        except Exception as e:
            logger.error(f"Error instantiating workflow template: {str(e)}")
            raise ValueError(f"Failed to instantiate workflow template: {str(e)}")
    
    async def get_workflow_success_insights(
        self,
        workflow_id: int,
        performance_period_days: int = 30
    ) -> Dict[str, Any]:
        """
        Generate success insights for a workflow based on performance data.
        Used by learning engine to improve future recommendations.
        
        Args:
            workflow_id: Workflow ID to analyze
            performance_period_days: Period for performance analysis
            
        Returns:
            Success insights and recommendations for optimization
        """
        try:
            # Get workflow and its performance data
            workflow = await self.workflow_service.get(workflow_id)
            if not workflow:
                raise ValueError(f"Workflow {workflow_id} not found")
            
            # Get executions from the last N days
            executions = await self.workflow_service.get_execution_stats(workflow_id)
            
            # Prepare performance data for analysis
            performance_data = [{
                "workflow_id": workflow_id,
                "category": workflow.category.value,
                "trigger_count": workflow.trigger_count,
                "success_count": workflow.success_count,
                "error_count": workflow.error_count,
                "success_rate": workflow.success_rate,
                "avg_execution_time": executions.get("avg_execution_time", 0),
                "business_context": workflow.settings.get("business_analysis", {}),
                "customizations": workflow.settings.get("customizations_applied", []),
                "performance_period": f"{performance_period_days}_days"
            }]
            
            # Get business context from workflow settings
            business_context = workflow.settings.get("business_analysis", {})
            
            # Generate insights using AI service
            async with ai_service:
                insights = await ai_service.generate_success_insights(
                    workflow_performance_data=performance_data,
                    business_context=business_context
                )
            
            # Add workflow-specific metadata
            insights["workflow_metadata"] = {
                "workflow_id": workflow_id,
                "workflow_name": workflow.name,
                "category": workflow.category.value,
                "age_days": (datetime.utcnow() - workflow.created_at).days,
                "current_success_rate": workflow.success_rate,
                "total_executions": workflow.trigger_count
            }
            
            logger.info(f"Generated success insights for workflow: {workflow_id}")
            return insights
            
        except Exception as e:
            logger.error(f"Error generating success insights: {str(e)}")
            raise ValueError(f"Failed to generate success insights: {str(e)}")
    
    async def update_learning_engine(
        self,
        insights_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Update the learning engine with new insights from workflow performance.
        Improves future template recommendations and success predictions.
        
        Args:
            insights_data: List of insights from multiple workflows
            
        Returns:
            Summary of learning engine updates
        """
        try:
            # Aggregate insights across workflows
            aggregated_insights = self._aggregate_insights(insights_data)
            
            # Update recommendation algorithms (placeholder for actual ML model updates)
            updates = {
                "success_patterns_updated": len(aggregated_insights.get("success_patterns", [])),
                "failure_analysis_updated": len(aggregated_insights.get("failure_analysis", [])),
                "industry_insights_updated": len(aggregated_insights.get("industry_insights", {})),
                "optimization_opportunities": len(aggregated_insights.get("optimization_opportunities", [])),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Store aggregated insights for future use
            # TODO: Implement proper ML model training and update mechanism
            
            logger.info(f"Updated learning engine with {len(insights_data)} insights")
            return updates
            
        except Exception as e:
            logger.error(f"Error updating learning engine: {str(e)}")
            raise ValueError(f"Failed to update learning engine: {str(e)}")
    
    # Private helper methods
    
    async def _get_industry_benchmarks(self, industry: str) -> Dict[str, Any]:
        """Get industry benchmarks from historical data."""
        # TODO: Implement actual benchmark retrieval from database
        # For now, return sample benchmarks
        return {
            "average_conversion_rate": 0.12,
            "average_setup_time": 5,
            "common_integrations": ["email", "crm", "analytics"],
            "success_factors": ["personalization", "timing", "follow-up"],
            "industry": industry
        }
    
    async def _predict_template_success(
        self,
        template_data: Dict[str, Any],
        business_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Predict template success using AI service."""
        try:
            async with ai_service:
                prediction = await ai_service.predict_workflow_success(
                    workflow_config=template_data,
                    business_analysis=business_analysis,
                    historical_data={}  # TODO: Add historical data
                )
            return prediction
        except Exception as e:
            logger.warning(f"Could not generate success prediction: {str(e)}")
            return {
                "overall_success_probability": 0.7,
                "confidence_level": 0.5,
                "expected_outcomes": {"conversion_rate_estimate": 0.1}
            }
    
    def _calculate_relevance_score(
        self,
        template_data: Dict[str, Any],
        business_analysis: Dict[str, Any]
    ) -> float:
        """Calculate template relevance score for business."""
        score = 0.5  # Base score
        
        # Industry match bonus
        template_category = template_data.get("category", "")
        workflow_recs = business_analysis.get("workflow_recommendations", {})
        if template_category in workflow_recs:
            category_priority = workflow_recs[template_category].get("priority", "medium")
            if category_priority == "high":
                score += 0.3
            elif category_priority == "medium":
                score += 0.2
        
        # Complexity match bonus
        business_maturity = business_analysis.get("marketing_maturity", {}).get("level", "basic")
        template_complexity = template_data.get("implementation_complexity", "moderate")
        
        if (business_maturity == "basic" and template_complexity == "simple") or \
           (business_maturity == "intermediate" and template_complexity == "moderate") or \
           (business_maturity == "advanced" and template_complexity == "complex"):
            score += 0.2
        
        return min(score, 1.0)
    
    def _workflow_has_email_actions(self, template_data: Dict[str, Any]) -> bool:
        """Check if workflow template includes email actions."""
        nodes = template_data.get("nodes", [])
        return any(node.get("type") == "email" for node in nodes)
    
    def _extract_trigger_type(self, template_data: Dict[str, Any]) -> TriggerType:
        """Extract trigger type from template data."""
        nodes = template_data.get("nodes", [])
        trigger_nodes = [node for node in nodes if node.get("type") == "trigger"]
        
        if trigger_nodes:
            trigger_config = trigger_nodes[0].get("config", {})
            trigger_type_str = trigger_config.get("trigger_type", "form_submit")
            
            # Map string to TriggerType enum
            trigger_type_mapping = {
                "form_submit": TriggerType.FORM_SUBMIT,
                "button_click": TriggerType.BUTTON_CLICK,
                "page_view": TriggerType.PAGE_VIEW,
                "webhook": TriggerType.WEBHOOK,
                "manual": TriggerType.MANUAL
            }
            
            return trigger_type_mapping.get(trigger_type_str, TriggerType.FORM_SUBMIT)
        
        return TriggerType.MANUAL
    
    async def _track_template_instantiation(
        self,
        template_data: Dict[str, Any],
        workflow_id: int,
        user_id: int
    ) -> None:
        """Track template instantiation for learning engine."""
        # TODO: Implement tracking in database
        logger.info(f"Tracked template instantiation: {template_data.get('template_id')} -> {workflow_id}")
    
    async def _generate_setup_instructions(
        self,
        template_data: Dict[str, Any],
        workflow: Workflow,
        business_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate detailed setup instructions for the workflow."""
        instructions = []
        
        # Integration setup instructions
        integrations = template_data.get("integration_requirements", [])
        for integration in integrations:
            instructions.append({
                "step": f"Setup {integration['type']} integration",
                "description": f"Configure {integration['type']} service connection",
                "complexity": integration.get("setup_complexity", "medium"),
                "required": integration.get("required", False),
                "recommendations": integration.get("recommendations", [])
            })
        
        # Email template customization
        if self._workflow_has_email_actions(template_data):
            instructions.append({
                "step": "Customize email templates",
                "description": "Review and personalize email templates for your brand voice",
                "complexity": "low",
                "required": True,
                "details": "Email templates have been pre-customized based on your business analysis"
            })
        
        # Workflow testing
        instructions.append({
            "step": "Test workflow",
            "description": "Run test execution to verify workflow functionality",
            "complexity": "low",
            "required": True,
            "details": "Use sample data to test the complete workflow flow"
        })
        
        return instructions
    
    def _aggregate_insights(self, insights_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate insights from multiple workflows for learning engine."""
        aggregated = {
            "success_patterns": [],
            "failure_analysis": [],
            "optimization_opportunities": [],
            "industry_insights": {}
        }
        
        for insight in insights_data:
            if "success_patterns" in insight:
                aggregated["success_patterns"].extend(insight["success_patterns"])
            if "failure_analysis" in insight:
                aggregated["failure_analysis"].extend(insight["failure_analysis"])
            if "optimization_opportunities" in insight:
                aggregated["optimization_opportunities"].extend(insight["optimization_opportunities"])
            if "industry_insights" in insight:
                # Merge industry insights
                for key, value in insight["industry_insights"].items():
                    if key not in aggregated["industry_insights"]:
                        aggregated["industry_insights"][key] = []
                    if isinstance(value, list):
                        aggregated["industry_insights"][key].extend(value)
                    else:
                        aggregated["industry_insights"][key].append(value)
        
        return aggregated