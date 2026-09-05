"""Shared SQLAlchemy Base for all models."""
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import event, JSON


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


@event.listens_for(Base.metadata, "before_create", propagate=True)
def patch_jsonb(target, connection, **kw):
    """Replace JSONB with JSON for SQLite compatibility."""
    for table in target.tables.values():
        for col in table.columns:
            if col.type.__class__.__name__ == "JSONB":
                col.type = JSON()
