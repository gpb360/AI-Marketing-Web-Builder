import asyncio
import sys
import os

# Add the current directory to the path
sys.path.append('.')

from app.db.session import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select

async def check_user():
    async with AsyncSessionLocal() as db:
        # Try to find the test user
        result = await db.execute(select(User).where(User.email == 'test2@example.com'))
        user = result.scalar_one_or_none()
        print(f'User found: {user is not None}')
        if user:
            print(f'User email: {user.email}')
            print(f'User ID: {user.id}')
            print(f'Has password hash: {bool(user.hashed_password)}')
        else:
            print('No test user found with email test2@example.com')

if __name__ == "__main__":
    asyncio.run(check_user())