"""
Workflow debugging service for Story 3.1: Visual Workflow Debugging UI.
Provides detailed execution tracking, real-time monitoring, and performance metrics.
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload

from app.models.workflow import (
    Workflow, WorkflowExecution, WorkflowExecutionStep, 
    WorkflowDebugSession, WorkflowPerformanceMetric,
    WorkflowExecutionStatus, NodeType
)
from app.models.user import User
from app.services.base_service import BaseService
from app.api.v1.endpoints.workflow_websocket import connection_manager

logger = logging.getLogger(__name__)


class WorkflowDebugService:
    """Service for workflow debugging and real-time monitoring."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.active_debug_sessions: Dict[int, WorkflowDebugSession] = {}

    async def start_debug_session(self, workflow_id: int, user_id: int, 
                                session_name: Optional[str] = None,
                                debug_config: Optional[Dict[str, Any]] = None) -> WorkflowDebugSession:
        """Start a new debugging session for a workflow."""
        
        config = debug_config or {}
        
        # End any existing active sessions for this workflow/user
        await self._end_existing_sessions(workflow_id, user_id)
        
        session = WorkflowDebugSession(
            workflow_id=workflow_id,
            user_id=user_id,
            session_name=session_name or f"Debug Session {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
            debug_level=config.get('debug_level', 'INFO'),
            capture_logs=config.get('capture_logs', True),
            capture_metrics=config.get('capture_metrics', True),
            capture_data_flow=config.get('capture_data_flow', False),
            started_at=datetime.utcnow()
        )
        
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        
        self.active_debug_sessions[workflow_id] = session
        
        logger.info(f"Started debug session {session.id} for workflow {workflow_id}")
        return session

    async def end_debug_session(self, workflow_id: int, user_id: int) -> bool:
        """End the active debugging session for a workflow."""
        
        result = await self.db.execute(
            select(WorkflowDebugSession).where(
                and_(
                    WorkflowDebugSession.workflow_id == workflow_id,
                    WorkflowDebugSession.user_id == user_id,
                    WorkflowDebugSession.is_active == True
                )
            )
        )
        session = result.scalar_one_or_none()
        
        if session:
            session.is_active = False
            session.ended_at = datetime.utcnow()
            await self.db.commit()
            
            if workflow_id in self.active_debug_sessions:
                del self.active_debug_sessions[workflow_id]
            
            logger.info(f"Ended debug session {session.id} for workflow {workflow_id}")
            return True
        
        return False

    async def track_execution_start(self, execution: WorkflowExecution, 
                                  trigger_data: Dict[str, Any]) -> None:
        """Track the start of a workflow execution for debugging."""
        
        # Notify connected WebSocket clients
        await connection_manager.send_execution_started(
            execution.workflow_id,
            execution.id,
            trigger_data
        )
        
        # Update debug session statistics
        session = self.active_debug_sessions.get(execution.workflow_id)
        if session:
            session.executions_monitored += 1
            await self.db.commit()

    async def track_node_execution_start(self, execution_id: int, workflow_id: int,
                                       node_id: str, node_name: str, 
                                       node_type: NodeType,
                                       input_data: Dict[str, Any]) -> WorkflowExecutionStep:
        """Track the start of a node execution."""
        
        step = WorkflowExecutionStep(
            execution_id=execution_id,
            node_id=node_id,
            node_name=node_name,
            node_type=node_type,
            status=WorkflowExecutionStatus.RUNNING,
            started_at=datetime.utcnow(),
            input_data=input_data
        )
        
        self.db.add(step)
        await self.db.commit()
        await self.db.refresh(step)
        
        # Notify WebSocket clients
        await connection_manager.send_execution_update(
            workflow_id,
            execution_id,
            node_id,
            'running'
        )
        
        logger.debug(f"Node {node_id} execution started for execution {execution_id}")
        return step

    async def track_node_execution_complete(self, step_id: int, workflow_id: int,
                                          status: WorkflowExecutionStatus,
                                          output_data: Dict[str, Any],
                                          error_message: Optional[str] = None,
                                          performance_metrics: Optional[Dict[str, float]] = None,
                                          next_nodes: Optional[List[str]] = None) -> WorkflowExecutionStep:
        """Track the completion of a node execution."""
        
        result = await self.db.execute(
            select(WorkflowExecutionStep).where(WorkflowExecutionStep.id == step_id)
        )
        step = result.scalar_one_or_none()
        
        if not step:
            raise ValueError(f"Execution step {step_id} not found")
        
        # Update step completion
        step.status = status
        step.finished_at = datetime.utcnow()
        step.output_data = output_data
        step.error_message = error_message
        
        if step.started_at and step.finished_at:
            delta = step.finished_at - step.started_at
            step.execution_time_ms = int(delta.total_seconds() * 1000)
        
        # Store performance metrics
        if performance_metrics:
            step.memory_usage_mb = performance_metrics.get('memory_usage_mb')
            step.cpu_usage_percent = performance_metrics.get('cpu_usage_percent')
            
            # Store detailed metrics
            await self._store_node_metrics(
                workflow_id, 
                step.execution_id, 
                step.node_id, 
                performance_metrics
            )
        
        await self.db.commit()
        
        # Notify WebSocket clients
        await connection_manager.send_execution_update(
            workflow_id,
            step.execution_id,
            step.node_id,
            status.value,
            step.execution_time_ms,
            error_message,
            next_nodes
        )
        
        # Update debug session error count
        if status == WorkflowExecutionStatus.FAILED:
            session = self.active_debug_sessions.get(workflow_id)
            if session:
                session.errors_detected += 1
                await self.db.commit()
        
        logger.debug(f"Node {step.node_id} execution completed with status {status.value}")
        return step

    async def track_execution_complete(self, execution_id: int, workflow_id: int,
                                     final_status: WorkflowExecutionStatus,
                                     duration_ms: int) -> None:
        """Track the completion of a workflow execution."""
        
        # Get execution steps for statistics
        result = await self.db.execute(
            select(WorkflowExecutionStep).where(
                WorkflowExecutionStep.execution_id == execution_id
            )
        )
        steps = result.scalars().all()
        
        success_count = sum(1 for step in steps if step.status == WorkflowExecutionStatus.SUCCESS)
        total_nodes = len(steps)
        
        # Notify WebSocket clients
        await connection_manager.send_execution_completed(
            workflow_id,
            execution_id,
            final_status.value,
            duration_ms,
            success_count,
            total_nodes
        )
        
        logger.info(f"Execution {execution_id} completed with status {final_status.value}")

    async def get_execution_timeline(self, execution_id: int) -> List[Dict[str, Any]]:
        """Get detailed execution timeline for debugging."""
        
        result = await self.db.execute(
            select(WorkflowExecutionStep)
            .where(WorkflowExecutionStep.execution_id == execution_id)
            .order_by(WorkflowExecutionStep.started_at)
        )
        steps = result.scalars().all()
        
        timeline = []
        for step in steps:
            timeline.append({
                'step_id': step.id,
                'node_id': step.node_id,
                'node_name': step.node_name,
                'node_type': step.node_type.value,
                'status': step.status.value,
                'started_at': step.started_at.isoformat() if step.started_at else None,
                'finished_at': step.finished_at.isoformat() if step.finished_at else None,
                'execution_time_ms': step.execution_time_ms,
                'input_data': step.input_data,
                'output_data': step.output_data,
                'error_message': step.error_message,
                'memory_usage_mb': step.memory_usage_mb,
                'cpu_usage_percent': step.cpu_usage_percent,
                'retry_count': step.retry_count
            })
        
        return timeline

    async def get_node_execution_logs(self, execution_id: int, node_id: str) -> Dict[str, Any]:
        """Get detailed logs for a specific node execution."""
        
        result = await self.db.execute(
            select(WorkflowExecutionStep).where(
                and_(
                    WorkflowExecutionStep.execution_id == execution_id,
                    WorkflowExecutionStep.node_id == node_id
                )
            )
        )
        step = result.scalar_one_or_none()
        
        if not step:
            return {}
        
        return {
            'node_id': step.node_id,
            'node_name': step.node_name,
            'execution_logs': step.debug_logs,
            'input_data': step.input_data,
            'output_data': step.output_data,
            'error_details': {
                'message': step.error_message,
                'stack_trace': step.error_stack_trace
            },
            'performance': {
                'execution_time_ms': step.execution_time_ms,
                'memory_usage_mb': step.memory_usage_mb,
                'cpu_usage_percent': step.cpu_usage_percent
            },
            'retry_count': step.retry_count
        }

    async def get_workflow_performance_metrics(self, workflow_id: int, 
                                             timeframe_hours: int = 24) -> Dict[str, Any]:
        """Get performance metrics for a workflow."""
        
        since = datetime.utcnow() - timedelta(hours=timeframe_hours)
        
        # Get execution metrics
        exec_result = await self.db.execute(
            select(
                func.count(WorkflowExecution.id).label('total_executions'),
                func.avg(WorkflowExecution.execution_time).label('avg_execution_time'),
                func.max(WorkflowExecution.execution_time).label('max_execution_time'),
                func.min(WorkflowExecution.execution_time).label('min_execution_time')
            ).where(
                and_(
                    WorkflowExecution.workflow_id == workflow_id,
                    WorkflowExecution.created_at >= since
                )
            )
        )
        exec_metrics = exec_result.first()
        
        # Get step-level performance metrics
        step_result = await self.db.execute(
            select(
                WorkflowExecutionStep.node_id,
                func.avg(WorkflowExecutionStep.execution_time_ms).label('avg_time_ms'),
                func.count(WorkflowExecutionStep.id).label('execution_count'),
                func.sum(func.case([(WorkflowExecutionStep.status == WorkflowExecutionStatus.FAILED, 1)], else_=0)).label('error_count')
            )
            .join(WorkflowExecution)
            .where(
                and_(
                    WorkflowExecution.workflow_id == workflow_id,
                    WorkflowExecutionStep.created_at >= since
                )
            )
            .group_by(WorkflowExecutionStep.node_id)
        )
        step_metrics = step_result.all()
        
        node_performance = {}
        for node_id, avg_time_ms, exec_count, error_count in step_metrics:
            node_performance[node_id] = {
                'avg_execution_time_ms': float(avg_time_ms) if avg_time_ms else 0,
                'execution_count': exec_count,
                'error_count': error_count,
                'success_rate': ((exec_count - error_count) / exec_count * 100) if exec_count > 0 else 0
            }
        
        return {
            'workflow_id': workflow_id,
            'timeframe_hours': timeframe_hours,
            'overall_metrics': {
                'total_executions': exec_metrics.total_executions or 0,
                'avg_execution_time_ms': int(exec_metrics.avg_execution_time or 0),
                'max_execution_time_ms': int(exec_metrics.max_execution_time or 0),
                'min_execution_time_ms': int(exec_metrics.min_execution_time or 0)
            },
            'node_performance': node_performance
        }

    async def export_execution_logs(self, workflow_id: int, 
                                  format_type: str = 'json',
                                  execution_ids: Optional[List[int]] = None) -> Dict[str, Any]:
        """Export execution logs and performance data."""
        
        # Build query for executions
        query = select(WorkflowExecution).options(
            selectinload(WorkflowExecution.execution_steps)
        ).where(WorkflowExecution.workflow_id == workflow_id)
        
        if execution_ids:
            query = query.where(WorkflowExecution.id.in_(execution_ids))
        
        result = await self.db.execute(query)
        executions = result.scalars().all()
        
        export_data = {
            'workflow_id': workflow_id,
            'export_timestamp': datetime.utcnow().isoformat(),
            'format': format_type,
            'executions': []
        }
        
        for execution in executions:
            exec_data = {
                'execution_id': execution.id,
                'status': execution.status.value,
                'started_at': execution.started_at.isoformat() if execution.started_at else None,
                'finished_at': execution.finished_at.isoformat() if execution.finished_at else None,
                'execution_time': execution.execution_time,
                'trigger_data': execution.trigger_data,
                'error_message': execution.error_message,
                'steps': []
            }
            
            for step in execution.execution_steps:
                step_data = {
                    'node_id': step.node_id,
                    'node_name': step.node_name,
                    'node_type': step.node_type.value,
                    'status': step.status.value,
                    'execution_time_ms': step.execution_time_ms,
                    'input_data': step.input_data,
                    'output_data': step.output_data,
                    'error_message': step.error_message,
                    'performance_metrics': {
                        'memory_usage_mb': step.memory_usage_mb,
                        'cpu_usage_percent': step.cpu_usage_percent
                    }
                }
                exec_data['steps'].append(step_data)
            
            export_data['executions'].append(exec_data)
        
        return export_data

    async def _end_existing_sessions(self, workflow_id: int, user_id: int) -> None:
        """End any existing active debug sessions."""
        
        result = await self.db.execute(
            select(WorkflowDebugSession).where(
                and_(
                    WorkflowDebugSession.workflow_id == workflow_id,
                    WorkflowDebugSession.user_id == user_id,
                    WorkflowDebugSession.is_active == True
                )
            )
        )
        sessions = result.scalars().all()
        
        for session in sessions:
            session.is_active = False
            session.ended_at = datetime.utcnow()
        
        await self.db.commit()

    async def _store_node_metrics(self, workflow_id: int, execution_id: int,
                                node_id: str, metrics: Dict[str, float]) -> None:
        """Store detailed performance metrics for a node."""
        
        timestamp = datetime.utcnow()
        
        for metric_name, value in metrics.items():
            if value is not None:
                # Determine unit based on metric name
                unit = 'ms' if 'time' in metric_name else 'mb' if 'memory' in metric_name else 'percent'
                
                metric = WorkflowPerformanceMetric(
                    workflow_id=workflow_id,
                    execution_id=execution_id,
                    node_id=node_id,
                    metric_name=metric_name,
                    metric_value=value,
                    metric_unit=unit,
                    measurement_timestamp=timestamp
                )
                
                self.db.add(metric)
        
        await self.db.commit()


