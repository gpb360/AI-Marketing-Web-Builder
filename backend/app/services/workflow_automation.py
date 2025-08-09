"""
Epic 2: Workflow Automation Engine
Advanced automation system with triggers, conditions, and actions
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from dataclasses import dataclass, asdict
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.core.database import get_session
from app.models.workflow import Workflow, WorkflowExecution, WorkflowTrigger, WorkflowExecutionStatus, NodeType
from app.services.ai_service import AIService
from app.services.github_integration import GitHubService

# Import debugging service for real-time monitoring
try:
    from app.services.workflow_debug_service import WorkflowDebugService
    DEBUGGING_ENABLED = True
except ImportError:
    DEBUGGING_ENABLED = False

logger = logging.getLogger(__name__)

class TriggerType(Enum):
    """Available trigger types for workflow automation"""
    SCHEDULE = "schedule"
    WEBHOOK = "webhook"
    EVENT = "event"
    CONDITION = "condition"
    PR_CREATED = "pr_created"
    PR_MERGED = "pr_merged"
    COMMIT_PUSHED = "commit_pushed"
    SLA_VIOLATION = "sla_violation"
    AGENT_IDLE = "agent_idle"
    BUILD_FAILED = "build_failed"
    TEST_FAILED = "test_failed"

class ActionType(Enum):
    """Available action types for workflow automation"""
    SEND_NOTIFICATION = "send_notification"
    CREATE_ISSUE = "create_issue"
    ASSIGN_REVIEWER = "assign_reviewer"
    MERGE_PR = "merge_pr"
    DEPLOY = "deploy"
    RUN_TESTS = "run_tests"
    ESCALATE_SLA = "escalate_sla"
    NOTIFY_AGENT = "notify_agent"
    CREATE_BRANCH = "create_branch"
    UPDATE_STATUS = "update_status"

@dataclass
class WorkflowCondition:
    """Represents a condition in workflow automation"""
    field: str
    operator: str  # eq, ne, gt, lt, gte, lte, in, not_in, contains
    value: Union[str, int, float, bool, List[Any]]
    
    def evaluate(self, context: Dict[str, Any]) -> bool:
        """Evaluate the condition against the provided context"""
        field_value = context.get(self.field)
        
        if self.operator == "eq":
            return field_value == self.value
        elif self.operator == "ne":
            return field_value != self.value
        elif self.operator == "gt":
            return field_value > self.value
        elif self.operator == "lt":
            return field_value < self.value
        elif self.operator == "gte":
            return field_value >= self.value
        elif self.operator == "lte":
            return field_value <= self.value
        elif self.operator == "in":
            return field_value in self.value
        elif self.operator == "not_in":
            return field_value not in self.value
        elif self.operator == "contains":
            return self.value in str(field_value)
        else:
            raise ValueError(f"Unknown operator: {self.operator}")

@dataclass
class WorkflowAction:
    """Represents an action in workflow automation"""
    type: ActionType
    parameters: Dict[str, Any]
    delay_seconds: int = 0
    retry_count: int = 3
    
class WorkflowEngine:
    """
    Epic 2: Advanced Workflow Automation Engine
    Handles triggers, conditions, and automated actions
    """
    
    def __init__(self, ai_service: Optional[AIService] = None, github_service: Optional[GitHubService] = None):
        self.ai_service = ai_service or AIService()
        self.github_service = github_service or GitHubService()
        self.active_workflows: Dict[int, Workflow] = {}
        self.execution_queue = asyncio.Queue()
        self.debug_service = None  # Will be initialized when needed
        
    async def start_engine(self):
        """Start the workflow automation engine"""
        logger.info("🚀 Starting Epic 2 Workflow Automation Engine...")
        
        # Load active workflows
        await self.load_active_workflows()
        
        # Start background tasks
        asyncio.create_task(self.process_execution_queue())
        asyncio.create_task(self.monitor_scheduled_workflows())
        asyncio.create_task(self.monitor_sla_violations())
        
        logger.info(f"✅ Workflow Engine started with {len(self.active_workflows)} active workflows")
        
    async def load_active_workflows(self):
        """Load all active workflows from database"""
        with get_session() as session:
            workflows = session.query(Workflow).filter(Workflow.is_active == True).all()
            
            for workflow in workflows:
                self.active_workflows[workflow.id] = workflow
                logger.info(f"📋 Loaded workflow: {workflow.name} ({workflow.trigger_type})")
                
    async def register_trigger(self, trigger_type: TriggerType, payload: Dict[str, Any]):
        """Register a trigger event that may activate workflows"""
        logger.info(f"🔔 Trigger received: {trigger_type.value}")
        
        # Find workflows that match this trigger
        matching_workflows = []
        for workflow in self.active_workflows.values():
            if workflow.trigger_type == trigger_type.value:
                matching_workflows.append(workflow)
                
        # Process each matching workflow
        for workflow in matching_workflows:
            await self.evaluate_workflow(workflow, payload)
            
    async def evaluate_workflow(self, workflow: Workflow, context: Dict[str, Any]):
        """Evaluate workflow conditions and execute if they match"""
        try:
            # Parse workflow configuration
            config = json.loads(workflow.configuration) if workflow.configuration else {}
            conditions = config.get('conditions', [])
            
            # Check if all conditions are met
            conditions_met = True
            for condition_data in conditions:
                condition = WorkflowCondition(**condition_data)
                if not condition.evaluate(context):
                    conditions_met = False
                    break
                    
            if conditions_met:
                logger.info(f"✅ Workflow conditions met for: {workflow.name}")
                await self.execute_workflow(workflow, context)
            else:
                logger.debug(f"❌ Workflow conditions not met for: {workflow.name}")
                
        except Exception as e:
            logger.error(f"❌ Error evaluating workflow {workflow.name}: {e}")
            
    async def execute_workflow(self, workflow: Workflow, context: Dict[str, Any]):
        """Execute a workflow with the given context"""
        execution_id = f"exec_{workflow.id}_{int(datetime.now().timestamp())}"
        
        logger.info(f"🔄 Executing workflow: {workflow.name} (ID: {execution_id})")
        
        try:
            # Initialize debug service if needed
            if DEBUGGING_ENABLED and not self.debug_service:
                # Note: This requires a database session, so it's created per execution
                pass
            
            # Create execution record
            with get_session() as session:
                execution = WorkflowExecution(
                    workflow_id=workflow.id,
                    execution_id=execution_id,
                    status=WorkflowExecutionStatus.RUNNING,
                    trigger_data=context,
                    started_at=datetime.utcnow()
                )
                session.add(execution)
                session.commit()
                session.refresh(execution)
                
                # Notify debugging service of execution start
                if DEBUGGING_ENABLED:
                    try:
                        from app.api.v1.endpoints.workflow_websocket import connection_manager
                        await connection_manager.send_execution_started(workflow.id, execution.id, context)
                    except Exception as e:
                        logger.warning(f"Failed to send debug notification: {e}")
                
            # Parse actions from configuration
            config = json.loads(workflow.configuration) if workflow.configuration else {}
            actions = config.get('actions', [])
            
            # Execute each action with debugging support
            success_count = 0
            total_actions = len(actions)
            
            for i, action_data in enumerate(actions):
                action = WorkflowAction(**action_data)
                node_id = f"action_{i}"  # Generate node ID for debugging
                
                # Notify debugging service of node start
                if DEBUGGING_ENABLED:
                    try:
                        from app.api.v1.endpoints.workflow_websocket import connection_manager
                        await connection_manager.send_execution_update(
                            workflow.id, execution.id, node_id, 'running'
                        )
                    except Exception as e:
                        logger.warning(f"Failed to send debug notification: {e}")
                
                # Apply delay if specified
                if action.delay_seconds > 0:
                    await asyncio.sleep(action.delay_seconds)
                    
                # Execute action with retry logic
                action_start_time = datetime.utcnow()
                success = await self.execute_action(action, context, execution_id)
                action_end_time = datetime.utcnow()
                
                # Calculate execution time
                execution_time_ms = int((action_end_time - action_start_time).total_seconds() * 1000)
                
                if success:
                    success_count += 1
                    
                # Notify debugging service of node completion
                if DEBUGGING_ENABLED:
                    try:
                        from app.api.v1.endpoints.workflow_websocket import connection_manager
                        await connection_manager.send_execution_update(
                            workflow.id, execution.id, node_id, 
                            'success' if success else 'failed',
                            execution_time_ms,
                            None if success else f"Action {action.type.value} failed"
                        )
                    except Exception as e:
                        logger.warning(f"Failed to send debug notification: {e}")
                    
            # Update execution status
            with get_session() as session:
                execution = session.query(WorkflowExecution).filter(
                    WorkflowExecution.execution_id == execution_id
                ).first()
                
                if execution:
                    final_status = WorkflowExecutionStatus.SUCCESS if success_count == total_actions else WorkflowExecutionStatus.FAILED
                    execution.status = final_status
                    execution.finished_at = datetime.utcnow()
                    
                    # Calculate total execution time
                    if execution.started_at and execution.finished_at:
                        total_time = execution.finished_at - execution.started_at
                        execution.execution_time = int(total_time.total_seconds() * 1000)
                    
                    execution.execution_data = {
                        "success_count": success_count,
                        "total_actions": total_actions,
                        "success_rate": success_count / total_actions if total_actions > 0 else 0
                    }
                    session.commit()
                    
                    # Notify debugging service of execution completion
                    if DEBUGGING_ENABLED:
                        try:
                            from app.api.v1.endpoints.workflow_websocket import connection_manager
                            await connection_manager.send_execution_completed(
                                workflow.id, execution.id, final_status.value,
                                execution.execution_time or 0, success_count, total_actions
                            )
                        except Exception as e:
                            logger.warning(f"Failed to send debug notification: {e}")
                    
            logger.info(f"✅ Workflow execution completed: {success_count}/{total_actions} actions successful")
            
        except Exception as e:
            logger.error(f"❌ Workflow execution failed: {e}")
            
            # Update execution status to failed
            with get_session() as session:
                execution = session.query(WorkflowExecution).filter(
                    WorkflowExecution.execution_id == execution_id
                ).first()
                
                if execution:
                    execution.status = WorkflowExecutionStatus.FAILED
                    execution.finished_at = datetime.utcnow()
                    execution.error_message = str(e)
                    
                    # Calculate total execution time
                    if execution.started_at and execution.finished_at:
                        total_time = execution.finished_at - execution.started_at
                        execution.execution_time = int(total_time.total_seconds() * 1000)
                    
                    session.commit()
                    
                    # Notify debugging service of execution failure
                    if DEBUGGING_ENABLED:
                        try:
                            from app.api.v1.endpoints.workflow_websocket import connection_manager
                            await connection_manager.send_execution_completed(
                                workflow.id, execution.id, WorkflowExecutionStatus.FAILED.value,
                                execution.execution_time or 0, 0, total_actions
                            )
                        except Exception as e:
                            logger.warning(f"Failed to send debug notification: {e}")
                    
    async def execute_action(self, action: WorkflowAction, context: Dict[str, Any], execution_id: str) -> bool:
        """Execute a specific action with retry logic"""
        for attempt in range(action.retry_count):
            try:
                if action.type == ActionType.SEND_NOTIFICATION:
                    await self.action_send_notification(action.parameters, context)
                elif action.type == ActionType.CREATE_ISSUE:
                    await self.action_create_issue(action.parameters, context)
                elif action.type == ActionType.ASSIGN_REVIEWER:
                    await self.action_assign_reviewer(action.parameters, context)
                elif action.type == ActionType.MERGE_PR:
                    await self.action_merge_pr(action.parameters, context)
                elif action.type == ActionType.ESCALATE_SLA:
                    await self.action_escalate_sla(action.parameters, context)
                elif action.type == ActionType.NOTIFY_AGENT:
                    await self.action_notify_agent(action.parameters, context)
                elif action.type == ActionType.UPDATE_STATUS:
                    await self.action_update_status(action.parameters, context)
                else:
                    logger.warning(f"⚠️ Unknown action type: {action.type}")
                    return False
                    
                logger.info(f"✅ Action executed successfully: {action.type.value}")
                return True
                
            except Exception as e:
                logger.warning(f"⚠️ Action execution attempt {attempt + 1} failed: {e}")
                if attempt < action.retry_count - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    
        logger.error(f"❌ Action execution failed after {action.retry_count} attempts: {action.type.value}")
        return False
        
    # Action implementations
    async def action_send_notification(self, params: Dict[str, Any], context: Dict[str, Any]):
        """Send a notification (Slack, email, etc.)"""
        message = params.get('message', '').format(**context)
        recipient = params.get('recipient')
        channel = params.get('channel', 'email')
        
        logger.info(f"📬 Sending {channel} notification to {recipient}: {message}")
        # TODO: Implement actual notification sending
        
    async def action_create_issue(self, params: Dict[str, Any], context: Dict[str, Any]):
        """Create a GitHub issue"""
        title = params.get('title', '').format(**context)
        body = params.get('body', '').format(**context)
        labels = params.get('labels', [])
        
        logger.info(f"📝 Creating GitHub issue: {title}")
        await self.github_service.create_issue(title, body, labels)
        
    async def action_assign_reviewer(self, params: Dict[str, Any], context: Dict[str, Any]):
        """Assign a reviewer to a PR"""
        pr_number = context.get('pr_number')
        reviewer = params.get('reviewer')
        
        if pr_number and reviewer:
            logger.info(f"👥 Assigning reviewer {reviewer} to PR #{pr_number}")
            await self.github_service.assign_reviewer(pr_number, reviewer)
            
    async def action_merge_pr(self, params: Dict[str, Any], context: Dict[str, Any]):
        """Automatically merge a PR"""
        pr_number = context.get('pr_number')
        merge_method = params.get('merge_method', 'merge')
        
        if pr_number:
            logger.info(f"🔄 Auto-merging PR #{pr_number}")
            await self.github_service.merge_pr(pr_number, merge_method)
            
    async def action_escalate_sla(self, params: Dict[str, Any], context: Dict[str, Any]):
        """Escalate an SLA violation"""
        violation_type = context.get('violation_type')
        escalation_level = params.get('level', 1)
        
        logger.warning(f"🚨 Escalating SLA violation: {violation_type} (Level {escalation_level})")
        # TODO: Implement escalation logic
        
    async def action_notify_agent(self, params: Dict[str, Any], context: Dict[str, Any]):
        """Notify a specific agent"""
        agent_name = params.get('agent')
        message = params.get('message', '').format(**context)
        
        logger.info(f"🤖 Notifying agent {agent_name}: {message}")
        # TODO: Implement agent notification
        
    async def action_update_status(self, params: Dict[str, Any], context: Dict[str, Any]):
        """Update status of a PR or issue"""
        target_type = params.get('target_type')  # pr, issue
        target_id = context.get(f'{target_type}_number')
        status = params.get('status')
        
        logger.info(f"📊 Updating {target_type} #{target_id} status to: {status}")
        # TODO: Implement status update logic
        
    async def process_execution_queue(self):
        """Process the workflow execution queue"""
        while True:
            try:
                # Process queued executions
                await asyncio.sleep(1)  # Check every second
                # TODO: Implement queue processing
            except Exception as e:
                logger.error(f"❌ Error processing execution queue: {e}")
                
    async def monitor_scheduled_workflows(self):
        """Monitor and trigger scheduled workflows"""
        while True:
            try:
                now = datetime.utcnow()
                
                # Check for scheduled workflows
                with get_session() as session:
                    scheduled_workflows = session.query(Workflow).filter(
                        and_(
                            Workflow.is_active == True,
                            Workflow.trigger_type == TriggerType.SCHEDULE.value,
                            or_(
                                Workflow.last_executed.is_(None),
                                Workflow.last_executed < now - timedelta(hours=1)  # Run at most once per hour
                            )
                        )
                    ).all()
                    
                    for workflow in scheduled_workflows:
                        config = json.loads(workflow.configuration) if workflow.configuration else {}
                        schedule = config.get('schedule', {})
                        
                        if self.should_execute_scheduled_workflow(workflow, schedule, now):
                            await self.execute_workflow(workflow, {'timestamp': now.isoformat()})
                            
                            # Update last executed time
                            workflow.last_executed = now
                            session.commit()
                            
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"❌ Error monitoring scheduled workflows: {e}")
                await asyncio.sleep(60)
                
    def should_execute_scheduled_workflow(self, workflow: Workflow, schedule: Dict[str, Any], now: datetime) -> bool:
        """Determine if a scheduled workflow should be executed"""
        # TODO: Implement more sophisticated scheduling logic
        # For now, simple interval-based scheduling
        interval_minutes = schedule.get('interval_minutes', 60)
        
        if workflow.last_executed:
            time_diff = now - workflow.last_executed
            return time_diff.total_seconds() >= (interval_minutes * 60)
        else:
            return True
            
    async def monitor_sla_violations(self):
        """Monitor for SLA violations and trigger appropriate workflows"""
        while True:
            try:
                # Check for various SLA violations
                await self.check_pr_review_sla()
                await self.check_build_time_sla()
                await self.check_agent_response_sla()
                
                await asyncio.sleep(300)  # Check every 5 minutes
                
            except Exception as e:
                logger.error(f"❌ Error monitoring SLA violations: {e}")
                await asyncio.sleep(300)
                
    async def check_pr_review_sla(self):
        """Check for PR review SLA violations"""
        # TODO: Implement PR review SLA checking
        pass
        
    async def check_build_time_sla(self):
        """Check for build time SLA violations"""
        # TODO: Implement build time SLA checking
        pass
        
    async def check_agent_response_sla(self):
        """Check for agent response SLA violations"""
        # TODO: Implement agent response SLA checking
        pass

# Global workflow engine instance
workflow_engine = WorkflowEngine()

async def initialize_workflow_engine():
    """Initialize the workflow automation engine"""
    await workflow_engine.start_engine()

# Convenience functions for external use
async def trigger_workflow(trigger_type: TriggerType, payload: Dict[str, Any]):
    """Trigger workflows based on an event"""
    await workflow_engine.register_trigger(trigger_type, payload)