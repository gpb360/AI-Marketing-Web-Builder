"""
Collaboration models for real-time multi-user editing
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from enum import Enum
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, DateTime, Integer, Text, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class LockType(str, Enum):
    """Component lock types"""
    EDITING = "editing"
    MOVING = "moving"
    RESIZING = "resizing"


class UserStatus(str, Enum):
    """User presence status"""
    ACTIVE = "active"
    IDLE = "idle"
    AWAY = "away"


class UserPermission(str, Enum):
    """User permissions in collaboration"""
    OWNER = "owner"
    EDITOR = "editor"  
    VIEWER = "viewer"


class EventType(str, Enum):
    """Collaboration event types"""
    USER_JOINED = "user.joined"
    USER_LEFT = "user.left"
    USER_CURSOR_UPDATE = "user.cursor_update"
    COMPONENT_ADDED = "component.added"
    COMPONENT_UPDATED = "component.updated"
    COMPONENT_DELETED = "component.deleted"
    COMPONENT_MOVED = "component.moved"
    COMPONENT_RESIZED = "component.resized"
    COMPONENT_SELECTED = "component.selected"
    COMPONENT_LOCKED = "component.locked"
    COMPONENT_UNLOCKED = "component.unlocked"
    CHAT_MESSAGE = "chat.message"


# Database Models
class CollaborationRoom(Base):
    """Database model for collaboration rooms"""
    __tablename__ = "collaboration_rooms"

    id = Column(String, primary_key=True)
    project_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    max_users = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sessions = relationship("UserSession", back_populates="room", cascade="all, delete-orphan")
    messages = relationship("ChatMessage", back_populates="room", cascade="all, delete-orphan")
    locks = relationship("ComponentLock", back_populates="room", cascade="all, delete-orphan")


class UserSession(Base):
    """Database model for active user sessions"""
    __tablename__ = "user_sessions"

    id = Column(String, primary_key=True)
    room_id = Column(String, ForeignKey("collaboration_rooms.id"), nullable=False)
    user_id = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    user_color = Column(String, nullable=False)
    permissions = Column(String, default=UserPermission.EDITOR)
    status = Column(String, default=UserStatus.ACTIVE)
    last_seen = Column(DateTime, default=datetime.utcnow)
    joined_at = Column(DateTime, default=datetime.utcnow)
    cursor_position = Column(JSON)  # {x: number, y: number}
    cursor_visible = Column(Boolean, default=False)

    # Relationships
    room = relationship("CollaborationRoom", back_populates="sessions")


class ComponentLock(Base):
    """Database model for component locks"""
    __tablename__ = "component_locks"

    id = Column(String, primary_key=True)
    room_id = Column(String, ForeignKey("collaboration_rooms.id"), nullable=False)
    component_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    lock_type = Column(String, nullable=False)  # LockType enum
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

    # Relationships
    room = relationship("CollaborationRoom", back_populates="locks")

    def is_expired(self) -> bool:
        """Check if lock has expired"""
        return datetime.utcnow() > self.expires_at


class ChatMessage(Base):
    """Database model for chat messages"""
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True)
    room_id = Column(String, ForeignKey("collaboration_rooms.id"), nullable=False)
    user_id = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    message_type = Column(String, default="text")  # text, system, component_mention
    component_id = Column(String, nullable=True)  # For component mentions
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    room = relationship("CollaborationRoom", back_populates="messages")


class CollaborationEvent(Base):
    """Database model for storing collaboration events (for audit/replay)"""
    __tablename__ = "collaboration_events"

    id = Column(String, primary_key=True)
    room_id = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    component_id = Column(String, nullable=True)
    event_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)


# Pydantic Models for API
class CollaborationUserModel(BaseModel):
    """Pydantic model for collaboration user"""
    id: str
    name: str
    email: str
    color: str
    avatar: Optional[str] = None
    status: UserStatus
    last_seen: datetime
    permissions: UserPermission


class UserCursorModel(BaseModel):
    """Pydantic model for user cursor"""
    user_id: str
    position: Dict[str, float]  # {x: float, y: float}
    visible: bool
    timestamp: datetime


class ComponentLockModel(BaseModel):
    """Pydantic model for component lock"""
    component_id: str
    user_id: str
    lock_type: LockType
    timestamp: datetime
    expires_at: datetime


class ChatMessageModel(BaseModel):
    """Pydantic model for chat message"""
    id: str
    user_id: str
    user: CollaborationUserModel
    message: str
    timestamp: datetime
    message_type: str = "text"
    component_id: Optional[str] = None


class CollaborationEventModel(BaseModel):
    """Pydantic model for collaboration events"""
    id: str
    type: EventType
    user_id: str
    timestamp: datetime
    project_id: str
    
    # Event-specific data
    user: Optional[CollaborationUserModel] = None
    cursor: Optional[UserCursorModel] = None
    component: Optional[Dict[str, Any]] = None
    component_id: Optional[str] = None
    changes: Optional[Dict[str, Any]] = None
    position: Optional[Dict[str, float]] = None
    size: Optional[Dict[str, float]] = None
    lock: Optional[ComponentLockModel] = None
    message: Optional[str] = None


class WebSocketMessage(BaseModel):
    """Pydantic model for WebSocket messages"""
    type: str
    payload: Any
    timestamp: datetime
    message_id: str


class OperationModel(BaseModel):
    """Pydantic model for operational transform operations"""
    id: str
    type: str  # insert, delete, retain, modify
    position: Optional[int] = None
    length: Optional[int] = None
    data: Optional[Any] = None
    component_id: Optional[str] = None
    property: Optional[str] = None
    timestamp: datetime
    user_id: str


class OperationResultModel(BaseModel):
    """Pydantic model for operation transform results"""
    applied: bool
    transformed_ops: List[OperationModel]
    conflicts: List[Dict[str, Any]]


class SyncPreferencesModel(BaseModel):
    """Pydantic model for sync preferences"""
    enable_real_time_sync: bool = True
    enable_cursor_sharing: bool = True
    enable_component_locking: bool = True
    enable_chat_notifications: bool = True
    auto_save_interval: int = 5000  # milliseconds
    conflict_resolution_strategy: str = "auto"  # auto, manual, ask_user


class CollaborationStateModel(BaseModel):
    """Pydantic model for collaboration state"""
    is_connected: bool
    connection_status: str
    current_user: Optional[CollaborationUserModel]
    active_users: List[CollaborationUserModel]
    user_cursors: Dict[str, UserCursorModel]
    component_locks: Dict[str, ComponentLockModel]
    last_ping_time: Optional[datetime]
    connection_id: Optional[str]


class RoomCreateModel(BaseModel):
    """Pydantic model for creating collaboration rooms"""
    project_id: str
    name: str
    max_users: int = 10


class RoomJoinModel(BaseModel):
    """Pydantic model for joining collaboration rooms"""
    user_id: str
    user_name: str
    user_email: str
    auth_token: str


class CursorUpdateModel(BaseModel):
    """Pydantic model for cursor updates"""
    position: Dict[str, float]
    visible: bool = True


class ComponentLockRequestModel(BaseModel):
    """Pydantic model for component lock requests"""
    component_id: str
    lock_type: LockType


class ChatMessageRequestModel(BaseModel):
    """Pydantic model for chat message requests"""
    message: str
    component_id: Optional[str] = None