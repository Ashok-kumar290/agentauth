"""
Database connection and session management

OPTIMIZED for low-latency authorization:
- Connection pooling (5-20 connections)
- Pool pre-ping for connection health
- Fast timeout settings
"""
import ssl
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator

from app.config import get_settings

settings = get_settings()

# Create SSL context for Neon/Railway PostgreSQL
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Process DATABASE_URL for asyncpg compatibility
db_url = settings.database_url

# Remove query params (we'll handle SSL via connect_args)
db_url = db_url.split("?")[0]

# Convert various URL formats to postgresql+asyncpg://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif not db_url.startswith("postgresql+asyncpg://"):
    # If it's already asyncpg format, use as-is
    pass

print(f"Database URL (masked): {db_url[:30]}...{db_url[-20:]}")

# Create async engine with OPTIMIZED connection pooling
engine = create_async_engine(
    db_url,
    echo=settings.debug,
    future=True,
    connect_args={"ssl": ssl_context},
    # Connection pool settings for low latency
    pool_size=5,           # Minimum connections to keep ready
    max_overflow=15,       # Allow up to 20 total connections
    pool_pre_ping=False,   # Disabled - causes issues with Neon pooler
    pool_recycle=300,      # Recycle connections every 5 mins
    pool_timeout=10,       # Wait max 10s for connection
)

# Create async session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all models."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides a database session."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
