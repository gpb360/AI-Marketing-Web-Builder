#!/usr/bin/env python3
"""Script to check if a test user exists in the database"""

import asyncio
from app.db.session import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select

async def check_user():
    """Check if test user exists"""
    async with AsyncSessionLocal() as db:
        # Query for the user
        stmt = select(User).where(User.email == "test@example.com")
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user:
            print(f"✅ User found: {user.email}")
            print(f"User ID: {user.id}")
            print(f"Hashed password: {user.hashed_password}")
            print(f"First name: {user.first_name}")
            print(f"Last name: {user.last_name}")
        else:
            print("❌ User not found")

if __name__ == "__main__":
    asyncio.run(check_user())