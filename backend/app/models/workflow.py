"""
Workflow models for n8n-style automation engine.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Boolean, JSON, Enum, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from datetime import datetime

from app.models.base import Base, TimestampMixin, UUIDMixin


class WorkflowStatus(str, enum.Enum):
    """Workflow status enumeration."""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    ARCHIVED = "archived"


class WorkflowExecutionStatus(str, enum.Enum):
    """Workflow execution status."""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class NodeType(str, enum.Enum):
    """Workflow node types."""
    TRIGGER = "trigger"
    ACTION = "action"
    CONDITION = "condition"
    WEBHOOK = "webhook"
    EMAIL = "email"
    HTTP_REQUEST = "http_request"
    DATA_TRANSFORM = "data_transform"
    CRM_UPDATE = "crm_update"
    DELAY = "delay"


class WorkflowCategory(str, enum.Enum):
    """Workflow categories for Magic Connector."""
    MARKETING = "marketing"
    SUPPORT = "support"
    SALES = "sales"
    AUTOMATION = "automation"
    ANALYTICS = "analytics"
    INTEGRATION = "integration"


class TriggerType(str, enum.Enum):
    """Workflow trigger types."""
    FORM_SUBMIT = "form-submit"
    BUTTON_CLICK = "button-click"
    PAGE_VIEW = "page-view"
    CHAT_MESSAGE = "chat-message"
    CONTACT_FORM = "contact-form"
    EMAIL_OPEN = "email-open"
    EMAIL_CLICK = "email-click"
    WEBHOOK = "webhook"
    SCHEDULE = "schedule"
    MANUAL = "manual"


class Workflow(Base, TimestampMixin, UUIDMixin):
    """Workflow automation model."""

    __tablename__ = "workflows"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[WorkflowStatus] = mapped_column(Enum(WorkflowStatus), default=WorkflowStatus.DRAFT)

    # Magic Connector fields
    category: Mapped[WorkflowCategory] = mapped_column(Enum(WorkflowCategory), default=WorkflowCategory.AUTOMATION)
    trigger_type: Mapped[TriggerType] = mapped_column(Enum(TriggerType), default=TriggerType.MANUAL)
    template_id: Mapped[Optional[str]] = mapped_column(String(100))  # Reference to workflow template
    component_id: Mapped[Optional[str]] = mapped_column(String(100))  # Connected component ID

    # Workflow configuration
    nodes: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    connections: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    settings: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)

    # Execution settings
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    trigger_count: Mapped[int] = mapped_column(Integer, default=0)
    success_count: Mapped[int] = mapped_column(Integer, default=0)
    error_count: Mapped[int] = mapped_column(Integer, default=0)

    # Workflow relationships
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    owner: Mapped["User"] = relationship("User", back_populates="workflows")
    executions: Mapped[List["WorkflowExecution"]] = relationship("WorkflowExecution", back_populates="workflow")

    @property
    def success_rate(self) -> float:
        """Calculate workflow success rate."""
        if self.trigger_count == 0:
            return 0.0
        return (self.success_count / self.trigger_count) * 100

    @property
    def error_rate(self) -> float:
        """Calculate workflow error rate."""
        if self.trigger_count == 0:
            return 0.0
        return (self.error_count / self.trigger_count) * 100

    def __repr__(self) -> str:
        return f"<Workflow(id={self.id}, name='{self.name}', status='{self.status}', category='{self.category}')>"


class WorkflowExecution(Base, TimestampMixin, UUIDMixin):
    """Workflow execution history and logs."""
    
    __tablename__ = "workflow_executions"
    
    workflow_id: Mapped[int] = mapped_column(ForeignKey("workflows.id"), nullable=False)
    status: Mapped[WorkflowExecutionStatus] = mapped_column(
        Enum(WorkflowExecutionStatus), 
        default=WorkflowExecutionStatus.PENDING
    )
    
    # Execution details
    trigger_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    execution_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    
    # Timing information
    started_at: Mapped[Optional[datetime]] = mapped_column()
    finished_at: Mapped[Optional[datetime]] = mapped_column()
    execution_time: Mapped[Optional[int]] = mapped_column(Integer)  # in milliseconds
    
    # Relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="executions")
    
    def __repr__(self) -> str:
        return f"<WorkflowExecution(id={self.id}, workflow_id={self.workflow_id}, status='{self.status}')>"


class WorkflowNode(Base, TimestampMixin, UUIDMixin):
    """Individual workflow node configuration."""
    
    __tablename__ = "workflow_nodes"
    
    workflow_id: Mapped[int] = mapped_column(ForeignKey("workflows.id"), nullable=False)
    node_id: Mapped[str] = mapped_column(String(100), nullable=False)  # UUID-like identifier
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    node_type: Mapped[NodeType] = mapped_column(Enum(NodeType), nullable=False)
    
    # Node configuration
    parameters: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    position: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)  # x, y coordinates
    
    # Node relationships and connections
    inputs: Mapped[List[str]] = mapped_column(JSON, default=list)  # Connected input node IDs
    outputs: Mapped[List[str]] = mapped_column(JSON, default=list)  # Connected output node IDs
    
    def __repr__(self) -> str:
        return f"<WorkflowNode(id={self.id}, node_id='{self.node_id}', type='{self.node_type}')>"