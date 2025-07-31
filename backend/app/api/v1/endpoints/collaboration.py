"""
FastAPI WebSocket endpoints for real-time collaboration
"""

import json
import logging
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..services.collaboration_manager import connection_manager
from ..models.collaboration import (
    CollaborationRoom,
    RoomCreateModel,
    RoomJoinModel,
    CollaborationUserModel,
)

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()


def generate_user_color(user_id: str) -> str:
    """Generate a consistent color for a user based on their ID"""
    colors = [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
        "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
    ]
    hash_value = sum(ord(c) for c in user_id)
    return colors[hash_value % len(colors)]


@router.websocket("/ws/collaboration")
async def websocket_collaboration_endpoint(
    websocket: WebSocket,
    userId: str = Query(..., alias="userId"),
    projectId: str = Query(..., alias="projectId"),
    token: str = Query(..., alias="token"),
):
    """
    WebSocket endpoint for real-time collaboration
    
    Query parameters:
    - userId: User identifier
    - projectId: Project/room identifier  
    - token: Authentication token
    """
    
    connection_id = None
    
    try:
        # TODO: Validate auth token
        # For now, we'll extract user info from token or use defaults
        user_name = f"User {userId}"  # TODO: Get from token/database
        user_email = f"{userId}@example.com"  # TODO: Get from token/database
        user_color = generate_user_color(userId)
        
        # Connect to collaboration room
        connection_id = await connection_manager.connect(
            websocket=websocket,
            room_id=projectId,
            user_id=userId,
            user_name=user_name,
            user_email=user_email,
            user_color=user_color,
        )
        
        # Handle incoming messages
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle the message
                await connection_manager.handle_message(connection_id, message)
                
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received from user {userId}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "payload": {
                        "type": "validation",
                        "message": "Invalid JSON format",
                        "code": "INVALID_JSON",
                        "timestamp": None,
                        "recoverable": True,
                    }
                }))
                
    except WebSocketDisconnect:
        logger.info(f"User {userId} disconnected from project {projectId}")
        
    except Exception as e:
        logger.error(f"WebSocket error for user {userId}: {e}")
        
    finally:
        # Clean up connection
        if connection_id:
            await connection_manager.disconnect(connection_id)


@router.post("/api/collaboration/rooms", response_model=dict)
async def create_collaboration_room(
    room_data: RoomCreateModel,
    db: Session = Depends(get_db),
):
    """Create a new collaboration room"""
    
    try:
        # Check if room already exists
        existing_room = db.query(CollaborationRoom).filter(
            CollaborationRoom.project_id == room_data.project_id
        ).first()
        
        if existing_room:
            return {
                "id": existing_room.id,
                "project_id": existing_room.project_id,
                "name": existing_room.name,
                "max_users": existing_room.max_users,
                "active_users": connection_manager.get_user_count(existing_room.id),
                "created_at": existing_room.created_at.isoformat(),
            }
        
        # Create new room
        room = CollaborationRoom(
            id=room_data.project_id,  # Use project_id as room_id for simplicity
            project_id=room_data.project_id,
            name=room_data.name,
            max_users=room_data.max_users,
        )
        
        db.add(room)
        db.commit()
        db.refresh(room)
        
        return {
            "id": room.id,
            "project_id": room.project_id,
            "name": room.name,
            "max_users": room.max_users,
            "active_users": 0,
            "created_at": room.created_at.isoformat(),
        }
        
    except Exception as e:
        logger.error(f"Error creating collaboration room: {e}")
        raise HTTPException(status_code=500, detail="Failed to create collaboration room")


