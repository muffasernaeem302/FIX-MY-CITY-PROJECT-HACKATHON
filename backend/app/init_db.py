"""Initialize the database - create all tables, seed departments and default user."""

import asyncio
from sqlalchemy import event, JSON, Text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

from app.database import engine, AsyncSessionLocal, Base
from app.models import Department, User
from app.services.auth import hash_password


# Patch JSONB -> JSON for SQLite compatibility
@event.listens_for(Base.metadata, "before_create")
def _patch_jsonb(target, connection, **kw):
    from sqlalchemy.dialects.sqlite import base as sqlite_base
    from app.models import Base as AppBase
    for table in AppBase.metadata.tables.values():
        for col in table.columns:
            if hasattr(col.type, "__class__") and col.type.__class__.__name__ == "JSONB":
                col.type = JSON()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        # Seed default departments
        from sqlalchemy import select
        result = await db.execute(select(Department).limit(1))
        existing = result.scalar_one_or_none()
        if not existing:
            depts = [{"code": "ROADS", "name": "Road Maintenance"}, {"code": "LIGHTING", "name": "Street Lighting"}, {"code": "WASTE", "name": "Waste Management"}, {"code": "WATER", "name": "Water & Sanitation"}]
            for d in depts:
                db.add(Department(**d))
            # Seed default user
            db.add(User(email="demo@fixmycity.local", password_hash=hash_password("demopassword"), full_name="Demo User", role="ADMIN"))
            await db.commit()
            print("Seeded departments and demo user (demo@fixmycity.local / demopassword)")
        else:
            print("Database already initialized.")


if __name__ == "__main__":
    asyncio.run(init_db())
