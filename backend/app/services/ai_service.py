"""
AI service for integrating with Google Gemini API.
Provides AI-powered content generation and analysis capabilities.
Enhanced for Epic 4: Advanced AI Features with multi-model support.
"""

import logging
import json
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import aiohttp
import os
from functools import wraps
from asyncio import Semaphore
import hashlib

logger = logging.getLogger(__name__)


class RateLimiter:
    """Rate limiter for API calls."""
    
    def __init__(self, max_calls: int = 60, time_window: int = 60):
        self.max_calls = max_calls
        self.time_window = time_window
        self.calls = []
        self.semaphore = Semaphore(max_calls)
    
    async def acquire(self):
        """Acquire permission to make an API call."""
        await self.semaphore.acquire()
        
        now = datetime.utcnow()
        # Remove old calls outside the time window
        self.calls = [call for call in self.calls if now - call < timedelta(seconds=self.time_window)]
        
        if len(self.calls) >= self.max_calls:
            sleep_time = self.time_window - (now - self.calls[0]).total_seconds()
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
        
        self.calls.append(now)
        self.semaphore.release()


def rate_limit(max_calls: int = 60, time_window: int = 60):
    """Decorator for rate limiting."""
    limiter = RateLimiter(max_calls, time_window)
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            await limiter.acquire()
            return await func(*args, **kwargs)
        return wrapper
    return decorator


class IntelligentModelRouter:
    """Route AI requests to optimal models based on task complexity and requirements."""
    
    MODEL_ROUTING = {
        'component_suggestions': {
            'simple': 'gemini-1.5-flash',
            'complex': 'gpt-4-turbo'
        },
        'template_generation': {
            'default': 'claude-3.5-sonnet',
            'creative': 'gpt-4-turbo'
        },
        'workflow_creation': {
            'default': 'claude-3.5-sonnet'
        },
        'performance_analysis': {
            'default': 'gpt-4-turbo'
        }
    }
    
    async def select_model(self, task_type: str, context: Any = None) -> str:
        """Select optimal model for task based on context complexity."""
        
        if task_type not in self.MODEL_ROUTING:
            return 'gemini-1.5-flash'  # Default fallback
        
        task_config = self.MODEL_ROUTING[task_type]
        
        # Simple routing logic - can be enhanced with ML-based routing
        if task_type == 'component_suggestions':
            # Use complex model if context has many existing components
            if isinstance(context, dict) and len(context.get('existing_components', [])) > 10:
                return task_config.get('complex', task_config['simple'])
            return task_config['simple']
        
        return task_config.get('default', 'gemini-1.5-flash')


