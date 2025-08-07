"""
Database configuration and session management for AI Web Builder Platform.
"""

import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

from app.core.config import settings

# Database URLs
database_url = getattr(settings, 'DATABASE_URL', 'sqlite:///./ai_web_builder.db')
async_database_url = getattr(settings, 'ASYNC_DATABASE_URL', 'sqlite+aiosqlite:///./ai_web_builder.db')

# Create engines
engine = create_engine(database_url, echo=False)
async_engine = create_async_engine(async_database_url, echo=False)

# Session makers
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncSessionLocal = async_sessionmaker(
    async_engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# Dependency functions
def get_db():
    """Get synchronous database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Get asynchronous database session.""" 
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Initialize database
async def init_db():
    """Initialize database with tables."""
    from app.models.base import Base
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def close_db():
    """Close database connections."""
    await async_engine.dispose()