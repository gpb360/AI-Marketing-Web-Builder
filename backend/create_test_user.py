#!/usr/bin/env python3
"""Script to create a test user for authentication testing"""

import asyncio
import sys
import os

# Add the current directory to the path
sys.path.append('.')

from sqlalchemy import text
from app.models.user import User
from app.db.session import AsyncSessionLocal
from app.core.security import get_password_hash

async def create_test_user():
    """Create a test user for authentication testing"""
    async with AsyncSessionLocal() as db:
        try:
            # Check if user already exists
            existing_user = await db.execute(
                text("SELECT * FROM users WHERE email = :email"),
                {"email": "test3@example.com"}
            )
            user_row = existing_user.fetchone()
            
            if user_row:
                print(f"User already exists: test3@example.com")
                # Update password to ensure it's properly hashed
                hashed_password = get_password_hash("Password123!")
                await db.execute(
                    text("UPDATE users SET hashed_password = :password WHERE email = :email"),
                    {"password": hashed_password, "email": "test3@example.com"}
                )
                await db.commit()
                print(f"Updated password for user: test3@example.com")
                return
            
            # Create the user
            hashed_password = get_password_hash("Password123!")
            new_user = User(
                email="test3@example.com",
                hashed_password=hashed_password,
                first_name="Test",
                last_name="User3",
                is_active=True,
                is_superuser=False,
                is_verified=True
            )
            
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
            
            print(f"✅ Successfully created test user: {new_user.email}")
            print(f"User ID: {new_user.id}")
            return new_user
        except Exception as e:
            print(f"❌ Error creating test user: {e}")
            import traceback
            traceback.print_exc()
            return None

if __name__ == "__main__":
    print("Creating test user...")
    asyncio.run(create_test_user())