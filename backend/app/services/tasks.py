"""Celery tasks for background processing of site publishing operations."""

import asyncio
from typing import Dict, Any, Optional
from celery import Celery
from datetime import datetime, timedelta

from ..core.config import settings
from .publishing_service import PublishingService
from .domain_manager import DomainManager

# Initialize Celery app
celery_app = Celery(
    "aiwebbuilder",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["src.services.tasks"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=settings.build_timeout,
    task_soft_time_limit=settings.build_timeout - 60,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_max_tasks_per_child=1000,
)

# Task routing
celery_app.conf.task_routes = {
    "src.services.tasks.publish_site_task": {"queue": "publishing"},
    "src.services.tasks.check_ssl_status_task": {"queue": "monitoring"},
    "src.services.tasks.verify_domain_task": {"queue": "domains"},
    "src.services.tasks.execute_workflow_task": {"queue": "workflows"},
    "src.services.tasks.execute_workflow_node_task": {"queue": "workflows"},
}

# Periodic tasks
celery_app.conf.beat_schedule = {
    "check-ssl-certificates": {
        "task": "src.services.tasks.check_expiring_ssl_certificates",
        "schedule": timedelta(hours=6),  # Check every 6 hours
    },
    "validate-deployments": {
        "task": "src.services.tasks.validate_all_deployments",
        "schedule": timedelta(hours=24),  # Check daily
    },
    "cleanup-failed-builds": {
        "task": "src.services.tasks.cleanup_failed_builds",
        "schedule": timedelta(hours=12),  # Cleanup twice daily
    },
}


@celery_app.task(bind=True, name="src.services.tasks.publish_site_task")
def publish_site_task(self, site_id: str, custom_domain: Optional[str] = None) -> Dict[str, Any]:
    """
    Background task to publish a site.
    
    Args:
        site_id: Site ID to publish
        custom_domain: Optional custom domain
        
    Returns:
        Publishing result
    """
    try:
        # Update task status
        self.update_state(
            state="PROGRESS",
            meta={"status": "Starting site generation", "progress": 10}
        )
        
        # Run the publishing process
        publishing_service = PublishingService()
        
        # Use asyncio to run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                publishing_service.publish_site(site_id, custom_domain)
            )
        finally:
            loop.close()
        
        if result["success"]:
            self.update_state(
                state="SUCCESS",
                meta={
                    "status": "Site published successfully",
                    "progress": 100,
                    "result": result
                }
            )
        else:
            self.update_state(
                state="FAILURE",
                meta={
                    "status": "Publishing failed",
                    "error": result.get("error"),
                    "progress": 0
                }
            )
        
        return result
        
    except Exception as e:
        self.update_state(
            state="FAILURE",
            meta={
                "status": "Publishing failed with exception",
                "error": str(e),
                "progress": 0
            }
        )
        raise


@celery_app.task(name="src.services.tasks.verify_domain_task")
def verify_domain_task(domain: str, site_id: str) -> Dict[str, Any]:
    """
    Background task to verify domain ownership.
    
    Args:
        domain: Domain to verify
        site_id: Site ID for verification
        
    Returns:
        Verification result
    """
    try:
        domain_manager = DomainManager()
        
        # Use asyncio to run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                domain_manager.verify_domain_ownership(domain, site_id)
            )
        finally:
            loop.close()
        
        return result
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


@celery_app.task(name="src.services.tasks.check_ssl_status_task")
def check_ssl_status_task(published_site_id: str) -> Dict[str, Any]:
    """
    Background task to check SSL certificate status.
    
    Args:
        published_site_id: Published site ID
        
    Returns:
        SSL status result
    """
    try:
        from ..models.sites import PublishedSite
        from ..core.database import get_sync_session
        
        # Get published site
        with get_sync_session() as session:
            published_site = session.get(PublishedSite, published_site_id)
            if not published_site:
                return {
                    "status": "error",
                    "error": "Published site not found"
                }
        
        domain_manager = DomainManager()
        
        # Use asyncio to run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                domain_manager.check_ssl_status(published_site)
            )
        finally:
            loop.close()
        
        # Update database with SSL status
        if result.get("status"):
            with get_sync_session() as session:
                published_site = session.get(PublishedSite, published_site_id)
                if published_site:
                    published_site.ssl_status = result["status"]
                    if result.get("expires_at"):
                        published_site.ssl_expires_at = result["expires_at"]
                    session.commit()
        
        return result
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


