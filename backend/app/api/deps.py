"""
API dependencies for FastAPI endpoints.
"""

from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.core.security import get_current_user, get_current_active_user, require_admin, verify_token
from app.models.user import User

async def get_current_user_from_token(token: str, db: AsyncSession) -> Optional[User]:
    """
    Get current user from JWT token for WebSocket authentication.
    This is a helper function for WebSocket endpoints that can't use FastAPI dependencies.
    """
    try:
        payload = verify_token(token)
        if not payload:
            return None
        
        user_email = payload.get("sub")
        if not user_email:
            return None
        
        # Query user from database
        result = await db.execute(select(User).where(User.email == user_email))
        user = result.scalar_one_or_none()
        
        if user and user.is_active:
            return user
        
        return None
        
    except Exception:
        return None


# Re-export common dependencies
__all__ = [
    "get_db",
    "get_current_user", 
    "get_current_active_user",
    "get_current_user_from_token",
    "require_admin"
]