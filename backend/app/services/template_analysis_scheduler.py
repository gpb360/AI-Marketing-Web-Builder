"""
Template Analysis Scheduler Service.

Manages automated scheduling and execution of template performance analysis
with intelligent prioritization and resource management.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Set
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from dataclasses import dataclass
from enum import Enum

from app.core.database import get_async_db
from app.core.redis import redis_client
from app.models.template import Template, TemplateStatus
from app.models.analytics import TemplateAnalytics, TemplateRanking
from app.services.template_performance_service import TemplatePerformanceAnalyzer
from app.core.celery import celery_app

logger = logging.getLogger(__name__)


class AnalysisPriority(str, Enum):
    """Analysis priority levels."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class AnalysisStatus(str, Enum):
    """Analysis job status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class AnalysisJob:
    """Analysis job data structure."""
    template_id: str
    priority: AnalysisPriority
    scheduled_at: datetime
    last_analyzed: Optional[datetime]
    retry_count: int = 0
    max_retries: int = 3
    status: AnalysisStatus = AnalysisStatus.PENDING
    
    @property
    def priority_score(self) -> float:
        """Calculate priority score for job ordering."""
        base_scores = {
            AnalysisPriority.CRITICAL: 1000,
            AnalysisPriority.HIGH: 100,
            AnalysisPriority.NORMAL: 10,
            AnalysisPriority.LOW: 1
        }
        
        base_score = base_scores[self.priority]
        
        # Boost score based on time since last analysis
        if self.last_analyzed:
            days_since_analysis = (datetime.utcnow() - self.last_analyzed).days
            staleness_boost = min(50, days_since_analysis * 2)
        else:
            staleness_boost = 100  # Never analyzed before
        
        return base_score + staleness_boost


class TemplateAnalysisScheduler:
    """Main scheduler for template performance analysis."""
    
    def __init__(self):
        self.max_concurrent_jobs = 5
        self.analysis_interval_hours = 24
        self.running_jobs: Set[str] = set()
        self.job_queue: List[AnalysisJob] = []
        
    async def schedule_template_analysis(
        self, 
        template_id: str, 
        priority: AnalysisPriority = AnalysisPriority.NORMAL,
        force_refresh: bool = False
    ) -> str:
        """Schedule analysis for a specific template."""
        
        # Check if already scheduled or running
        job_key = f"analysis_job:{template_id}"
        existing_status = await redis_client.get(job_key)
        
        if existing_status and not force_refresh:
            if existing_status in [AnalysisStatus.PENDING.value, AnalysisStatus.RUNNING.value]:
                return f"Analysis already scheduled for template {template_id}"
        
        # Get last analysis time
        async for db in get_async_db():
            try:
                ranking_result = await db.execute(
                    select(TemplateRanking.last_analyzed_at)
                    .where(TemplateRanking.template_id == template_id)
                )
                last_analyzed = ranking_result.scalar()
                
                # Create analysis job
                job = AnalysisJob(
                    template_id=template_id,
                    priority=priority,
                    scheduled_at=datetime.utcnow(),
                    last_analyzed=last_analyzed
                )
                
                # Store in Redis for tracking
                await redis_client.setex(
                    job_key, 
                    3600 * 24,  # 24 hour expiry
                    AnalysisStatus.PENDING.value
                )
                
                # Schedule Celery task
                task_id = await self._schedule_celery_task(job)
                
                return task_id
                
            finally:
                await db.close()
    
    async def schedule_bulk_analysis(
        self, 
        template_ids: Optional[List[str]] = None,
        category: Optional[str] = None,
        priority: AnalysisPriority = AnalysisPriority.NORMAL,
        force_refresh: bool = False
    ) -> Dict[str, str]:
        """Schedule bulk analysis for multiple templates."""
        
        results = {}
        
        async for db in get_async_db():
            try:
                # Build query for templates to analyze
                query = select(Template.id, Template.name, TemplateRanking.last_analyzed_at)\
                    .outerjoin(TemplateRanking, Template.id == TemplateRanking.template_id)\
                    .where(Template.status == TemplateStatus.PUBLISHED)
                
                if template_ids:
                    query = query.where(Template.id.in_(template_ids))
                elif category:
                    query = query.where(Template.category == category)
                
                result = await db.execute(query)
                templates = result.fetchall()
                
                # Create analysis jobs with intelligent prioritization
                jobs = []
                for template_id, template_name, last_analyzed in templates:
                    # Determine priority based on staleness and importance
                    job_priority = await self._calculate_analysis_priority(
                        template_id, last_analyzed, priority, db
                    )
                    
                    job = AnalysisJob(
                        template_id=template_id,
                        priority=job_priority,
                        scheduled_at=datetime.utcnow(),
                        last_analyzed=last_analyzed
                    )
                    jobs.append(job)
                
                # Sort jobs by priority
                jobs.sort(key=lambda x: x.priority_score, reverse=True)
                
                # Schedule jobs with rate limiting
                for i, job in enumerate(jobs):
                    # Stagger scheduling to avoid overwhelming the system
                    delay_seconds = i * 10  # 10 second intervals
                    
                    task_id = await self._schedule_celery_task(job, delay_seconds)
                    results[job.template_id] = task_id
                
                return results
                
            finally:
                await db.close()
    
    async def _calculate_analysis_priority(
        self, 
        template_id: str, 
        last_analyzed: Optional[datetime],
        base_priority: AnalysisPriority,
        db: AsyncSession
    ) -> AnalysisPriority:
        """Calculate intelligent analysis priority."""
        
        priority_score = 0
        
        # Base priority
        priority_values = {
            AnalysisPriority.LOW: 1,
            AnalysisPriority.NORMAL: 2,
            AnalysisPriority.HIGH: 3,
            AnalysisPriority.CRITICAL: 4
        }
        priority_score += priority_values[base_priority]
        
        # Staleness factor
        if last_analyzed:
            days_since = (datetime.utcnow() - last_analyzed).days
            if days_since > 7:
                priority_score += 1
            if days_since > 30:
                priority_score += 1
        else:
            priority_score += 2  # Never analyzed
        
        # Usage popularity factor
        template_result = await db.execute(
            select(Template.usage_count)
            .where(Template.id == template_id)
        )
        usage_count = template_result.scalar() or 0
        
        if usage_count > 1000:
            priority_score += 1
        elif usage_count > 100:
            priority_score += 0.5
        
        # Recent performance issues
        recent_analytics = await db.execute(
            select(TemplateAnalytics.conversion_rate, TemplateAnalytics.bounce_rate)
            .where(
                and_(
                    TemplateAnalytics.template_id == template_id,
                    TemplateAnalytics.date >= datetime.utcnow() - timedelta(days=7)
                )
            )
            .order_by(desc(TemplateAnalytics.date))
            .limit(1)
        )
        recent_data = recent_analytics.first()
        
        if recent_data:
            conversion_rate, bounce_rate = recent_data
            if conversion_rate < 0.05 or bounce_rate > 0.7:  # Poor performance
                priority_score += 1
        
        # Map score back to priority enum
        if priority_score >= 6:
            return AnalysisPriority.CRITICAL
        elif priority_score >= 4:
            return AnalysisPriority.HIGH
        elif priority_score >= 2:
            return AnalysisPriority.NORMAL
        else:
            return AnalysisPriority.LOW
    
    async def _schedule_celery_task(
        self, 
        job: AnalysisJob, 
        delay_seconds: int = 0
    ) -> str:
        """Schedule Celery task for template analysis."""
        
        task_kwargs = {
            "template_id": job.template_id,
            "priority": job.priority.value,
            "retry_count": job.retry_count,
            "force_refresh": True
        }
        
        if delay_seconds > 0:
            # Schedule with delay
            task_result = analyze_template_performance.apply_async(
                kwargs=task_kwargs,
                countdown=delay_seconds
            )
        else:
            # Schedule immediately
            task_result = analyze_template_performance.apply_async(
                kwargs=task_kwargs
            )
        
        # Store task info in Redis
        task_info = {
            "template_id": job.template_id,
            "priority": job.priority.value,
            "scheduled_at": job.scheduled_at.isoformat(),
            "status": AnalysisStatus.PENDING.value
        }
        
        await redis_client.setex(
            f"analysis_task:{task_result.id}",
            3600 * 48,  # 48 hour expiry
            task_info
        )
        
        return task_result.id
    
    async def get_analysis_status(self, task_id: str) -> Dict[str, any]:
        """Get status of analysis task."""
        
        task_info = await redis_client.get(f"analysis_task:{task_id}")
        if not task_info:
            return {"error": "Task not found"}
        
        # Get Celery task status
        task_result = celery_app.AsyncResult(task_id)
        
        return {
            "task_id": task_id,
            "status": task_result.status,
            "result": task_result.result if task_result.ready() else None,
            "scheduled_info": task_info
        }
    
    async def cancel_analysis(self, task_id: str) -> bool:
        """Cancel a scheduled analysis task."""
        
        try:
            # Revoke Celery task
            celery_app.control.revoke(task_id, terminate=True)
            
            # Update status in Redis
            await redis_client.setex(
                f"analysis_task:{task_id}:status",
                3600,
                AnalysisStatus.CANCELLED.value
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to cancel task {task_id}: {str(e)}")
            return False
    
    async def cleanup_completed_tasks(self, days_old: int = 7) -> int:
        """Clean up old completed tasks from Redis."""
        
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        cleaned_count = 0
        
        # This would implement Redis cleanup logic
        # For now, it's a placeholder
        
        return cleaned_count


# Celery tasks
@celery_app.task(bind=True, name="analyze_template_performance")
def analyze_template_performance(
    self, 
    template_id: str, 
    priority: str = "normal",
    retry_count: int = 0,
    force_refresh: bool = False
):
    """Celery task for template performance analysis."""
    
    task_id = self.request.id
    logger.info(f"Starting analysis for template {template_id} (task: {task_id})")
    
    try:
        # Update task status
        redis_client.setex(
            f"analysis_task:{task_id}:status",
            3600,
            AnalysisStatus.RUNNING.value
        )
        
        # Run analysis (this would be implemented with proper async handling)
        # For now, it's a placeholder that simulates analysis
        
        import time
        import random
        
        # Simulate analysis work
        analysis_time = random.uniform(5, 30)  # 5-30 seconds
        time.sleep(analysis_time)
        
        # Simulate success/failure
        if random.random() < 0.9:  # 90% success rate
            result = {
                "success": True,
                "template_id": template_id,
                "analysis_completed_at": datetime.utcnow().isoformat(),
                "priority": priority,
                "task_id": task_id
            }
            
            # Update status
            redis_client.setex(
                f"analysis_task:{task_id}:status",
                3600,
                AnalysisStatus.COMPLETED.value
            )
            
            logger.info(f"Completed analysis for template {template_id}")
            return result
            
        else:
            raise Exception("Simulated analysis failure")
    
    except Exception as e:
        logger.error(f"Analysis failed for template {template_id}: {str(e)}")
        
        # Update status
        redis_client.setex(
            f"analysis_task:{task_id}:status",
            3600,
            AnalysisStatus.FAILED.value
        )
        
        # Retry logic
        if retry_count < 3:
            logger.info(f"Retrying analysis for template {template_id} (attempt {retry_count + 1})")
            raise self.retry(countdown=60 * (retry_count + 1), max_retries=3)
        
        return {
            "success": False,
            "template_id": template_id,
            "error": str(e),
            "task_id": task_id
        }


@celery_app.task(name="scheduled_template_analysis")
def scheduled_template_analysis():
    """Periodic task for automated template analysis."""
    
    logger.info("Starting scheduled template analysis")
    
    # This would implement periodic analysis logic
    # For now, it's a placeholder
    
    logger.info("Completed scheduled template analysis")


# Celery beat schedule for automated analysis
CELERY_BEAT_SCHEDULE = {
    'template-analysis-hourly': {
        'task': 'scheduled_template_analysis',
        'schedule': 3600.0,  # Run every hour
    },
}


class PerformanceMonitor:
    """Monitor system performance during analysis operations."""
    
    def __init__(self):
        self.metrics = {
            "active_analyses": 0,
            "completed_today": 0,
            "failed_today": 0,
            "avg_analysis_time": 0.0
        }
    
    async def get_system_metrics(self) -> Dict[str, any]:
        """Get current system performance metrics."""
        
        # Get metrics from Redis
        active_analyses = await redis_client.get("metrics:active_analyses") or 0
        completed_today = await redis_client.get("metrics:completed_today") or 0
        failed_today = await redis_client.get("metrics:failed_today") or 0
        
        return {
            "active_analyses": int(active_analyses),
            "completed_today": int(completed_today),
            "failed_today": int(failed_today),
            "success_rate": self._calculate_success_rate(completed_today, failed_today),
            "system_load": await self._get_system_load()
        }
    
    def _calculate_success_rate(self, completed: int, failed: int) -> float:
        """Calculate analysis success rate."""
        total = completed + failed
        return (completed / total * 100) if total > 0 else 100.0
    
    async def _get_system_load(self) -> str:
        """Assess current system load."""
        active_analyses = await redis_client.get("metrics:active_analyses") or 0
        
        if int(active_analyses) > 10:
            return "high"
        elif int(active_analyses) > 5:
            return "medium"
        else:
            return "low"