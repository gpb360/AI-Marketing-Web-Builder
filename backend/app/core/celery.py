"""
Celery configuration for AI Web Builder Platform.
"""

from celery import Celery
from app.core.config import settings

# Create celery app instance
celery_app = Celery(
    "ai_web_builder",
    broker=getattr(settings, 'CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    backend=getattr(settings, 'CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'),
    include=['app.tasks']
)

# Configure celery
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    result_expires=3600,  # 1 hour
)

# Task routing configuration
celery_app.conf.task_routes = {
    'app.tasks.template.*': {'queue': 'template'},
    'app.tasks.workflow.*': {'queue': 'workflow'},
    'app.tasks.ai.*': {'queue': 'ai'},
    'app.tasks.email.*': {'queue': 'email'},
}

# Auto-discover tasks
celery_app.autodiscover_tasks(['app.tasks'])