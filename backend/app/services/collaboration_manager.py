"""
Real-time Collaboration Manager
Handles WebSocket connections and real-time synchronization
"""

import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Any
from uuid import uuid4
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from ..core.database import get_db_session
from ..models.collaboration import (
    CollaborationRoom,
    UserSession,
    ComponentLock,
    ChatMessage,
    CollaborationEvent,
    CollaborationUserModel,
    CollaborationEventModel,
    WebSocketMessage,
    UserStatus,
    LockType,
    EventType,
)

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time collaboration"""

    def __init__(self):
        # Active connections: room_id -> {user_id -> WebSocket}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        
        # User sessions: connection_id -> session_info
        self.user_sessions: Dict[str, Dict[str, Any]] = {}
        
        # Room locks: room_id -> {component_id -> lock_info}
        self.room_locks: Dict[str, Dict[str, ComponentLock]] = {}
        
        # Cleanup task
        self._cleanup_task: Optional[asyncio.Task] = None
        self._start_cleanup_task()

    def _start_cleanup_task(self):
        """Start background task for cleaning up expired locks and inactive sessions"""
        if self._cleanup_task is None or self._cleanup_task.done():
            self._cleanup_task = asyncio.create_task(self._cleanup_expired_data())

    async def _cleanup_expired_data(self):
        """Background task to clean up expired locks and inactive sessions"""
        while True:
            try:
                await asyncio.sleep(30)  # Run every 30 seconds
                
                current_time = datetime.utcnow()
                
                # Clean up expired locks
                for room_id, locks in self.room_locks.items():
                    expired_locks = [
                        component_id for component_id, lock in locks.items()
                        if lock.is_expired()
                    ]
                    
                    for component_id in expired_locks:
                        lock = locks.pop(component_id)
                        await self._broadcast_to_room(room_id, {
                            "type": "collaboration_event",
                            "payload": CollaborationEventModel(
                                id=str(uuid4()),
                                type=EventType.COMPONENT_UNLOCKED,
                                user_id=lock.user_id,
                                timestamp=current_time,
                                project_id=room_id,
                                component_id=component_id,
                            ).dict()
                        })
                        
                        logger.info(f"Cleaned up expired lock for component {component_id} in room {room_id}")

                # Update database with expired locks
                with get_db_session() as db:
                    expired_db_locks = db.query(ComponentLock).filter(
                        ComponentLock.expires_at < current_time
                    ).all()
                    
                    for lock in expired_db_locks:
                        db.delete(lock)
                    
                    db.commit()

            except Exception as e:
                logger.error(f"Error in cleanup task: {e}")

    async def connect(
        self, 
        websocket: WebSocket, 
        room_id: str, 
        user_id: str, 
        user_name: str,
        user_email: str,
        user_color: str
    ) -> str:
        """Connect user to collaboration room"""
        
        await websocket.accept()
        connection_id = str(uuid4())
        
        # Initialize room if not exists
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
            self.room_locks[room_id] = {}

        # Store connection
        self.active_connections[room_id][user_id] = websocket
        
        # Store session info
        self.user_sessions[connection_id] = {
            "room_id": room_id,
            "user_id": user_id,
            "user_name": user_name,
            "user_email": user_email,
            "user_color": user_color,
            "websocket": websocket,
            "joined_at": datetime.utcnow(),
            "last_seen": datetime.utcnow(),
        }

        # Create database session
        with get_db_session() as db:
            # Ensure room exists
            room = db.query(CollaborationRoom).filter(CollaborationRoom.id == room_id).first()
            if not room:
                room = CollaborationRoom(
                    id=room_id,
                    project_id=room_id,  # Assuming room_id is project_id for now
                    name=f"Project {room_id}",
                )
                db.add(room)

            # Create or update user session
            session = db.query(UserSession).filter(
                and_(UserSession.room_id == room_id, UserSession.user_id == user_id)
            ).first()
            
            if session:
                session.last_seen = datetime.utcnow()
                session.status = UserStatus.ACTIVE
            else:
                session = UserSession(
                    id=connection_id,
                    room_id=room_id,
                    user_id=user_id,
                    user_name=user_name,
                    user_email=user_email,
                    user_color=user_color,
                )
                db.add(session)

            db.commit()

        # Notify room about new user
        user_model = CollaborationUserModel(
            id=user_id,
            name=user_name,
            email=user_email,
            color=user_color,
            status=UserStatus.ACTIVE,
            last_seen=datetime.utcnow(),
            permissions="editor",  # Default permission
        )

        await self._broadcast_to_room(room_id, {
            "type": "collaboration_event",
            "payload": CollaborationEventModel(
                id=str(uuid4()),
                type=EventType.USER_JOINED,
                user_id=user_id,
                timestamp=datetime.utcnow(),
                project_id=room_id,
                user=user_model,
            ).dict()
        }, exclude_user=user_id)

        # Send current room state to new user
        await self._send_room_state(websocket, room_id)

        logger.info(f"User {user_id} connected to room {room_id}")
        return connection_id

    async def disconnect(self, connection_id: str):
        """Disconnect user from collaboration room"""
        
        if connection_id not in self.user_sessions:
            return

        session_info = self.user_sessions.pop(connection_id)
        room_id = session_info["room_id"]
        user_id = session_info["user_id"]

        # Remove from active connections
        if room_id in self.active_connections and user_id in self.active_connections[room_id]:
            del self.active_connections[room_id][user_id]

        # Remove user's locks
        if room_id in self.room_locks:
            user_locks = [
                component_id for component_id, lock in self.room_locks[room_id].items()
                if lock.user_id == user_id
            ]
            
            for component_id in user_locks:
                del self.room_locks[room_id][component_id]
                
                # Notify room about unlocked components
                await self._broadcast_to_room(room_id, {
                    "type": "collaboration_event",
                    "payload": CollaborationEventModel(
                        id=str(uuid4()),
                        type=EventType.COMPONENT_UNLOCKED,
                        user_id=user_id,
                        timestamp=datetime.utcnow(),
                        project_id=room_id,
                        component_id=component_id,
                    ).dict()
                })

        # Update database
        with get_db_session() as db:
            # Update session
            session = db.query(UserSession).filter(UserSession.id == connection_id).first()
            if session:
                session.status = UserStatus.AWAY
                session.last_seen = datetime.utcnow()

            # Remove user's locks
            db.query(ComponentLock).filter(ComponentLock.user_id == user_id).delete()
            db.commit()

        # Notify room about user leaving
        await self._broadcast_to_room(room_id, {
            "type": "collaboration_event",
            "payload": CollaborationEventModel(
                id=str(uuid4()),
                type=EventType.USER_LEFT,
                user_id=user_id,
                timestamp=datetime.utcnow(),
                project_id=room_id,
            ).dict()
        })

        # Clean up empty room
        if room_id in self.active_connections and not self.active_connections[room_id]:
            del self.active_connections[room_id]
            if room_id in self.room_locks:
                del self.room_locks[room_id]

        logger.info(f"User {user_id} disconnected from room {room_id}")

    async def handle_message(self, connection_id: str, message: dict):
        """Handle incoming WebSocket message"""
        
        if connection_id not in self.user_sessions:
            return

        session_info = self.user_sessions[connection_id]
        room_id = session_info["room_id"]
        user_id = session_info["user_id"]
        websocket = session_info["websocket"]

        try:
            message_type = message.get("type")
            payload = message.get("payload", {})

            if message_type == "collaboration_event":
                await self._handle_collaboration_event(room_id, user_id, payload)
            
            elif message_type == "operation":
                await self._handle_operation(room_id, user_id, payload)
            
            elif message_type == "get_users":
                await self._send_user_list(websocket, room_id)
            
            elif message_type == "heartbeat":
                await self._handle_heartbeat(connection_id, websocket)
            
            else:
                logger.warning(f"Unknown message type: {message_type}")

        except Exception as e:
            logger.error(f"Error handling message from {user_id}: {e}")
            await self._send_error(websocket, "MESSAGE_HANDLING_ERROR", str(e))

    async def _handle_collaboration_event(self, room_id: str, user_id: str, event_data: dict):
        """Handle collaboration events"""
        
        event_type = event_data.get("type")
        
        if event_type == EventType.USER_CURSOR_UPDATE:
            await self._handle_cursor_update(room_id, user_id, event_data)
        
        elif event_type == EventType.COMPONENT_LOCKED:
            await self._handle_component_lock(room_id, user_id, event_data)
        
        elif event_type == EventType.COMPONENT_UNLOCKED:
            await self._handle_component_unlock(room_id, user_id, event_data)
        
        elif event_type == EventType.CHAT_MESSAGE:
            await self._handle_chat_message(room_id, user_id, event_data)
        
        else:
            # For other events, just broadcast to room
            await self._broadcast_to_room(room_id, {
                "type": "collaboration_event",
                "payload": event_data
            }, exclude_user=user_id)

    async def _handle_cursor_update(self, room_id: str, user_id: str, event_data: dict):
        """Handle cursor position updates"""
        
        cursor_data = event_data.get("cursor", {})
        
        # Update user session with cursor position
        with get_db_session() as db:
            session = db.query(UserSession).filter(
                and_(UserSession.room_id == room_id, UserSession.user_id == user_id)
            ).first()
            
            if session:
                session.cursor_position = cursor_data.get("position")
                session.cursor_visible = cursor_data.get("visible", True)
                session.last_seen = datetime.utcnow()
                db.commit()

        # Broadcast cursor update to other users
        await self._broadcast_to_room(room_id, {
            "type": "collaboration_event",
            "payload": event_data
        }, exclude_user=user_id)

    async def _handle_component_lock(self, room_id: str, user_id: str, event_data: dict):
        """Handle component locking"""
        
        lock_data = event_data.get("lock", {})
        component_id = lock_data.get("component_id")
        lock_type = lock_data.get("lock_type", LockType.EDITING)
        
        if not component_id:
            return

        # Check if component is already locked by another user
        if room_id in self.room_locks and component_id in self.room_locks[room_id]:
            existing_lock = self.room_locks[room_id][component_id]
            if existing_lock.user_id != user_id and not existing_lock.is_expired():
                # Component is locked by another user
                return

        # Create lock
        expires_at = datetime.utcnow() + timedelta(seconds=30)
        lock = ComponentLock(
            id=str(uuid4()),
            room_id=room_id,
            component_id=component_id,
            user_id=user_id,
            lock_type=lock_type,
            expires_at=expires_at,
        )

        # Store in memory
        if room_id not in self.room_locks:
            self.room_locks[room_id] = {}
        self.room_locks[room_id][component_id] = lock

        # Store in database
        with get_db_session() as db:
            # Remove any existing locks for this component
            db.query(ComponentLock).filter(ComponentLock.component_id == component_id).delete()
            
            # Add new lock
            db.add(lock)
            db.commit()

        # Broadcast lock event
        await self._broadcast_to_room(room_id, {
            "type": "collaboration_event",
            "payload": event_data
        }, exclude_user=user_id)

    async def _handle_component_unlock(self, room_id: str, user_id: str, event_data: dict):
        """Handle component unlocking"""
        
        component_id = event_data.get("component_id")
        if not component_id:
            return

        # Remove lock from memory
        if (room_id in self.room_locks and 
            component_id in self.room_locks[room_id] and
            self.room_locks[room_id][component_id].user_id == user_id):
            
            del self.room_locks[room_id][component_id]

        # Remove from database
        with get_db_session() as db:
            db.query(ComponentLock).filter(
                and_(
                    ComponentLock.component_id == component_id,
                    ComponentLock.user_id == user_id
                )
            ).delete()
            db.commit()

        # Broadcast unlock event
        await self._broadcast_to_room(room_id, {
            "type": "collaboration_event",
            "payload": event_data
        }, exclude_user=user_id)

    async def _handle_chat_message(self, room_id: str, user_id: str, event_data: dict):
        """Handle chat messages"""
        
        message_text = event_data.get("message", "")
        component_id = event_data.get("component_id")
        
        if not message_text.strip():
            return

        # Store message in database
        with get_db_session() as db:
            message = ChatMessage(
                id=str(uuid4()),
                room_id=room_id,
                user_id=user_id,
                message=message_text,
                component_id=component_id,
            )
            db.add(message)
            db.commit()

        # Broadcast to room
        await self._broadcast_to_room(room_id, {
            "type": "collaboration_event",
            "payload": event_data
        })

    async def _handle_operation(self, room_id: str, user_id: str, operation_data: dict):
        """Handle operational transform operations"""
        
        # TODO: Implement operational transform logic
        # For now, just broadcast the operation
        await self._broadcast_to_room(room_id, {
            "type": "operation_result",
            "payload": {
                "applied": True,
                "transformed_ops": [operation_data],
                "conflicts": []
            }
        }, exclude_user=user_id)

    async def _handle_heartbeat(self, connection_id: str, websocket: WebSocket):
        """Handle heartbeat messages"""
        
        if connection_id in self.user_sessions:
            self.user_sessions[connection_id]["last_seen"] = datetime.utcnow()
        
        await websocket.send_text(json.dumps({
            "type": "heartbeat",
            "payload": {"timestamp": datetime.utcnow().isoformat()},
            "timestamp": datetime.utcnow().isoformat(),
            "message_id": str(uuid4()),
        }))

    async def _send_room_state(self, websocket: WebSocket, room_id: str):
        """Send current room state to user"""
        
        with get_db_session() as db:
            # Get active users
            sessions = db.query(UserSession).filter(
                and_(
                    UserSession.room_id == room_id,
                    UserSession.status == UserStatus.ACTIVE
                )
            ).all()

            users = [
                CollaborationUserModel(
                    id=session.user_id,
                    name=session.user_name,
                    email=session.user_email,
                    color=session.user_color,
                    status=UserStatus(session.status),
                    last_seen=session.last_seen,
                    permissions=session.permissions,
                ).dict() for session in sessions
            ]

        await websocket.send_text(json.dumps({
            "type": "user_list",
            "payload": users,
            "timestamp": datetime.utcnow().isoformat(),
            "message_id": str(uuid4()),
        }))

    async def _send_user_list(self, websocket: WebSocket, room_id: str):
        """Send user list to requesting user"""
        await self._send_room_state(websocket, room_id)

    async def _send_error(self, websocket: WebSocket, error_code: str, error_message: str):
        """Send error message to user"""
        
        await websocket.send_text(json.dumps({
            "type": "error",
            "payload": {
                "type": "connection",
                "message": error_message,
                "code": error_code,
                "timestamp": datetime.utcnow().isoformat(),
                "recoverable": True,
            },
            "timestamp": datetime.utcnow().isoformat(),
            "message_id": str(uuid4()),
        }))

    async def _broadcast_to_room(self, room_id: str, message: dict, exclude_user: Optional[str] = None):
        """Broadcast message to all users in room"""
        
        if room_id not in self.active_connections:
            return

        message_json = json.dumps({
            **message,
            "timestamp": datetime.utcnow().isoformat(),
            "message_id": str(uuid4()),
        })

        disconnected_users = []
        for user_id, websocket in self.active_connections[room_id].items():
            if exclude_user and user_id == exclude_user:
                continue
                
            try:
                await websocket.send_text(message_json)
            except Exception as e:
                logger.error(f"Failed to send message to user {user_id}: {e}")
                disconnected_users.append(user_id)

        # Clean up disconnected users
        for user_id in disconnected_users:
            if user_id in self.active_connections[room_id]:
                del self.active_connections[room_id][user_id]

    def get_room_users(self, room_id: str) -> List[str]:
        """Get list of active users in room"""
        if room_id in self.active_connections:
            return list(self.active_connections[room_id].keys())
        return []

    def get_user_count(self, room_id: str) -> int:
        """Get number of active users in room"""
        return len(self.get_room_users(room_id))

    def is_component_locked(self, room_id: str, component_id: str, user_id: str) -> bool:
        """Check if component is locked by another user"""
        if room_id not in self.room_locks or component_id not in self.room_locks[room_id]:
            return False
            
        lock = self.room_locks[room_id][component_id]
        return lock.user_id != user_id and not lock.is_expired()


# Global connection manager instance
connection_manager = ConnectionManager()