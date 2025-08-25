#!/usr/bin/env python3
"""Script to create a test user for authentication testing"""

import asyncio
import sys
import os

# Add the current directory to the path
sys.path.append('.')

from app.schemas.user import UserCreate
from app.services.user_service import UserService
from app.db.session import AsyncSessionLocal
from app.core.security import get_password_hash

async def create_test_user():
    """Create a test user for authentication testing"""
    async with AsyncSessionLocal() as db:
        user_service = UserService(db)
        
        # Test user data
        user_data = UserCreate(
            email="test3@example.com",
            password="Password123!",
            first_name="Test",
            last_name="User3"
        )
        
        try:
            # Check if user already exists
            existing_user = await user_service.get_by_email("test3@example.com")
            if existing_user:
                print(f"User already exists: {existing_user.email}")
                # Update password to ensure it's properly hashed
                updated_user = await user_service.update_password(existing_user.id, "Password123!")
                print(f"Updated password for user: {updated_user.email}")
                return updated_user
            
            # Create the user
            user = await user_service.create(user_data)
            print(f"✅ Successfully created test user: {user.email}")
            print(f"User ID: {user.id}")
            return user
        except Exception as e:
            print(f"❌ Error creating test user: {e}")
            import traceback
            traceback.print_exc()
            return None

if __name__ == "__main__":
    print("Creating test user...")
    asyncio.run(create_test_user())