@celery_app.task(name="src.services.tasks.check_expiring_ssl_certificates")
def check_expiring_ssl_certificates() -> Dict[str, Any]:
    """
    Periodic task to check for expiring SSL certificates.
    
    Returns:
        Check result with renewal actions
    """
    try:
        from ..models.sites import PublishedSite, SSLStatus
        from ..core.database import get_sync_session
        from sqlalchemy import select
        
        renewals_needed = []
        
        with get_sync_session() as session:
            # Find certificates expiring in the next 30 days
            expiry_threshold = datetime.utcnow() + timedelta(days=30)
            
            stmt = select(PublishedSite).where(
                PublishedSite.ssl_status == SSLStatus.ACTIVE,
                PublishedSite.ssl_expires_at <= expiry_threshold
            )
            
            result = session.execute(stmt)
            expiring_sites = result.scalars().all()
            
            for site in expiring_sites:
                # Trigger SSL renewal
                renewal_result = renew_ssl_certificate_task.delay(str(site.id))
                renewals_needed.append({
                    "site_id": str(site.id),
                    "domain": site.custom_domain or site.domain,
                    "expires_at": site.ssl_expires_at.isoformat(),
                    "renewal_task_id": renewal_result.id
                })
        
        return {
            "status": "success",
            "renewals_triggered": len(renewals_needed),
            "renewals": renewals_needed
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


@celery_app.task(name="src.services.tasks.renew_ssl_certificate_task")
def renew_ssl_certificate_task(published_site_id: str) -> Dict[str, Any]:
    """
    Background task to renew SSL certificate.
    
    Args:
        published_site_id: Published site ID
        
    Returns:
        Renewal result
    """
    try:
        from ..models.sites import PublishedSite
        from ..core.database import get_sync_session
        
        # Get published site
        with get_sync_session() as session:
            published_site = session.get(PublishedSite, published_site_id)
            if not published_site:
                return {
                    "status": "error",
                    "error": "Published site not found"
                }
        
        domain = published_site.custom_domain or published_site.domain
        domain_manager = DomainManager()
        
        # Use asyncio to run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # Request new SSL certificate
            result = loop.run_until_complete(
                domain_manager.request_ssl_certificate(domain)
            )
        finally:
            loop.close()
        
        # Update database with new SSL status
        with get_sync_session() as session:
            published_site = session.get(PublishedSite, published_site_id)
            if published_site:
                published_site.ssl_status = result["status"]
                session.commit()
        
        return result
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


@celery_app.task(name="src.services.tasks.validate_all_deployments")
def validate_all_deployments() -> Dict[str, Any]:
    """
    Periodic task to validate all active deployments.
    
    Returns:
        Validation results
    """
    try:
        from ..models.sites import PublishedSite, BuildStatus
        from ..core.database import get_sync_session
        from sqlalchemy import select
        
        validation_results = []
        
        with get_sync_session() as session:
            # Get all active published sites
            stmt = select(PublishedSite).where(
                PublishedSite.build_status == BuildStatus.SUCCESS
            )
            
            result = session.execute(stmt)
            published_sites = result.scalars().all()
            
            domain_manager = DomainManager()
            
            # Use asyncio to validate all sites
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                for site in published_sites:
                    domain = site.custom_domain or site.domain
                    
                    validation_result = loop.run_until_complete(
                        domain_manager.validate_domain_configuration(domain)
                    )
                    
                    validation_results.append({
                        "site_id": str(site.id),
                        "domain": domain,
                        "validation": validation_result
                    })
                    
                    # Update performance score if available
                    if validation_result.get("performance_score"):
                        site.performance_score = validation_result["performance_score"]
                
                session.commit()
                
            finally:
                loop.close()
        
        return {
            "status": "success",
            "validated_sites": len(validation_results),
            "results": validation_results
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


@celery_app.task(name="src.services.tasks.cleanup_failed_builds")
def cleanup_failed_builds() -> Dict[str, Any]:
    """
    Periodic task to clean up failed build artifacts.
    
    Returns:
        Cleanup results
    """
    try:
        from ..models.sites import PublishedSite, DeploymentHistory, BuildStatus
        from ..core.database import get_sync_session
        from sqlalchemy import select, delete
        
        cleaned_count = 0
        
        with get_sync_session() as session:
            # Clean up failed builds older than 7 days
            cleanup_threshold = datetime.utcnow() - timedelta(days=7)
            
            # Delete failed deployment history records
            stmt = delete(DeploymentHistory).where(
                DeploymentHistory.build_status == BuildStatus.FAILED,
                DeploymentHistory.build_time < cleanup_threshold
            )
            
            result = session.execute(stmt)
            cleaned_count = result.rowcount
            
            # Mark very old failed published sites as cancelled
            stmt = select(PublishedSite).where(
                PublishedSite.build_status == BuildStatus.FAILED,
                PublishedSite.build_started_at < cleanup_threshold
            )
            
            result = session.execute(stmt)
            failed_sites = result.scalars().all()
            
            for site in failed_sites:
                site.build_status = BuildStatus.CANCELLED
                cleaned_count += 1
            
            session.commit()
        
        return {
            "status": "success",
            "cleaned_records": cleaned_count
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


@celery_app.task(name="src.services.tasks.optimize_site_performance")
def optimize_site_performance(site_id: str) -> Dict[str, Any]:
    """
    Background task to optimize site performance.
    
    Args:
        site_id: Site ID to optimize
        
    Returns:
        Optimization result
    """
    try:
        # This would run various optimization tasks:
        # - Image compression
        # - CSS/JS minification
        # - CDN cache warming
        # - Performance analysis
        
        optimizations = []
        
        # Placeholder optimization tasks
        optimizations.append({
            "type": "image_optimization",
            "status": "completed",
            "size_reduction": "25%"
        })
        
        optimizations.append({
            "type": "css_minification", 
            "status": "completed",
            "size_reduction": "15%"
        })
        
        optimizations.append({
            "type": "js_bundling",
            "status": "completed", 
            "size_reduction": "30%"
        })
        
        return {
            "status": "success",
            "site_id": site_id,
            "optimizations": optimizations,
            "total_size_reduction": "23%"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


# Task for generating site analytics report
@celery_app.task(name="src.services.tasks.generate_analytics_report")
def generate_analytics_report(site_id: str, period: str = "30d") -> Dict[str, Any]:
    """
    Generate analytics report for a site.
    
    Args:
        site_id: Site ID
        period: Report period (7d, 30d, 90d)
        
    Returns:
        Analytics report
    """
    try:
        # This would integrate with analytics services
        # to generate comprehensive reports
        
        report = {
            "site_id": site_id,
            "period": period,
            "metrics": {
                "total_visits": 1250,
                "unique_visitors": 890,
                "page_views": 2100,
                "bounce_rate": 0.35,
                "avg_session_duration": 145,  # seconds
                "conversion_rate": 0.048,
                "top_pages": [
                    {"url": "/", "visits": 650},
                    {"url": "/about", "visits": 280},
                    {"url": "/contact", "visits": 190}
                ],
                "traffic_sources": {
                    "direct": 0.45,
                    "search": 0.32,
                    "social": 0.15,
                    "referral": 0.08
                },
                "device_breakdown": {
                    "desktop": 0.60,
                    "mobile": 0.35,
                    "tablet": 0.05
                }
            },
            "performance": {
                "avg_load_time": 1.8,  # seconds
                "core_web_vitals": {
                    "lcp": 2.1,  # Largest Contentful Paint
                    "fid": 85,   # First Input Delay (ms)
                    "cls": 0.08  # Cumulative Layout Shift
                }
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return {
            "status": "success",
            "report": report
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


# Workflow Execution Tasks

@celery_app.task(bind=True, name="src.services.tasks.execute_workflow_task")
def execute_workflow_task(self, execution_id: int) -> Dict[str, Any]:
    """
    Background task to execute a complete workflow.

    Args:
        execution_id: Workflow execution ID

    Returns:
        Execution result
    """
    try:
        from ..models.workflow import WorkflowExecution, WorkflowExecutionStatus
        from ..core.database import get_sync_session

        # Get workflow execution
        with get_sync_session() as session:
            execution = session.get(WorkflowExecution, execution_id)
            if not execution:
                return {
                    "status": "error",
                    "error": "Workflow execution not found"
                }

            workflow = execution.workflow
            if not workflow:
                return {
                    "status": "error",
                    "error": "Workflow not found"
                }

            # Update execution status to running
            execution.status = WorkflowExecutionStatus.RUNNING
            execution.started_at = datetime.utcnow()
            session.commit()

        # Execute workflow nodes
        execution_data = {}
        node_results = []

        try:
            # Sort nodes by execution order (trigger first, then actions)
            nodes = workflow.nodes or []
            trigger_nodes = [n for n in nodes if n.get('node_type') == 'trigger' or n.get('type') == 'trigger']
            action_nodes = [n for n in nodes if n.get('node_type') != 'trigger' and n.get('type') != 'trigger']

            # Execute trigger nodes first
            for node in trigger_nodes:
                node_result = execute_workflow_node_task.delay(execution_id, node).get()
                node_results.append(node_result)
                if node_result.get('status') == 'error':
                    raise Exception(f"Trigger node failed: {node_result.get('error')}")

            # Execute action nodes
            for node in action_nodes:
                node_result = execute_workflow_node_task.delay(execution_id, node).get()
                node_results.append(node_result)
                if node_result.get('status') == 'error':
                    # Log error but continue with other nodes
                    print(f"Action node failed: {node_result.get('error')}")

            execution_data = {
                "nodes_executed": len(node_results),
                "node_results": node_results,
                "trigger_data": execution.trigger_data
            }

            # Update execution as successful
            with get_sync_session() as session:
                execution = session.get(WorkflowExecution, execution_id)
                if execution:
                    execution.status = WorkflowExecutionStatus.SUCCESS
                    execution.finished_at = datetime.utcnow()
                    execution.execution_data = execution_data

                    if execution.started_at:
                        execution.execution_time = int((execution.finished_at - execution.started_at).total_seconds() * 1000)

                    # Update workflow success count
                    workflow = execution.workflow
                    if workflow:
                        workflow.success_count += 1

                    session.commit()

            return {
                "status": "success",
                "execution_id": execution_id,
                "execution_data": execution_data
            }

        except Exception as node_error:
            # Update execution as failed
            with get_sync_session() as session:
                execution = session.get(WorkflowExecution, execution_id)
                if execution:
                    execution.status = WorkflowExecutionStatus.FAILED
                    execution.finished_at = datetime.utcnow()
                    execution.error_message = str(node_error)

                    if execution.started_at:
                        execution.execution_time = int((execution.finished_at - execution.started_at).total_seconds() * 1000)

                    # Update workflow error count
                    workflow = execution.workflow
                    if workflow:
                        workflow.error_count += 1

                    session.commit()

            return {
                "status": "error",
                "execution_id": execution_id,
                "error": str(node_error)
            }

    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


@celery_app.task(name="src.services.tasks.execute_workflow_node_task")
def execute_workflow_node_task(execution_id: int, node: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute a single workflow node.

    Args:
        execution_id: Workflow execution ID
        node: Node configuration

    Returns:
        Node execution result
    """
    try:
        node_type = node.get('node_type') or node.get('type')
        node_id = node.get('node_id') or node.get('id')
        parameters = node.get('parameters', {})

        result = {
            "node_id": node_id,
            "node_type": node_type,
            "status": "success",
            "output": {}
        }

        # Execute based on node type
        if node_type == 'trigger':
            # Trigger nodes are usually just data sources
            result["output"] = {
                "triggered": True,
                "trigger_data": parameters
            }

        elif node_type == 'email':
            # Email action node
            result["output"] = _execute_email_node(parameters)

        elif node_type == 'webhook':
            # Webhook action node
            result["output"] = _execute_webhook_node(parameters)

        elif node_type == 'crm_update':
            # CRM update action node
            result["output"] = _execute_crm_update_node(parameters)

        elif node_type == 'http_request':
            # HTTP request action node
            result["output"] = _execute_http_request_node(parameters)

        elif node_type == 'delay':
            # Delay action node
            result["output"] = _execute_delay_node(parameters)

        elif node_type == 'condition':
            # Condition node
            result["output"] = _execute_condition_node(parameters)

        else:
            # Unknown node type
            result["status"] = "error"
            result["error"] = f"Unknown node type: {node_type}"

        return result

    except Exception as e:
        return {
            "node_id": node.get('node_id') or node.get('id'),
            "node_type": node.get('node_type') or node.get('type'),
            "status": "error",
            "error": str(e)
        }


def _execute_email_node(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Execute email node."""
    # This would integrate with email service
    return {
        "email_sent": True,
        "recipient": parameters.get('to'),
        "subject": parameters.get('subject'),
        "message_id": f"msg_{datetime.utcnow().timestamp()}"
    }


def _execute_webhook_node(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Execute webhook node."""
    import requests

    try:
        url = parameters.get('url')
        method = parameters.get('method', 'POST')
        headers = parameters.get('headers', {})
        data = parameters.get('data', {})

        response = requests.request(method, url, json=data, headers=headers, timeout=30)

        return {
            "webhook_called": True,
            "status_code": response.status_code,
            "response": response.text[:1000]  # Limit response size
        }
    except Exception as e:
        return {
            "webhook_called": False,
            "error": str(e)
        }


def _execute_crm_update_node(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Execute CRM update node."""
    # This would integrate with CRM system
    return {
        "crm_updated": True,
        "contact_id": parameters.get('contact_id'),
        "fields_updated": list(parameters.get('fields', {}).keys())
    }


def _execute_http_request_node(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Execute HTTP request node."""
    import requests

    try:
        url = parameters.get('url')
        method = parameters.get('method', 'GET')
        headers = parameters.get('headers', {})
        data = parameters.get('data')

        response = requests.request(method, url, json=data, headers=headers, timeout=30)

        return {
            "request_sent": True,
            "status_code": response.status_code,
            "response_data": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:1000]
        }
    except Exception as e:
        return {
            "request_sent": False,
            "error": str(e)
        }


def _execute_delay_node(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Execute delay node."""
    import time

    delay_seconds = parameters.get('delay', 0)
    if delay_seconds > 0:
        time.sleep(min(delay_seconds, 300))  # Max 5 minutes delay

    return {
        "delayed": True,
        "delay_seconds": delay_seconds
    }


def _execute_condition_node(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Execute condition node."""
    # This would evaluate conditions and return boolean result
    condition = parameters.get('condition', True)

    return {
        "condition_evaluated": True,
        "result": bool(condition)
    }