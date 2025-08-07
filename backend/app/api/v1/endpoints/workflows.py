"""
Workflow automation endpoints.
"""

from typing import Any, List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.workflow import WorkflowStatus
from app.schemas.workflow import (
    Workflow, WorkflowCreate, WorkflowUpdate, WorkflowList,
    WorkflowExecution, WorkflowExecutionCreate, WorkflowExecutionDetail,
    WorkflowNode, WorkflowNodeCreate, WorkflowNodeUpdate,
    WorkflowTrigger, WorkflowStats, WorkflowTemplate, WorkflowAnalytics
)
from app.services.workflow_service import (
    WorkflowService, WorkflowExecutionService, WorkflowNodeService
)
from app.services.tasks import execute_workflow_task
from app.models.workflow import WorkflowCategory, TriggerType

router = APIRouter()


@router.get("/", response_model=WorkflowList)
async def get_workflows(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = Query(False),
    category: Optional[WorkflowCategory] = Query(None),
    status_filter: Optional[WorkflowStatus] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get user's workflows with pagination and filtering."""
    workflow_service = WorkflowService(db)

    if search:
        workflows = await workflow_service.search_workflows(search, current_user.id, category)
        total = len(workflows)
        # Apply pagination to search results
        workflows = workflows[skip:skip + limit]
    elif active_only:
        workflows = await workflow_service.get_active_workflows(current_user.id)
        total = len(workflows)
        workflows = workflows[skip:skip + limit]
    else:
        workflows = await workflow_service.get_by_owner(
            current_user.id, skip, limit, category, status_filter
        )
        filters = {"owner_id": current_user.id}
        if category:
            filters["category"] = category
        if status_filter:
            filters["status"] = status_filter
        total = await workflow_service.count(filters)

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
    background_tasks.add_task(execute_workflow_task.delay, execution.id)

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


# Additional Workflow Endpoints

@router.post("/{workflow_id}/execute", response_model=WorkflowExecution)
async def execute_workflow(
    workflow_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Manually execute a workflow."""
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
            detail="Not authorized to execute this workflow"
        )

    # Create execution record
    execution = await execution_service.create_execution(workflow_id, {"manual_trigger": True})

    # Increment trigger count
    await workflow_service.increment_trigger_count(workflow_id)

    # Add background task to execute workflow
    background_tasks.add_task(execute_workflow_task.delay, execution.id)

    return execution


@router.get("/templates", response_model=List[WorkflowTemplate])
async def get_workflow_templates(
    category: Optional[WorkflowCategory] = Query(None),
    trigger_type: Optional[TriggerType] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get available workflow templates."""
    # This would typically come from a database or configuration
    # For now, return some sample templates
    templates = [
        {
            "id": "lead-capture",
            "name": "Lead Capture Workflow",
            "description": "Capture leads from forms and send welcome emails",
            "category": WorkflowCategory.MARKETING,
            "trigger_type": TriggerType.FORM_SUBMIT,
            "template": {
                "name": "Lead Capture Workflow",
                "description": "Automatically capture and follow up with new leads",
                "category": WorkflowCategory.MARKETING,
                "trigger_type": TriggerType.FORM_SUBMIT,
                "nodes": [
                    {
                        "node_id": "trigger-1",
                        "name": "Form Submission",
                        "node_type": "trigger",
                        "parameters": {"form_fields": ["name", "email"]},
                        "position": {"x": 100, "y": 100}
                    },
                    {
                        "node_id": "email-1",
                        "name": "Welcome Email",
                        "node_type": "email",
                        "parameters": {
                            "template": "welcome",
                            "subject": "Welcome to our platform!"
                        },
                        "position": {"x": 300, "y": 100}
                    }
                ],
                "connections": [
                    {"source": "trigger-1", "target": "email-1"}
                ],
                "settings": {}
            }
        },
        {
            "id": "customer-support",
            "name": "Customer Support Workflow",
            "description": "Route customer inquiries to the right team",
            "category": WorkflowCategory.SUPPORT,
            "trigger_type": TriggerType.CONTACT_FORM,
            "template": {
                "name": "Customer Support Workflow",
                "description": "Automatically route and respond to customer inquiries",
                "category": WorkflowCategory.SUPPORT,
                "trigger_type": TriggerType.CONTACT_FORM,
                "nodes": [
                    {
                        "node_id": "trigger-1",
                        "name": "Contact Form",
                        "node_type": "trigger",
                        "parameters": {"form_type": "contact"},
                        "position": {"x": 100, "y": 100}
                    },
                    {
                        "node_id": "webhook-1",
                        "name": "Notify Team",
                        "node_type": "webhook",
                        "parameters": {"url": "/api/notifications/team"},
                        "position": {"x": 300, "y": 100}
                    }
                ],
                "connections": [
                    {"source": "trigger-1", "target": "webhook-1"}
                ],
                "settings": {}
            }
        }
    ]

    # Filter templates
    filtered_templates = templates
    if category:
        filtered_templates = [t for t in filtered_templates if t["category"] == category]
    if trigger_type:
        filtered_templates = [t for t in filtered_templates if t["trigger_type"] == trigger_type]

    return filtered_templates


@router.get("/{workflow_id}/analytics", response_model=WorkflowAnalytics)
async def get_workflow_analytics(
    workflow_id: int,
    timeframe: str = Query("week", regex="^(day|week|month)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get workflow analytics and performance metrics."""
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

    # Get execution statistics
    stats = await execution_service.get_execution_stats(workflow_id)

    # Generate trend data (mock data for now)
    trend_data = []
    for i in range(7):  # Last 7 days
        trend_data.append({
            "date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
            "executions": max(0, 10 - i + (i % 3)),
            "successes": max(0, 8 - i + (i % 2)),
            "failures": max(0, 2 - (i % 2))
        })

    return {
        "execution_count": stats["total_executions"],
        "success_rate": stats["success_rate"],
        "avg_execution_time": stats["avg_execution_time"] or 0,
        "error_rate": 100 - stats["success_rate"],
        "trend_data": trend_data
    }


@router.get("/executions/{execution_id}", response_model=WorkflowExecutionDetail)
async def get_execution_details(
    execution_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get detailed information about a specific workflow execution."""
    execution_service = WorkflowExecutionService(db)

    execution = await execution_service.get_by_id(execution_id)

    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow execution not found"
        )

    # Check ownership through workflow
    if execution.workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this execution"
        )

    # Convert to response model with additional details
    execution_dict = execution.__dict__.copy()
    execution_dict["workflow_name"] = execution.workflow.name
    execution_dict["workflow_category"] = execution.workflow.category

    return execution_dict