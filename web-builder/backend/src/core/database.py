"""Database configuration and connection management."""

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import settings

# Create async engine for FastAPI
async_engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Create sync engine for migrations and Celery
sync_engine = create_engine(
    settings.database_url_sync,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Session factories
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

SessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False,
)

# Base class for SQLAlchemy models
Base = declarative_base()


async def get_async_session() -> AsyncSession:
    """Dependency for getting async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_sync_session():
    """Get synchronous database session for Celery tasks."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


async def init_database():
    """Initialize database with all tables."""
    try:
        async with async_engine.begin() as conn:
            # Import all models to register them
            try:
                from models import base, users, sites, crm, workflows
                print("Models imported successfully")
            except ImportError as e:
                print(f"Could not import models: {e}")
                return
            
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
            print("Database tables created successfully")
    except Exception as e:
        print(f"Database initialization failed: {e}")


async def close_database_connections():
    """Close database connections."""
    try:
        if async_engine:
            await async_engine.dispose()
            print("Database engine disposed")
    except Exception as e:
        print(f"Error closing connections: {e}")
    print("Database connections cleanup completed")