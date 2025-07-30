"""Celery configuration for AI Web Builder Platform."""

from src.core.config import settings

# Celery Configuration
broker_url = settings.celery_broker_url
result_backend = settings.celery_result_backend

# Task Settings
task_serializer = 'json'
accept_content = ['json']
result_serializer = 'json'
timezone = 'UTC'
enable_utc = True

# Task Execution
task_track_started = True
task_time_limit = settings.build_timeout
task_soft_time_limit = settings.build_timeout - 60
task_acks_late = True
task_reject_on_worker_lost = True

# Worker Settings
worker_prefetch_multiplier = 1
worker_max_tasks_per_child = 1000
worker_disable_rate_limits = True

# Queue Configuration
task_routes = {
    'src.services.tasks.publish_site_task': {'queue': 'publishing'},
    'src.services.tasks.check_ssl_status_task': {'queue': 'monitoring'},
    'src.services.tasks.verify_domain_task': {'queue': 'domains'},
    'src.services.tasks.optimize_site_performance': {'queue': 'optimization'},
    'src.services.tasks.generate_analytics_report': {'queue': 'analytics'},
}

# Periodic Tasks
beat_schedule = {
    'check-ssl-certificates': {
        'task': 'src.services.tasks.check_expiring_ssl_certificates',
        'schedule': 21600.0,  # 6 hours in seconds
    },
    'validate-deployments': {
        'task': 'src.services.tasks.validate_all_deployments',
        'schedule': 86400.0,  # 24 hours in seconds
    },
    'cleanup-failed-builds': {
        'task': 'src.services.tasks.cleanup_failed_builds',
        'schedule': 43200.0,  # 12 hours in seconds
    },
}

# Redis Configuration
broker_connection_retry_on_startup = True
broker_connection_retry = True
broker_connection_max_retries = 10

# Result Backend Configuration
result_expires = 3600  # 1 hour
result_compression = 'gzip'

# Monitoring
worker_send_task_events = True
task_send_sent_event = True