class AIService:
    """Enhanced AI service for Epic 4 advanced AI features with multi-model support."""
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        
        # Model configurations
        self.models = {
            'gemini-1.5-flash': {
                'base_url': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
                'api_key': self.api_key,
                'type': 'gemini'
            },
            'gpt-4-turbo': {
                'base_url': 'https://api.openai.com/v1/chat/completions',
                'api_key': self.openai_api_key,
                'type': 'openai'
            },
            'claude-3.5-sonnet': {
                'base_url': 'https://api.anthropic.com/v1/messages',
                'api_key': self.anthropic_api_key,
                'type': 'anthropic'
            }
        }
        
        # Epic 4: Intelligent model routing
        self.model_router = IntelligentModelRouter()
        self.session = None
        
        # Performance tracking
        self.request_count = 0
        self.total_latency = 0
        
        # Epic 4: AI feature caches
        self.component_suggestion_cache = {}
        self.template_generation_cache = {}
        self.workflow_creation_cache = {}
        
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    @rate_limit(max_calls=60, time_window=60)
    async def generate_response(self, prompt: str, max_tokens: int = 2000) -> str:
        """Generate text response using Gemini API."""
        if not self.api_key:
            logger.error("Google API key not found")
            raise ValueError("Google API key not configured")
        
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        headers = {
            "Content-Type": "application/json",
        }
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": max_tokens,
            }
        }
        
        url = f"{self.base_url}?key={self.api_key}"
        
        try:
            async with self.session.post(url, json=payload, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if "candidates" in data and data["candidates"]:
                        content = data["candidates"][0]["content"]["parts"][0]["text"]
                        return content.strip()
                    else:
                        logger.error(f"No candidates in response: {data}")
                        raise ValueError("No response generated")
                else:
                    error_text = await response.text()
                    logger.error(f"API error {response.status}: {error_text}")
                    raise ValueError(f"API request failed: {response.status}")
                    
        except aiohttp.ClientError as e:
            logger.error(f"Network error calling Gemini API: {str(e)}")
            raise ValueError(f"Network error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in AI service: {str(e)}")
            raise
    
    @rate_limit(max_calls=30, time_window=60)
    async def generate_json_response(
        self, 
        prompt: str, 
        expected_schema: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate JSON response using Gemini API."""
        json_prompt = f"""
        {prompt}
        
        Please respond with valid JSON only. Ensure the response is properly formatted and parseable.
        """
        
        try:
            response = await self.generate_response(json_prompt, max_tokens=4000)
            
            # Clean response to extract JSON
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            
            response = response.strip()
            
            # Parse JSON
            data = json.loads(response)
            
            # Validate against expected schema if provided
            if expected_schema:
                self._validate_schema(data, expected_schema)
            
            return data
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON response: {str(e)}")
            logger.error(f"Response: {response}")
            raise ValueError(f"Invalid JSON response: {str(e)}")
        except Exception as e:
            logger.error(f"Error processing JSON response: {str(e)}")
            raise
    
    def _validate_schema(self, data: Dict[str, Any], expected_schema: Dict[str, Any]) -> bool:
        """Validate response against expected schema."""
        try:
            self._check_schema_compatibility(data, expected_schema)
            return True
        except Exception as e:
            logger.warning(f"Schema validation warning: {str(e)}")
            return False
    
    def _check_schema_compatibility(self, data: Any, schema: Any, path: str = "") -> None:
        """Recursively check schema compatibility."""
        if isinstance(schema, dict):
            if not isinstance(data, dict):
                raise ValueError(f"Expected dict at {path}, got {type(data)}")
            
            for key, expected_type in schema.items():
                if key not in data:
                    raise ValueError(f"Missing key '{key}' at {path}")
                
                new_path = f"{path}.{key}" if path else key
                self._check_schema_compatibility(data[key], expected_type, new_path)
        
        elif isinstance(schema, list):
            if not isinstance(data, list):
                raise ValueError(f"Expected list at {path}, got {type(data)}")
            
            if schema and data:
                for i, item in enumerate(data):
                    self._check_schema_compatibility(item, schema[0], f"{path}[{i}]")
        
        elif schema == str:
            if not isinstance(data, str):
                raise ValueError(f"Expected string at {path}, got {type(data)}")
        
        elif schema == int:
            if not isinstance(data, int):
                raise ValueError(f"Expected int at {path}, got {type(data)}")
        
        elif schema == float:
            if not isinstance(data, (int, float)):
                raise ValueError(f"Expected float at {path}, got {type(data)}")
        
        elif schema == bool:
            if not isinstance(data, bool):
                raise ValueError(f"Expected bool at {path}, got {type(data)}")
    
    async def analyze_content(self, content: str, analysis_type: str = "general") -> Dict[str, Any]:
        """Analyze content for various metrics."""
        prompt = f"""
        Analyze the following content for {analysis_type}:
        
        CONTENT: {content}
        
        Provide analysis in JSON format with:
        - sentiment: overall sentiment (positive/negative/neutral)
        - keywords: top 10 relevant keywords
        - readability_score: readability score (0-100)
        - engagement_potential: engagement prediction (0-100)
        - seo_score: SEO optimization score (0-100)
        - suggestions: list of improvement suggestions
        """
        
        return await self.generate_json_response(prompt)
    
    async def generate_marketing_copy(
        self, 
        context: str, 
        target_audience: str, 
        tone: str = "professional"
    ) -> Dict[str, Any]:
        """Generate marketing copy variations."""
        prompt = f"""
        Generate marketing copy for:
        
        CONTEXT: {context}
        TARGET AUDIENCE: {target_audience}
        TONE: {tone}
        
        Provide JSON response with:
        - headline: compelling headline
        - subheadline: supporting subheadline
        - body_text: main body copy
        - cta_text: call-to-action text
        - seo_title: SEO-optimized title
        - seo_description: SEO meta description
        """
        
        return await self.generate_json_response(prompt)
    
    # Epic 4: Enhanced AI capabilities
    
    async def generate_component_suggestions(
        self, 
        context: Dict[str, Any],
        current_components: List[Dict[str, Any]] = None,
        user_preferences: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """Generate intelligent component suggestions based on context."""
        
        cache_key = self._generate_cache_key('component_suggestions', context)
        if cache_key in self.component_suggestion_cache:
            return self.component_suggestion_cache[cache_key]
        
        prompt = f"""
        Analyze the current website building context and suggest 5 highly relevant components:
        
        Context: {json.dumps(context)}
        Current Components: {json.dumps(current_components or [])}
        User Preferences: {json.dumps(user_preferences or {})}
        
        For each component suggestion, provide:
        - component_type: specific component type (header, hero, contact-form, etc.)
        - reasoning: why this component fits the context
        - priority: high/medium/low priority for this context
        - expected_impact: predicted conversion/engagement impact
        - customization_suggestions: specific customization recommendations
        
        Focus on:
        1. Industry best practices for the detected business type
        2. Conversion optimization opportunities
        3. User experience improvements
        4. Missing essential components for the use case
        5. Performance and accessibility considerations
        
        Return as JSON array of component suggestions.
        """
        
        optimal_model = await self.model_router.select_model('component_suggestions', context)
        suggestions = await self.generate_json_response_with_model(prompt, optimal_model)
        
        # Cache for 1 hour
        self.component_suggestion_cache[cache_key] = suggestions
        asyncio.create_task(self._expire_cache_key('component_suggestions', cache_key, 3600))
        
        return suggestions
    
    async def generate_template_from_description(
        self,
        description: str,
        business_context: Dict[str, Any],
        requirements: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Generate complete template from natural language description."""
        
        cache_key = self._generate_cache_key('template_generation', {
            'description': description,
            'context': business_context
        })
        
        if cache_key in self.template_generation_cache:
            return self.template_generation_cache[cache_key]
        
        prompt = f"""
        Generate a complete website template based on this description:
        
        Description: "{description}"
        
        Business Context:
        {json.dumps(business_context, indent=2)}
        
        Requirements:
        {json.dumps(requirements or {}, indent=2)}
        
        Generate a comprehensive template with:
        
        1. template_metadata:
           - name: descriptive template name
           - category: template category
           - description: detailed description
           - target_audience: specific target audience
           - estimated_conversion_rate: predicted conversion rate
        
        2. page_structure:
           - sections: ordered list of page sections
           - layout_type: grid/flex layout recommendations
           - responsive_breakpoints: mobile/tablet/desktop considerations
        
        3. components: array of components with:
           - id: unique component identifier
           - type: component type
           - position: section and order
           - props: default configuration
           - content: sample content
           - styling: recommended styling
        
        4. color_scheme:
           - primary_color: main brand color
           - secondary_color: accent color
           - background_colors: various background options
           - text_colors: text color hierarchy
        
        5. typography:
           - heading_fonts: recommended heading fonts
           - body_fonts: recommended body fonts
           - font_sizes: responsive font size scale
        
        6. optimization_features:
           - seo_recommendations: SEO optimization suggestions
           - performance_optimizations: loading and performance tips
           - accessibility_features: WCAG compliance features
           - conversion_optimizations: conversion rate optimization features
        
        Make the template production-ready with modern design principles,
        excellent user experience, and strong conversion potential.
        
        Return as structured JSON.
        """
        
        optimal_model = await self.model_router.select_model('template_generation')
        template = await self.generate_json_response_with_model(prompt, optimal_model, max_tokens=6000)
        
        # Cache for 2 hours
        self.template_generation_cache[cache_key] = template
        asyncio.create_task(self._expire_cache_key('template_generation', cache_key, 7200))
        
        return template
    
    async def create_workflow_from_natural_language(
        self,
        user_input: str,
        context: Dict[str, Any],
        existing_workflows: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create workflow configuration from natural language input."""
        
        cache_key = self._generate_cache_key('workflow_creation', {
            'input': user_input,
            'context': context
        })
        
        if cache_key in self.workflow_creation_cache:
            return self.workflow_creation_cache[cache_key]
        
        prompt = f"""
        Create a complete workflow configuration from this natural language request:
        
        User Request: "{user_input}"
        
        Context:
        {json.dumps(context, indent=2)}
        
        Existing Workflows (for reference):
        {json.dumps(existing_workflows or [], indent=2)}
        
        Generate a complete workflow with:
        
        1. workflow_metadata:
           - name: descriptive workflow name
           - description: what the workflow accomplishes
           - category: workflow category (email, crm, analytics, etc.)
           - estimated_execution_time: expected runtime
           - complexity_level: simple/medium/complex
        
        2. trigger:
           - trigger_type: form_submit, button_click, schedule, webhook, etc.
           - trigger_config: specific trigger configuration
           - conditions: any trigger conditions
        
        3. workflow_steps: ordered array of steps with:
           - step_id: unique step identifier
           - step_type: action type (email, crm_update, webhook, condition, etc.)
           - name: human-readable step name
           - description: what this step does
           - configuration: step-specific configuration
           - error_handling: how to handle errors
           - retry_policy: retry configuration if applicable
        
        4. data_flow:
           - input_data: expected input data structure
           - data_transformations: any data transformations between steps
           - output_data: expected output data structure
        
        5. success_criteria:
           - completion_conditions: when workflow is considered successful
           - success_metrics: metrics to track success
           - failure_conditions: what constitutes failure
        
        6. optimization_suggestions:
           - performance_tips: ways to improve workflow performance
           - reliability_improvements: ways to make workflow more reliable
           - user_experience_enhancements: UX improvements
        
        Make the workflow practical, reliable, and aligned with marketing automation best practices.
        Include proper error handling and user feedback mechanisms.
        
        Return as structured JSON.
        """
        
        optimal_model = await self.model_router.select_model('workflow_creation')
        workflow = await self.generate_json_response_with_model(prompt, optimal_model, max_tokens=4000)
        
        # Cache for 30 minutes
        self.workflow_creation_cache[cache_key] = workflow
        asyncio.create_task(self._expire_cache_key('workflow_creation', cache_key, 1800))
        
        return workflow
    
    async def predict_template_performance(
        self,
        template_data: Dict[str, Any],
        industry_context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Predict template performance using AI analysis."""
        
        prompt = f"""
        Analyze this website template and predict its performance:
        
        Template Data:
        {json.dumps(template_data, indent=2)}
        
        Industry Context:
        {json.dumps(industry_context or {}, indent=2)}
        
        Provide detailed performance predictions:
        
        1. conversion_predictions:
           - estimated_conversion_rate: percentage prediction with confidence interval
           - conversion_factors: specific elements that will drive conversions
           - conversion_barriers: elements that might hurt conversions
        
        2. engagement_predictions:
           - estimated_bounce_rate: predicted bounce rate
           - time_on_page_prediction: expected time on page
           - scroll_depth_prediction: expected scroll engagement
           - click_through_predictions: expected click-through rates for CTAs
        
        3. performance_analysis:
           - page_load_prediction: estimated page load time
           - mobile_performance_score: mobile experience rating (1-100)
           - seo_potential_score: SEO potential rating (1-100)
           - accessibility_score: accessibility compliance rating (1-100)
        
        4. improvement_recommendations:
           - high_impact_changes: changes likely to significantly improve performance
           - quick_wins: easy changes with good impact
           - advanced_optimizations: complex changes for marginal gains
        
        5. industry_comparison:
           - vs_industry_average: how this compares to industry benchmarks
           - competitive_advantages: what makes this template stand out
           - competitive_weaknesses: areas where competitors might perform better
        
        6. confidence_assessment:
           - prediction_confidence: how confident we are in these predictions (1-100)
           - data_limitations: what data would improve prediction accuracy
           - recommendation_priority: priority ranking of recommendations
        
        Base your analysis on proven UX principles, conversion optimization best practices,
        and modern web performance standards.
        
        Return as structured JSON with specific, actionable insights.
        """
        
        optimal_model = await self.model_router.select_model('performance_analysis')
        return await self.generate_json_response_with_model(prompt, optimal_model, max_tokens=4000)
    
    # Epic 4: Enhanced utility methods
    
    async def generate_json_response_with_model(
        self,
        prompt: str,
        model: str,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """Generate JSON response using specific AI model."""
        
        model_config = self.models.get(model)
        if not model_config:
            # Fallback to default Gemini model
            return await self.generate_json_response(prompt)
        
        if model_config['type'] == 'gemini':
            return await self.generate_json_response(prompt)
        elif model_config['type'] == 'openai':
            return await self._generate_openai_json_response(prompt, model_config, max_tokens)
        elif model_config['type'] == 'anthropic':
            return await self._generate_anthropic_json_response(prompt, model_config, max_tokens)
        else:
            return await self.generate_json_response(prompt)
    
    async def _generate_openai_json_response(
        self,
        prompt: str,
        model_config: Dict[str, Any],
        max_tokens: int
    ) -> Dict[str, Any]:
        """Generate JSON response using OpenAI API."""
        
        if not model_config['api_key']:
            logger.warning("OpenAI API key not found, falling back to Gemini")
            return await self.generate_json_response(prompt)
        
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        headers = {
            "Authorization": f"Bearer {model_config['api_key']}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "gpt-4-turbo-preview",
            "messages": [
                {"role": "system", "content": "You are an expert AI assistant. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": 0.7,
            "response_format": {"type": "json_object"}
        }
        
        try:
            async with self.session.post(model_config['base_url'], json=payload, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if "choices" in data and data["choices"]:
                        content = data["choices"][0]["message"]["content"]
                        return json.loads(content.strip())
                    else:
                        logger.error(f"No choices in OpenAI response: {data}")
                        raise ValueError("No response generated")
                else:
                    error_text = await response.text()
                    logger.error(f"OpenAI API error {response.status}: {error_text}")
                    # Fallback to Gemini
                    return await self.generate_json_response(prompt)
        except Exception as e:
            logger.error(f"OpenAI API call failed: {str(e)}, falling back to Gemini")
            return await self.generate_json_response(prompt)
    
    async def _generate_anthropic_json_response(
        self,
        prompt: str,
        model_config: Dict[str, Any],
        max_tokens: int
    ) -> Dict[str, Any]:
        """Generate JSON response using Anthropic Claude API."""
        
        if not model_config['api_key']:
            logger.warning("Anthropic API key not found, falling back to Gemini")
            return await self.generate_json_response(prompt)
        
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        headers = {
            "x-api-key": model_config['api_key'],
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        json_instruction = "\n\nPlease respond with valid JSON only. Do not include any other text or formatting."
        
        payload = {
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": max_tokens,
            "temperature": 0.7,
            "messages": [
                {"role": "user", "content": prompt + json_instruction}
            ]
        }
        
        try:
            async with self.session.post(model_config['base_url'], json=payload, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if "content" in data and data["content"]:
                        content = data["content"][0]["text"]
                        
                        # Clean response to extract JSON
                        content = content.strip()
                        if content.startswith("```json"):
                            content = content[7:]
                        if content.startswith("```"):
                            content = content[3:]
                        if content.endswith("```"):
                            content = content[:-3]
                        
                        return json.loads(content.strip())
                    else:
                        logger.error(f"No content in Claude response: {data}")
                        raise ValueError("No response generated")
                else:
                    error_text = await response.text()
                    logger.error(f"Claude API error {response.status}: {error_text}")
                    # Fallback to Gemini
                    return await self.generate_json_response(prompt)
        except Exception as e:
            logger.error(f"Claude API call failed: {str(e)}, falling back to Gemini")
            return await self.generate_json_response(prompt)
    
    def _generate_cache_key(self, feature: str, data: Dict[str, Any]) -> str:
        """Generate cache key for AI responses."""
        data_str = json.dumps(data, sort_keys=True)
        hash_key = hashlib.md5(f"{feature}:{data_str}".encode()).hexdigest()
        return f"{feature}:{hash_key}"
    
    async def _expire_cache_key(self, cache_type: str, cache_key: str, delay: int):
        """Expire cache key after delay."""
        await asyncio.sleep(delay)
        
        cache_map = {
            'component_suggestions': self.component_suggestion_cache,
            'template_generation': self.template_generation_cache,
            'workflow_creation': self.workflow_creation_cache
        }
        
        cache = cache_map.get(cache_type)
        if cache and cache_key in cache:
            del cache[cache_key]
    
    # Performance tracking methods
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get AI service performance metrics."""
        avg_latency = self.total_latency / max(self.request_count, 1)
        
        return {
            "total_requests": self.request_count,
            "average_latency_ms": avg_latency,
            "cache_stats": {
                "component_suggestions_cached": len(self.component_suggestion_cache),
                "template_generation_cached": len(self.template_generation_cache),
                "workflow_creation_cached": len(self.workflow_creation_cache)
            },
            "model_availability": {
                "gemini": bool(self.api_key),
                "openai": bool(self.openai_api_key),
                "anthropic": bool(self.anthropic_api_key)
            }
        }
    
    async def clear_caches(self):
        """Clear all AI response caches."""
        self.component_suggestion_cache.clear()
        self.template_generation_cache.clear()
        self.workflow_creation_cache.clear()
        
        logger.info("All AI service caches cleared")