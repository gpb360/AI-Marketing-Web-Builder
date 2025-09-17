#!/usr/bin/env python3
"""Script to create a new test user"""

import asyncio
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash

from sqlalchemy import text

async def create_user():
    """Create a new test user"""
    async with AsyncSessionLocal() as db:
        # Check if user already exists
        result = await db.execute(text('SELECT * FROM users WHERE email = :email'), {'email': 'test2@example.com'})
        existing = result.fetchone()
        
        if not existing:
            # Create new user
            user = User(
                email='test2@example.com',
                hashed_password=get_password_hash('Password123'),
                first_name='Test',
                last_name='User'
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f'✅ Created user: {user.email}')
        else:
            print('User already exists')

if __name__ == "__main__":
    asyncio.run(create_user())