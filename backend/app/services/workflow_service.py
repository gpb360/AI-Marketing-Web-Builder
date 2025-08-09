"""
Workflow service for workflow automation management.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, or_
from datetime import datetime
from fastapi import HTTPException, status

from app.models.workflow import (
    Workflow, WorkflowExecution, WorkflowNode,
    WorkflowStatus, WorkflowExecutionStatus, WorkflowCategory, TriggerType
)
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate, WorkflowExecutionCreate, WorkflowNodeCreate, WorkflowNodeUpdate
from app.services.base_service import BaseService


class WorkflowService(BaseService[Workflow, WorkflowCreate, WorkflowUpdate]):
    """Workflow service for workflow management."""

    def __init__(self, db: AsyncSession):
        super().__init__(Workflow, db)

    async def create(self, obj_in: WorkflowCreate, **kwargs) -> Workflow:
        """Create a new workflow with validation."""
        # Validate workflow data
        self._validate_workflow_data(obj_in.nodes, obj_in.connections)

        # Call parent create method
        return await super().create(obj_in, **kwargs)

    async def update(self, id: int, obj_in: WorkflowUpdate) -> Optional[Workflow]:
        """Update workflow with validation."""
        # Validate workflow data if provided
        if obj_in.nodes is not None and obj_in.connections is not None:
            self._validate_workflow_data(obj_in.nodes, obj_in.connections)

        return await super().update(id, obj_in)

    def _validate_workflow_data(self, nodes: List[Dict[str, Any]], connections: List[Dict[str, Any]]) -> None:
        """Validate workflow nodes and connections."""
        if not nodes:
            return  # Empty workflow is valid

        # Validate nodes
        node_ids = set()
        trigger_count = 0

        for node in nodes:
            if not isinstance(node, dict):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid node format"
                )

            node_id = node.get('node_id') or node.get('id')
            if not node_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Node must have an ID"
                )

            if node_id in node_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Duplicate node ID: {node_id}"
                )

            node_ids.add(node_id)

            # Count trigger nodes
            if node.get('node_type') == 'trigger' or node.get('type') == 'trigger':
                trigger_count += 1

        # Validate connections
        for connection in connections:
            if not isinstance(connection, dict):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid connection format"
                )

            source = connection.get('source') or connection.get('sourceId')
            target = connection.get('target') or connection.get('targetId')

            if not source or not target:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Connection must have source and target"
                )

            if source not in node_ids or target not in node_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Connection references non-existent node"
                )

    async def get_by_owner(
        self,
        owner_id: int,
        skip: int = 0,
        limit: int = 100,
        category: Optional[WorkflowCategory] = None,
        status_filter: Optional[WorkflowStatus] = None,
        search: Optional[str] = None
    ) -> List[Workflow]:
        """Get workflows by owner with filters."""
        query = select(Workflow).where(Workflow.owner_id == owner_id)

        if category:
            query = query.where(Workflow.category == category)

        if status_filter:
            query = query.where(Workflow.status == status_filter)

        if search:
            query = query.where(
                or_(
                    Workflow.name.ilike(f"%{search}%"),
                    Workflow.description.ilike(f"%{search}%")
                )
            )

        query = query.order_by(Workflow.updated_at.desc()).offset(skip).limit(limit)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def activate(self, id: int) -> Optional[Workflow]:
        """Activate a workflow."""
        workflow = await self.get(id)
        if not workflow:
            return None

        workflow.status = WorkflowStatus.ACTIVE
        workflow.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(workflow)
        return workflow

    async def deactivate(self, id: int) -> Optional[Workflow]:
        """Deactivate a workflow."""
        workflow = await self.get(id)
        if not workflow:
            return None

        workflow.status = WorkflowStatus.INACTIVE
        workflow.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(workflow)
        return workflow

    async def duplicate(self, id: int, name: Optional[str] = None) -> Optional[Workflow]:
        """Duplicate a workflow."""
        original_workflow = await self.get(id)
        if not original_workflow:
            return None

        duplicate_name = name or f"{original_workflow.name} (Copy)"
        
        duplicate_data = WorkflowCreate(
            name=duplicate_name,
            description=original_workflow.description,
            nodes=original_workflow.nodes,
            connections=original_workflow.connections,
            trigger_type=original_workflow.trigger_type,
            category=original_workflow.category,
            settings=original_workflow.settings
        )

        return await self.create(duplicate_data, owner_id=original_workflow.owner_id)

    async def get_by_category(self, category: WorkflowCategory, owner_id: Optional[int] = None) -> List[Workflow]:
        """Get workflows by category."""
        query = select(Workflow).where(Workflow.category == category)

        if owner_id:
            query = query.where(Workflow.owner_id == owner_id)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_by_status(self, status: WorkflowStatus, owner_id: Optional[int] = None) -> List[Workflow]:
        """Get workflows by status."""
        query = select(Workflow).where(Workflow.status == status)

        if owner_id:
            query = query.where(Workflow.owner_id == owner_id)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_by_trigger_type(self, trigger_type: TriggerType, owner_id: Optional[int] = None) -> List[Workflow]:
        """Get workflows by trigger type."""
        query = select(Workflow).where(Workflow.trigger_type == trigger_type)

        if owner_id:
            query = query.where(Workflow.owner_id == owner_id)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def search_workflows(
        self,
        query_text: str,
        owner_id: Optional[int] = None,
        category: Optional[WorkflowCategory] = None
    ) -> List[Workflow]:
        """Search workflows by name or description."""
        search_query = select(Workflow).where(
            or_(
                Workflow.name.ilike(f"%{query_text}%"),
                Workflow.description.ilike(f"%{query_text}%")
            )
        )

        if owner_id:
            search_query = search_query.where(Workflow.owner_id == owner_id)

        if category:
            search_query = search_query.where(Workflow.category == category)

        result = await self.db.execute(search_query)
        return result.scalars().all()

    async def get_workflow_stats(self, owner_id: Optional[int] = None) -> Dict[str, Any]:
        """Get workflow statistics."""
        base_query = select(func.count(Workflow.id))

        if owner_id:
            base_query = base_query.where(Workflow.owner_id == owner_id)

        total_result = await self.db.execute(base_query)
        total_workflows = total_result.scalar()

        active_query = base_query.where(Workflow.status == WorkflowStatus.ACTIVE)
        active_result = await self.db.execute(active_query)
        active_workflows = active_result.scalar()

        return {
            "total_workflows": total_workflows,
            "active_workflows": active_workflows,
            "inactive_workflows": total_workflows - active_workflows
        }


class WorkflowExecutionService(BaseService[WorkflowExecution, WorkflowExecutionCreate, None]):
    """Workflow execution service for execution management."""

    def __init__(self, db: AsyncSession):
        super().__init__(WorkflowExecution, db)

    async def create_execution(
        self,
        workflow_id: int,
        trigger_data: Optional[Dict[str, Any]] = None,
        triggered_by: Optional[int] = None
    ) -> WorkflowExecution:
        """Create a new workflow execution."""
        execution_data = WorkflowExecutionCreate(
            workflow_id=workflow_id,
            trigger_data=trigger_data or {},
            triggered_by=triggered_by
        )
        return await self.create(execution_data)

    async def start_execution(self, execution_id: int) -> Optional[WorkflowExecution]:
        """Mark execution as started."""
        execution = await self.get(execution_id)
        if not execution:
            return None

        execution.status = WorkflowExecutionStatus.RUNNING
        execution.started_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(execution)
        return execution

    async def complete_execution(self, execution_id: int, execution_data: Optional[Dict[str, Any]] = None) -> Optional[WorkflowExecution]:
        """Mark execution as completed successfully."""
        execution = await self.get(execution_id)
        if not execution:
            return None

        execution.status = WorkflowExecutionStatus.SUCCESS
        execution.finished_at = datetime.utcnow()
        
        if execution_data:
            execution.execution_data = execution_data
        
        if execution.started_at:
            execution.execution_time = int((execution.finished_at - execution.started_at).total_seconds() * 1000)
        
        await self.db.commit()
        await self.db.refresh(execution)
        return execution

    async def fail_execution(self, execution_id: int, error_message: str) -> Optional[WorkflowExecution]:
        """Mark execution as failed."""
        execution = await self.get(execution_id)
        if not execution:
            return None

        execution.status = WorkflowExecutionStatus.FAILED
        execution.finished_at = datetime.utcnow()
        execution.error_message = error_message
        
        if execution.started_at:
            execution.execution_time = int((execution.finished_at - execution.started_at).total_seconds() * 1000)
        
        await self.db.commit()
        await self.db.refresh(execution)
        return execution
    
    async def get_by_workflow(self, workflow_id: int, skip: int = 0, limit: int = 100) -> List[WorkflowExecution]:
        """Get executions by workflow."""
        result = await self.db.execute(
            select(WorkflowExecution)
            .where(WorkflowExecution.workflow_id == workflow_id)
            .order_by(WorkflowExecution.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_execution_stats(self, workflow_id: Optional[int] = None) -> Dict[str, Any]:
        """Get execution statistics."""
        base_query = select(func.count(WorkflowExecution.id))
        
        if workflow_id:
            base_query = base_query.where(WorkflowExecution.workflow_id == workflow_id)
        
        total_result = await self.db.execute(base_query)
        total_executions = total_result.scalar()
        
        success_query = base_query.where(WorkflowExecution.status == WorkflowExecutionStatus.SUCCESS)
        success_result = await self.db.execute(success_query)
        success_executions = success_result.scalar()
        
        success_rate = (success_executions / total_executions * 100) if total_executions > 0 else 0
        
        # Get average execution time
        avg_time_query = select(func.avg(WorkflowExecution.execution_time)).where(
            WorkflowExecution.execution_time.isnot(None)
        )
        if workflow_id:
            avg_time_query = avg_time_query.where(WorkflowExecution.workflow_id == workflow_id)
        
        avg_time_result = await self.db.execute(avg_time_query)
        avg_execution_time = avg_time_result.scalar()
        
        return {
            "total_executions": total_executions,
            "success_executions": success_executions,
            "success_rate": success_rate,
            "avg_execution_time": avg_execution_time
        }

    # Story 3.1: Real-time debugging enhancements
    async def update_node_execution_status(
        self,
        execution_id: int, 
        node_id: str, 
        status: str,
        execution_time_ms: Optional[int] = None,
        error_details: Optional[str] = None
    ) -> bool:
        """
        Update node execution status for real-time debugging.
        Integrates with WebSocket system for live updates.
        """
        from app.api.v1.endpoints.workflow_websocket import connection_manager
        
        execution = await self.get(execution_id)
        if not execution:
            return False

        # Update execution data with node status
        if not execution.execution_data:
            execution.execution_data = {}
        
        if 'node_statuses' not in execution.execution_data:
            execution.execution_data['node_statuses'] = {}
        
        execution.execution_data['node_statuses'][node_id] = {
            'status': status,
            'timestamp': datetime.utcnow().isoformat(),
            'execution_time_ms': execution_time_ms,
            'error_details': error_details
        }
        
        await self.db.commit()
        
        # Send real-time update via WebSocket
        await connection_manager.send_execution_update(
            workflow_id=execution.workflow_id,
            execution_id=execution_id,
            node_id=node_id,
            status=status,
            execution_time_ms=execution_time_ms,
            error_details=error_details
        )
        
        return True

    async def get_node_execution_logs(
        self, 
        execution_id: int, 
        node_id: str
    ) -> List[Dict[str, Any]]:
        """Get execution logs for a specific node."""
        execution = await self.get(execution_id)
        if not execution or not execution.execution_data:
            return []
        
        node_logs = execution.execution_data.get('node_logs', {}).get(node_id, [])
        return node_logs

    async def add_node_execution_log(
        self,
        execution_id: int,
        node_id: str,
        level: str,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Add a log entry for a specific node execution."""
        execution = await self.get(execution_id)
        if not execution:
            return False

        if not execution.execution_data:
            execution.execution_data = {}
        
        if 'node_logs' not in execution.execution_data:
            execution.execution_data['node_logs'] = {}
        
        if node_id not in execution.execution_data['node_logs']:
            execution.execution_data['node_logs'][node_id] = []
        
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': level,
            'message': message,
            'context': context or {}
        }
        
        execution.execution_data['node_logs'][node_id].append(log_entry)
        
        await self.db.commit()
        return True

    async def get_execution_timeline_data(self, execution_id: int) -> Dict[str, Any]:
        """Get comprehensive timeline data for an execution."""
        execution = await self.get(execution_id)
        if not execution:
            return {}

        # Get workflow details
        workflow = await self.db.execute(
            select(Workflow).where(Workflow.id == execution.workflow_id)
        )
        workflow = workflow.scalar_one_or_none()

        if not workflow:
            return {}

        # Process node statuses and create timeline steps
        node_statuses = execution.execution_data.get('node_statuses', {}) if execution.execution_data else {}
        steps = []
        completed_steps = 0
        failed_steps = 0

        for node in workflow.nodes:
            node_id = node.get('id') or node.get('node_id')
            if not node_id:
                continue

            status_info = node_statuses.get(node_id, {})
            status = status_info.get('status', 'pending')
            
            if status in ['success', 'completed']:
                completed_steps += 1
            elif status == 'failed':
                failed_steps += 1

            step = {
                'id': f"step-{node_id}",
                'node_id': node_id,
                'node_name': node.get('name', node_id),
                'node_type': node.get('type'),
                'status': status,
                'execution_time_ms': status_info.get('execution_time_ms'),
                'error_message': status_info.get('error_details'),
                'started_at': status_info.get('timestamp') if status != 'pending' else None,
                'finished_at': status_info.get('timestamp') if status in ['success', 'failed', 'completed'] else None
            }
            steps.append(step)

        total_steps = len(workflow.nodes)
        success_rate = (completed_steps / total_steps * 100) if total_steps > 0 else 0

        return {
            'execution_id': execution_id,
            'workflow_id': execution.workflow_id,
            'workflow_name': workflow.name,
            'status': execution.status.value,
            'started_at': execution.started_at.isoformat() if execution.started_at else None,
            'finished_at': execution.finished_at.isoformat() if execution.finished_at else None,
            'total_duration_ms': execution.execution_time,
            'total_steps': total_steps,
            'completed_steps': completed_steps,
            'failed_steps': failed_steps,
            'success_rate': success_rate,
            'steps': steps
        }


