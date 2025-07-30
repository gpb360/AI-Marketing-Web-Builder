"""
Workflow service for workflow automation management.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import datetime

from app.models.workflow import Workflow, WorkflowExecution, WorkflowNode, WorkflowStatus, WorkflowExecutionStatus
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate, WorkflowExecutionCreate, WorkflowNodeCreate, WorkflowNodeUpdate
from app.services.base_service import BaseService


class WorkflowService(BaseService[Workflow, WorkflowCreate, WorkflowUpdate]):
    """Workflow service for workflow management."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Workflow, db)
    
    async def get_by_owner(self, owner_id: int, skip: int = 0, limit: int = 100) -> List[Workflow]:
        """Get workflows by owner."""
        result = await self.db.execute(
            select(Workflow)
            .where(Workflow.owner_id == owner_id)
            .order_by(Workflow.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_active_workflows(self, owner_id: Optional[int] = None) -> List[Workflow]:
        """Get active workflows."""
        query = select(Workflow).where(
            and_(Workflow.status == WorkflowStatus.ACTIVE, Workflow.is_active == True)
        )
        
        if owner_id:
            query = query.where(Workflow.owner_id == owner_id)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def activate_workflow(self, workflow_id: int) -> Optional[Workflow]:
        """Activate a workflow."""
        workflow = await self.get_by_id(workflow_id)
        if workflow:
            workflow.status = WorkflowStatus.ACTIVE
            workflow.is_active = True
            await self.db.commit()
            await self.db.refresh(workflow)
        return workflow
    
    async def deactivate_workflow(self, workflow_id: int) -> Optional[Workflow]:
        """Deactivate a workflow."""
        workflow = await self.get_by_id(workflow_id)
        if workflow:
            workflow.status = WorkflowStatus.PAUSED
            workflow.is_active = False
            await self.db.commit()
            await self.db.refresh(workflow)
        return workflow
    
    async def increment_trigger_count(self, workflow_id: int) -> Optional[Workflow]:
        """Increment workflow trigger count."""
        workflow = await self.get_by_id(workflow_id)
        if workflow:
            workflow.trigger_count += 1
            await self.db.commit()
            await self.db.refresh(workflow)
        return workflow
    
    async def increment_success_count(self, workflow_id: int) -> Optional[Workflow]:
        """Increment workflow success count."""
        workflow = await self.get_by_id(workflow_id)
        if workflow:
            workflow.success_count += 1
            await self.db.commit()
            await self.db.refresh(workflow)
        return workflow
    
    async def increment_error_count(self, workflow_id: int) -> Optional[Workflow]:
        """Increment workflow error count."""
        workflow = await self.get_by_id(workflow_id)
        if workflow:
            workflow.error_count += 1
            await self.db.commit()
            await self.db.refresh(workflow)
        return workflow
    
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
    
    async def create_execution(self, workflow_id: int, trigger_data: Dict[str, Any]) -> WorkflowExecution:
        """Create a new workflow execution."""
        execution = WorkflowExecution(
            workflow_id=workflow_id,
            trigger_data=trigger_data,
            status=WorkflowExecutionStatus.PENDING
        )
        self.db.add(execution)
        await self.db.commit()
        await self.db.refresh(execution)
        return execution
    
    async def start_execution(self, execution_id: int) -> Optional[WorkflowExecution]:
        """Start a workflow execution."""
        execution = await self.get_by_id(execution_id)
        if execution:
            execution.status = WorkflowExecutionStatus.RUNNING
            execution.started_at = datetime.utcnow()
            await self.db.commit()
            await self.db.refresh(execution)
        return execution
    
    async def complete_execution(self, execution_id: int, execution_data: Dict[str, Any]) -> Optional[WorkflowExecution]:
        """Complete a workflow execution successfully."""
        execution = await self.get_by_id(execution_id)
        if execution:
            execution.status = WorkflowExecutionStatus.SUCCESS
            execution.finished_at = datetime.utcnow()
            execution.execution_data = execution_data
            
            if execution.started_at:
                execution.execution_time = int((execution.finished_at - execution.started_at).total_seconds() * 1000)
            
            await self.db.commit()
            await self.db.refresh(execution)
        return execution
    
    async def fail_execution(self, execution_id: int, error_message: str) -> Optional[WorkflowExecution]:
        """Fail a workflow execution."""
        execution = await self.get_by_id(execution_id)
        if execution:
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