@router.get("/api/collaboration/rooms/{room_id}", response_model=dict)
async def get_collaboration_room(
    room_id: str,
    db: Session = Depends(get_db),
):
    """Get collaboration room information"""
    
    try:
        room = db.query(CollaborationRoom).filter(CollaborationRoom.id == room_id).first()
        
        if not room:
            raise HTTPException(status_code=404, detail="Collaboration room not found")
        
        active_users = connection_manager.get_room_users(room_id)
        
        return {
            "id": room.id,
            "project_id": room.project_id,
            "name": room.name,
            "max_users": room.max_users,
            "active_users": len(active_users),
            "active_user_ids": active_users,
            "created_at": room.created_at.isoformat(),
            "updated_at": room.updated_at.isoformat(),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting collaboration room {room_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get collaboration room")


@router.get("/api/collaboration/rooms/{room_id}/users", response_model=list)
async def get_room_users(
    room_id: str,
    db: Session = Depends(get_db),
):
    """Get list of active users in collaboration room"""
    
    try:
        # Check if room exists
        room = db.query(CollaborationRoom).filter(CollaborationRoom.id == room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Collaboration room not found")
        
        # Get active user sessions from database
        from ..models.collaboration import UserSession, UserStatus
        
        sessions = db.query(UserSession).filter(
            UserSession.room_id == room_id,
            UserSession.status == UserStatus.ACTIVE
        ).all()
        
        users = []
        for session in sessions:
            users.append({
                "id": session.user_id,
                "name": session.user_name,
                "email": session.user_email,
                "color": session.user_color,
                "status": session.status,
                "permissions": session.permissions,
                "last_seen": session.last_seen.isoformat(),
                "joined_at": session.joined_at.isoformat(),
                "cursor_visible": session.cursor_visible,
                "cursor_position": session.cursor_position,
            })
        
        return users
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting users for room {room_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get room users")


@router.get("/api/collaboration/rooms/{room_id}/locks", response_model=list)
async def get_room_locks(
    room_id: str,
    db: Session = Depends(get_db),
):
    """Get list of active component locks in room"""
    
    try:
        from ..models.collaboration import ComponentLock
        from datetime import datetime
        
        # Get non-expired locks from database
        locks = db.query(ComponentLock).filter(
            ComponentLock.room_id == room_id,
            ComponentLock.expires_at > datetime.utcnow()
        ).all()
        
        lock_list = []
        for lock in locks:
            lock_list.append({
                "id": lock.id,
                "component_id": lock.component_id,
                "user_id": lock.user_id,
                "lock_type": lock.lock_type,
                "created_at": lock.created_at.isoformat(),
                "expires_at": lock.expires_at.isoformat(),
            })
        
        return lock_list
        
    except Exception as e:
        logger.error(f"Error getting locks for room {room_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get room locks")


@router.get("/api/collaboration/rooms/{room_id}/messages", response_model=list)
async def get_room_messages(
    room_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Get chat messages for collaboration room"""
    
    try:
        from ..models.collaboration import ChatMessage, UserSession
        
        # Check if room exists
        room = db.query(CollaborationRoom).filter(CollaborationRoom.id == room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Collaboration room not found")
        
        # Get messages with user info
        messages = db.query(ChatMessage).filter(
            ChatMessage.room_id == room_id
        ).order_by(
            ChatMessage.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        # Get user info for message authors
        user_ids = list(set(msg.user_id for msg in messages))
        user_sessions = db.query(UserSession).filter(
            UserSession.user_id.in_(user_ids),
            UserSession.room_id == room_id
        ).all()
        
        user_map = {session.user_id: session for session in user_sessions}
        
        message_list = []
        for message in reversed(messages):  # Reverse to get chronological order
            user_session = user_map.get(message.user_id)
            user_info = {
                "id": message.user_id,
                "name": user_session.user_name if user_session else f"User {message.user_id}",
                "email": user_session.user_email if user_session else "",
                "color": user_session.user_color if user_session else "#666666",
                "status": "active",
                "last_seen": user_session.last_seen.isoformat() if user_session else None,
                "permissions": user_session.permissions if user_session else "editor",
            }
            
            message_list.append({
                "id": message.id,
                "user_id": message.user_id,
                "user": user_info,
                "message": message.message,
                "timestamp": message.created_at.isoformat(),
                "message_type": message.message_type,
                "component_id": message.component_id,
            })
        
        return message_list
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting messages for room {room_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get room messages")


@router.delete("/api/collaboration/rooms/{room_id}")
async def delete_collaboration_room(
    room_id: str,
    db: Session = Depends(get_db),
):
    """Delete collaboration room and disconnect all users"""
    
    try:
        # Check if room exists
        room = db.query(CollaborationRoom).filter(CollaborationRoom.id == room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Collaboration room not found")
        
        # Disconnect all users (this will clean up locks and sessions)
        active_users = connection_manager.get_room_users(room_id)
        for user_id in active_users:
            # Find connection_id for user (this is a simplification)
            # In a real implementation, you'd maintain a reverse mapping
            pass
        
        # Delete room from database (cascade will delete related records)
        db.delete(room)
        db.commit()
        
        return {"message": "Collaboration room deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting collaboration room {room_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete collaboration room")


@router.get("/api/collaboration/health")
async def collaboration_health():
    """Health check endpoint for collaboration service"""
    
    try:
        # Get some basic stats
        total_rooms = len(connection_manager.active_connections)
        total_users = sum(len(users) for users in connection_manager.active_connections.values())
        total_locks = sum(len(locks) for locks in connection_manager.room_locks.values())
        
        return {
            "status": "healthy",
            "timestamp": None,
            "stats": {
                "active_rooms": total_rooms,
                "active_users": total_users,
                "active_locks": total_locks,
            }
        }
        
    except Exception as e:
        logger.error(f"Error in collaboration health check: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": None,
        }