class WorkflowNodeService(BaseService[WorkflowNode, WorkflowNodeCreate, WorkflowNodeUpdate]):
    """Workflow node service for node management."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(WorkflowNode, db)
    
    async def get_by_workflow(self, workflow_id: int) -> List[WorkflowNode]:
        """Get nodes by workflow."""
        result = await self.db.execute(
            select(WorkflowNode)
            .where(WorkflowNode.workflow_id == workflow_id)
            .order_by(WorkflowNode.created_at)
        )
        return result.scalars().all()
    
    async def get_by_node_id(self, workflow_id: int, node_id: str) -> Optional[WorkflowNode]:
        """Get node by workflow and node ID."""
        result = await self.db.execute(
            select(WorkflowNode)
            .where(
                and_(
                    WorkflowNode.workflow_id == workflow_id,
                    WorkflowNode.node_id == node_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    # Story 3.1: Real-time debugging enhancements
    async def restart_node(self, workflow_id: int, node_id: str) -> bool:
        """Restart a failed workflow node."""
        # This would integrate with the workflow execution engine
        # to restart a specific node in the workflow
        node = await self.get_by_node_id(workflow_id, node_id)
        if not node:
            return False
        
        # Reset node status and trigger restart
        # Implementation would depend on the workflow execution engine
        return True
    
    async def skip_node(self, workflow_id: int, node_id: str) -> bool:
        """Skip a failed workflow node and continue execution."""
        node = await self.get_by_node_id(workflow_id, node_id)
        if not node:
            return False
        
        # Mark node as skipped and continue workflow execution
        # Implementation would depend on the workflow execution engine
        return True