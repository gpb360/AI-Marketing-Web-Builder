"""
AI service for integrating with Google Gemini API.
Provides AI-powered content generation and analysis capabilities.
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


class AIService:
    """AI service for content generation using Google Gemini API."""
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        self.session = None
        
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