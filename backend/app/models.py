"""SQLAlchemy models for FixMyCity."""

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from datetime import datetime
import uuid

from app.base import Base


class User(Base):
    """User model."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    role: Mapped[str] = mapped_column(String(16), nullable=False, server_default="CITIZEN")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    reported_incidents: Mapped[List["Incident"]] = relationship(
        "Incident", back_populates="reporter", foreign_keys="Incident.reporter_id"
    )
    images: Mapped[List["IncidentImage"]] = relationship("IncidentImage", back_populates="uploaded_by_user")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user")


class Department(Base):
    """Department model."""
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    incidents: Mapped[List["Incident"]] = relationship(
        "Incident", back_populates="assigned_dept_obj", foreign_keys="Incident.assigned_dept_id"
    )


class Incident(Base):
    """Incident model - core table for reported issues."""
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    reporter_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    latitude: Mapped[float] = mapped_column(nullable=False)
    longitude: Mapped[float] = mapped_column(nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, server_default="SUBMITTED")
    severity: Mapped[str] = mapped_column(String(16), nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False)
    risk_factors: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    ai_confidence: Mapped[Optional[float]] = mapped_column(nullable=True)
    ai_raw: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    assigned_dept_id: Mapped[Optional[int]] = mapped_column(ForeignKey("departments.id"), nullable=True)
    duplicate_group_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_raw: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    reporter: Mapped["User"] = relationship("User", back_populates="reported_incidents", foreign_keys=[reporter_id])
    assigned_dept_obj: Mapped[Optional["Department"]] = relationship(
        "Department", back_populates="incidents", foreign_keys=[assigned_dept_id]
    )
    images: Mapped[List["IncidentImage"]] = relationship("IncidentImage", back_populates="incident", cascade="all, delete-orphan")
    status_history: Mapped[List["IncidentStatusHistory"]] = relationship(
        "IncidentStatusHistory", back_populates="incident", cascade="all, delete-orphan"
    )
    repair_evidence: Mapped[List["RepairEvidence"]] = relationship(
        "RepairEvidence", back_populates="incident", cascade="all, delete-orphan"
    )
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification", back_populates="incident", cascade="all, delete-orphan"
    )
    duplicate_links: Mapped[List["IncidentDuplicate"]] = relationship(
        "IncidentDuplicate",
        foreign_keys="[IncidentDuplicate.incident_a_id]",
        back_populates="incident_a",
        cascade="all, delete-orphan",
    )


class IncidentImage(Base):
    __tablename__ = "incident_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    kind: Mapped[str] = mapped_column(String(16), nullable=False)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    storage_key: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    size_bytes: Mapped[Optional[int]] = mapped_column(nullable=True)
    uploaded_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    incident: Mapped["Incident"] = relationship("Incident")
    uploaded_by_user: Mapped["User"] = relationship("User")


class IncidentDuplicate(Base):
    __tablename__ = "incident_duplicates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    incident_a_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"), nullable=False)
    incident_b_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"), nullable=False)
    similarity: Mapped[float] = mapped_column(nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    incident_a: Mapped["Incident"] = relationship("Incident", foreign_keys=[incident_a_id], back_populates="duplicate_links")
    incident_b: Mapped["Incident"] = relationship("Incident", foreign_keys=[incident_b_id])


class IncidentStatusHistory(Base):
    __tablename__ = "incident_status_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    from_status: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    to_status: Mapped[str] = mapped_column(String(32), nullable=False)
    changed_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    incident: Mapped["Incident"] = relationship("Incident", back_populates="status_history")
    changed_by_user: Mapped["User"] = relationship("User")


class RepairEvidence(Base):
    __tablename__ = "repair_evidence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    after_image_id: Mapped[Optional[int]] = mapped_column(ForeignKey("incident_images.id"), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    submitted_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    incident: Mapped["Incident"] = relationship("Incident", back_populates="repair_evidence")
    after_image: Mapped[Optional["IncidentImage"]] = relationship("IncidentImage")
    submitted_by_user: Mapped["User"] = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    incident_id: Mapped[Optional[int]] = mapped_column(ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True)
    channel: Mapped[str] = mapped_column(String(16), nullable=False)
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    payload: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False, server_default="PENDING")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="notifications")
    incident: Mapped[Optional["Incident"]] = relationship("Incident", back_populates="notifications")


# Indexes for performance
Index("idx_incidents_status", Incident.status)
Index("idx_incidents_category", Incident.category)
Index("idx_incidents_location", Incident.latitude, Incident.longitude)
Index("idx_incidents_risk_score", Incident.risk_score.desc())
Index("idx_incidents_created_at", Incident.created_at.desc())
Index("idx_incidents_duplicate_group", Incident.duplicate_group_id)
