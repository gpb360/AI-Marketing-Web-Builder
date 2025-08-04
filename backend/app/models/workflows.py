"""Workflow engine models for visual automation."""

from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.types import JSON
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlalchemy.orm import relationship
import enum
from typing import Dict, Any, List

from .base import BaseModel, UUIDMixin, TimestampMixin


class WorkflowStatus(str, enum.Enum):
    """Workflow status options."""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    ARCHIVED = "archived"


class ExecutionStatus(str, enum.Enum):
    """Workflow execution status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class NodeType(str, enum.Enum):
    """Workflow node types."""
    TRIGGER = "trigger"
    ACTION = "action"
    CONDITION = "condition"
    DELAY = "delay"


class TriggerType(str, enum.Enum):
    """Workflow trigger types."""
    FORM_SUBMISSION = "form_submission"
    PAGE_VIEW = "page_view"
    TIME_BASED = "time_based"
    WEBHOOK = "webhook"
    MANUAL = "manual"


class ActionType(str, enum.Enum):
    """Workflow action types."""
    SEND_EMAIL = "send_email"
    ADD_TO_CRM = "add_to_crm"
    UPDATE_CONTACT = "update_contact"
    WEBHOOK_POST = "webhook_post"
    SLACK_NOTIFICATION = "slack_notification"
    DELAY = "delay"


class Workflow(BaseModel, UUIDMixin, TimestampMixin):
    """Visual workflow definition."""
    
    __tablename__ = "workflows"
    
    site_id = Column(String(36), ForeignKey("sites.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Workflow configuration
    trigger_config = Column(JSON, nullable=False)  # Trigger node configuration
    status = Column(SQLEnum(WorkflowStatus), default=WorkflowStatus.DRAFT)
    
    # Visual workflow data (for n8n-style editor)
    workflow_data = Column(JSON, default=dict)  # Complete workflow graph
    
    # Statistics
    total_executions = Column(Integer, default=0)
    successful_executions = Column(Integer, default=0)
    failed_executions = Column(Integer, default=0)
    
    # Relationships
    site = relationship("Site", back_populates="workflows")
    executions = relationship("WorkflowExecution", back_populates="workflow", cascade="all, delete-orphan")
    nodes = relationship("WorkflowNode", back_populates="workflow", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Workflow(name='{self.name}', status='{self.status}')>"
    
    @property
    def success_rate(self) -> float:
        """Calculate workflow success rate."""
        if self.total_executions == 0:
            return 0.0
        return (self.successful_executions / self.total_executions) * 100
    
    @property
    def is_active(self) -> bool:
        """Check if workflow is active."""
        return self.status == WorkflowStatus.ACTIVE


class WorkflowExecution(BaseModel, UUIDMixin, TimestampMixin):
    """Individual workflow execution record."""
    
    __tablename__ = "workflow_executions"
    
    workflow_id = Column(String(36), ForeignKey("workflows.id"), nullable=False)
    
    # Execution details
    trigger_data = Column(JSON, nullable=False)  # Data that triggered the workflow
    status = Column(SQLEnum(ExecutionStatus), default=ExecutionStatus.PENDING)
    
    # Timing
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    duration_seconds = Column(Integer)  # Calculated field
    
    # Results and errors
    result_data = Column(JSON, default=dict)
    error_message = Column(Text)
    execution_log = Column(JSON, default=list)  # Step-by-step execution log
    
    # Relationships
    workflow = relationship("Workflow", back_populates="executions")
    
    def __repr__(self) -> str:
        return f"<WorkflowExecution(workflow_id='{self.workflow_id}', status='{self.status}')>"
    
    @property
    def is_completed(self) -> bool:
        """Check if execution is completed (success or failure)."""
        return self.status in [ExecutionStatus.COMPLETED, ExecutionStatus.FAILED]
    
    @property
    def is_successful(self) -> bool:
        """Check if execution was successful."""
        return self.status == ExecutionStatus.COMPLETED


class WorkflowNode(BaseModel, UUIDMixin, TimestampMixin):
    """Individual node in a workflow graph."""
    
    __tablename__ = "workflow_nodes"
    
    workflow_id = Column(String(36), ForeignKey("workflows.id"), nullable=False)
    
    # Node identification
    node_id = Column(String(100), nullable=False)  # Unique within workflow
    name = Column(String(255), nullable=False)
    type = Column(SQLEnum(NodeType), nullable=False)
    
    # Node configuration
    config = Column(JSON, nullable=False)  # Node-specific configuration
    
    # Visual positioning (for n8n-style editor)
    position_x = Column(Integer, default=0)
    position_y = Column(Integer, default=0)
    
    # Node connections
    input_connections = Column(JSON, default=list)  # Incoming connections
    output_connections = Column(JSON, default=list)  # Outgoing connections
    
    # Execution settings
    continue_on_fail = Column(Boolean, default=False)
    always_output_data = Column(Boolean, default=False)
    
    # Relationships
    workflow = relationship("Workflow", back_populates="nodes")
    
    def __repr__(self) -> str:
        return f"<WorkflowNode(name='{self.name}', type='{self.type}')>"
    
    @property
    def is_trigger(self) -> bool:
        """Check if node is a trigger node."""
        return self.type == NodeType.TRIGGER
    
    @property
    def is_action(self) -> bool:
        """Check if node is an action node."""
        return self.type == NodeType.ACTION