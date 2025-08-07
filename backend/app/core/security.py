"""
Security utilities for authentication and authorization.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.models.user import User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify a JWT token and return the payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.InvalidTokenError:
        return None


# Temporary user models for migration
class CurrentUser:
    def __init__(self, id: int, email: str, is_active: bool = True):
        self.id = id
        self.email = email
        self.is_active = is_active


# Mock functions for basic functionality
def get_current_user(token: str) -> Optional[CurrentUser]:
    """Get current user from token (mock version)."""
    payload = verify_token(token)
    if payload and "sub" in payload:
        # For migration/demo, return a mock user
        return CurrentUser(id=1, email="demo@example.com")
    return None


def get_current_active_user(token: str) -> Optional[CurrentUser]:
    """Get current active user (mock version)."""
    user = get_current_user(token)
    return user if user and user.is_active else None


def require_admin(token: str) -> Optional[CurrentUser]:
    """Require admin role (mock version)."""
    user = get_current_active_user(token)
    return user