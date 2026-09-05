"""Database engine, session factory, and Base declarative model."""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.config import settings
from app.base import Base

DB_URL = settings.DATABASE_URL
if "psycopg2" in DB_URL and "asyncpg" not in DB_URL:
    DB_URL = DB_URL.replace("postgresql+psycopg2", "postgresql+asyncpg")

if DB_URL.startswith("sqlite"):
    engine = create_async_engine(DB_URL, echo=False, future=True, poolclass=NullPool)
else:
    engine = create_async_engine(DB_URL, echo=False, future=True, pool_pre_ping=True, pool_size=10, max_overflow=20)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    """FastAPI dependency that yields a fresh async session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
