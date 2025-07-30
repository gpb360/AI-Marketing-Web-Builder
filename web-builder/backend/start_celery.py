#!/usr/bin/env python3
"""Celery worker startup script for AI Web Builder Platform."""

import os
import sys
from celery import Celery

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.services.tasks import celery_app

if __name__ == '__main__':
    # Start Celery worker
    celery_app.start([
        'worker',
        '--loglevel=info',
        '--concurrency=4',
        '--queues=publishing,monitoring,domains,optimization,analytics',
        '--pool=prefork'
    ])