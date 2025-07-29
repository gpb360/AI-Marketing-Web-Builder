"""
User service for user management and authentication.
"""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.services.base_service import BaseService
from app.core.security import get_password_hash, verify_password


class UserService(BaseService[User, UserCreate, UserUpdate]):
    """User service for user management."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)
    
    async def create(self, obj_in: UserCreate, **kwargs) -> User:
        """Create a new user with hashed password."""
        create_data = obj_in.model_dump()
        # Hash password
        create_data["hashed_password"] = get_password_hash(create_data.pop("password"))
        create_data.update(kwargs)
        
        db_obj = self.model(**create_data)
        self.db.add(db_obj)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email address."""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    async def authenticate(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = await self.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    async def is_active(self, user: User) -> bool:
        """Check if user is active."""
        return user.is_active
    
    async def is_superuser(self, user: User) -> bool:
        """Check if user is superuser."""
        return user.is_superuser
    
    async def update_password(self, user_id: int, new_password: str) -> Optional[User]:
        """Update user password."""
        user = await self.get_by_id(user_id)
        if not user:
            return None
        
        user.hashed_password = get_password_hash(new_password)
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def activate_user(self, user_id: int) -> Optional[User]:
        """Activate user account."""
        user = await self.get_by_id(user_id)
        if not user:
            return None
        
        user.is_active = True
        user.is_verified = True
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def deactivate_user(self, user_id: int) -> Optional[User]:
        """Deactivate user account."""
        user = await self.get_by_id(user_id)
        if not user:
            return None
        
        user.is_active = False
        await self.db.commit()
        await self.db.refresh(user)
        return user