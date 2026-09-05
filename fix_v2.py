content = '''"""Database engine, session factory, and Base declarative model."""

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
'''
with open(r'E:\FIXMYCITY\backend\app\database.py', 'w') as f:
    f.write(content)
print('database.py OK')

# Fix models.py
with open(r'E:\FIXMYCITY\backend\app\models.py') as f:
    m = f.read()
m = m.replace('\n\nclass Base(DeclarativeBase):\n    """Base class for all models."""\n    pass\n', '\nfrom app.base import Base\n')
m = m.replace('from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship', 'from sqlalchemy.orm import Mapped, mapped_column, relationship')
with open(r'E:\FIXMYCITY\backend\app\models.py', 'w') as f:
    f.write(m)
print('models.py OK')

# Fix init_db.py
with open(r'E:\FIXMYCITY\backend\app\init_db.py') as f:
    i = f.read()
# Strip the leftover Python file remnants
lines = i.split('\n')
clean = []
skip_until = False
for line in lines:
    if 'models_content' in line or 'init_content' in line or 'import sys' in line:
        skip_until = True
    if not skip_until:
        clean.append(line)
i = '\n'.join(clean)
# Also fix the broken Department check
i = i.replace('result = await db.execute(Department.__table__.select())\n        existing = result.first()', 'from sqlalchemy import select\n        result = await db.execute(select(Department).limit(1))\n        existing = result.scalar_one_or_none()')
with open(r'E:\FIXMYCITY\backend\app\init_db.py', 'w') as f:
    f.write(i)
print('init_db.py OK')
