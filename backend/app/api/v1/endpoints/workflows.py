"""
Workflow automation endpoints.
"""

from typing import Any, List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.workflow import (
    Workflow, WorkflowCreate, WorkflowUpdate, WorkflowList,
    WorkflowExecution, WorkflowExecutionCreate,
    WorkflowNode, WorkflowNodeCreate, WorkflowNodeUpdate,
    WorkflowTrigger, WorkflowStats
)
from app.services.workflow_service import (
    WorkflowService, WorkflowExecutionService, WorkflowNodeService
)

router = APIRouter()


@router.get("/", response_model=WorkflowList)
async def get_workflows(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get user's workflows with pagination."""
    workflow_service = WorkflowService(db)
    
    if active_only:
        workflows = await workflow_service.get_active_workflows(current_user.id)
        total = len(workflows)
    else:
        workflows = await workflow_service.get_by_owner(current_user.id, skip, limit)
        total = await workflow_service.count({"owner_id": current_user.id})
    
    return {
        "workflows": workflows,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/stats", response_model=WorkflowStats)
async def get_workflow_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get workflow statistics for current user."""
    workflow_service = WorkflowService(db)
    execution_service = WorkflowExecutionService(db)
    
    workflow_stats = await workflow_service.get_workflow_stats(current_user.id)
    execution_stats = await execution_service.get_execution_stats()
    
    return {
        **workflow_stats,
        **execution_stats
    }


@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(
    workflow_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get workflow by ID."""
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check ownership
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this workflow"
        )
    
    return workflow


@router.post("/", response_model=Workflow, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow_in: WorkflowCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Create a new workflow."""
    workflow_service = WorkflowService(db)
    return await workflow_service.create(workflow_in, owner_id=current_user.id)


@router.put("/{workflow_id}", response_model=Workflow)
async def update_workflow(
    workflow_id: int,
    workflow_in: WorkflowUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Update workflow."""
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check ownership
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this workflow"
        )
    
    updated_workflow = await workflow_service.update(workflow_id, workflow_in)
    return updated_workflow


@router.post("/{workflow_id}/activate", response_model=Workflow)
async def activate_workflow(
    workflow_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Activate a workflow."""
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check ownership
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this workflow"
        )
    
    activated_workflow = await workflow_service.activate_workflow(workflow_id)
    return activated_workflow


@router.post("/{workflow_id}/deactivate", response_model=Workflow)
async def deactivate_workflow(
    workflow_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Deactivate a workflow."""
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check ownership
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this workflow"
        )
    
    deactivated_workflow = await workflow_service.deactivate_workflow(workflow_id)
    return deactivated_workflow


@router.post("/{workflow_id}/trigger", response_model=WorkflowExecution)
async def trigger_workflow(
    workflow_id: int,
    trigger_data: WorkflowTrigger,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Trigger workflow execution."""
    workflow_service = WorkflowService(db)
    execution_service = WorkflowExecutionService(db)
    
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check ownership
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to trigger this workflow"
        )
    
    if not workflow.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workflow is not active"
        )
    
    # Create execution record
    execution = await execution_service.create_execution(workflow_id, trigger_data.trigger_data)
    
    # Increment trigger count
    await workflow_service.increment_trigger_count(workflow_id)
    
    # Add background task to execute workflow
    # background_tasks.add_task(execute_workflow_background, execution.id)
    
    return execution


@router.get("/{workflow_id}/executions", response_model=List[WorkflowExecution])
async def get_workflow_executions(
    workflow_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get workflow execution history."""
    workflow_service = WorkflowService(db)
    execution_service = WorkflowExecutionService(db)
    
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check ownership
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this workflow"
        )
    
    return await execution_service.get_by_workflow(workflow_id, skip, limit)


@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Delete workflow."""
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check ownership
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this workflow"
        )
    
    success = await workflow_service.delete(workflow_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete workflow"
        )
    
    return {"message": "Workflow deleted successfully"}


# Workflow Nodes endpoints
@router.get("/{workflow_id}/nodes", response_model=List[WorkflowNode])
async def get_workflow_nodes(
    workflow_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get workflow nodes."""
    workflow_service = WorkflowService(db)
    node_service = WorkflowNodeService(db)
    
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check ownership
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this workflow"
        )
    
    return await node_service.get_by_workflow(workflow_id)


@router.post("/{workflow_id}/nodes", response_model=WorkflowNode, status_code=status.HTTP_201_CREATED)
async def create_workflow_node(
    workflow_id: int,
    node_in: WorkflowNodeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Create workflow node."""
    workflow_service = WorkflowService(db)
    node_service = WorkflowNodeService(db)
    
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check ownership
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this workflow"
        )
    
    # Set workflow_id from URL
    node_in.workflow_id = workflow_id
    return await node_service.create(node_in)


@router.put("/{workflow_id}/nodes/{node_id}", response_model=WorkflowNode)
async def update_workflow_node(
    workflow_id: int,
    node_id: int,
    node_in: WorkflowNodeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Update workflow node."""
    workflow_service = WorkflowService(db)
    node_service = WorkflowNodeService(db)
    
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check ownership
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this workflow"
        )
    
    node = await node_service.update(node_id, node_in)
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow node not found"
        )
    
    return node


@router.delete("/{workflow_id}/nodes/{node_id}")
async def delete_workflow_node(
    workflow_id: int,
    node_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Delete workflow node."""
    workflow_service = WorkflowService(db)
    node_service = WorkflowNodeService(db)
    
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check ownership
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this workflow"
        )
    
    success = await node_service.delete(node_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow node not found"
        )
    
    return {"message": "Workflow node deleted successfully"}