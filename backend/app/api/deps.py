"""
API dependencies for FastAPI endpoints.
"""

from typing import AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user, get_current_active_user, require_admin
from app.models.user import User

# Re-export common dependencies
__all__ = [
    "get_db",
    "get_current_user", 
    "get_current_active_user",
    "require_admin"
]