class WorkflowExecutionDebugService(BaseService):
    """Enhanced execution service with debugging capabilities."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(WorkflowExecution, db)
        self.debug_service = WorkflowDebugService(db)

    async def create_execution_with_debug(self, workflow_id: int, 
                                        trigger_data: Dict[str, Any],
                                        debug_enabled: bool = True) -> WorkflowExecution:
        """Create a new workflow execution with debugging support."""
        
        execution = WorkflowExecution(
            workflow_id=workflow_id,
            status=WorkflowExecutionStatus.PENDING,
            trigger_data=trigger_data,
            started_at=datetime.utcnow()
        )
        
        self.db.add(execution)
        await self.db.commit()
        await self.db.refresh(execution)
        
        if debug_enabled:
            await self.debug_service.track_execution_start(execution, trigger_data)
        
        return execution

    async def get_execution_with_steps(self, execution_id: int) -> Optional[WorkflowExecution]:
        """Get execution with all debugging steps loaded."""
        
        result = await self.db.execute(
            select(WorkflowExecution)
            .options(selectinload(WorkflowExecution.execution_steps))
            .where(WorkflowExecution.id == execution_id)
        )
        
        return result.scalar_one_or_none()


# Export services for use in other modules
__all__ = ["WorkflowDebugService", "WorkflowExecutionDebugService"]