import asyncio
import sys
import os

# Add the current directory to the path
sys.path.append('.')

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import verify_password
from sqlalchemy import select

async def test_password_verification():
    async with AsyncSessionLocal() as db:
        # Try to find the new test user
        result = await db.execute(select(User).where(User.email == 'test3@example.com'))
        user = result.scalar_one_or_none()
        
        if user:
            print(f'User email: {user.email}')
            print(f'Has password hash: {bool(user.hashed_password)}')
            
            # Test password verification
            password = "Password123!"
            is_valid = verify_password(password, user.hashed_password)
            print(f'Password verification result: {is_valid}')
            
            # Test with wrong password
            is_valid_wrong = verify_password("WrongPassword", user.hashed_password)
            print(f'Wrong password verification result: {is_valid_wrong}')
        else:
            print('No test user found with email test3@example.com')

if __name__ == "__main__":
    asyncio.run(test_password_verification())