"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
import uuid


# --- User schemas ---
class UserBase(BaseModel):
    email: str = Field(..., max_length=255)
    full_name: Optional[str] = Field(None, max_length=120)
    phone: Optional[str] = Field(None, max_length=20)
    role: Optional[str] = Field("CITIZEN")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Department schemas ---
class DepartmentBase(BaseModel):
    code: str = Field(..., max_length=32)
    name: str = Field(..., max_length=120)
    contact_email: Optional[str] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Incident schemas ---
class IncidentBase(BaseModel):
    category: str = Field(..., max_length=32)
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    latitude: float
    longitude: float
    address: Optional[str] = Field(None, max_length=500)


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    category: Optional[str] = Field(None, max_length=32)
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = Field(None, max_length=500)
    severity: Optional[str] = Field(None, max_length=16)
    assigned_dept_id: Optional[int] = None
    is_duplicate: Optional[bool] = None


class IncidentResponse(BaseModel):
    id: int
    reporter_id: int
    category: str
    title: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    address: Optional[str] = None
    status: str
    severity: str
    risk_score: int
    risk_factors: Optional[dict] = None
    ai_confidence: Optional[float] = None
    ai_raw: Optional[dict] = None
    assigned_dept_id: Optional[int] = None
    duplicate_group_id: Optional[uuid.UUID] = None
    is_duplicate: bool
    verified: bool
    verification_raw: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IncidentDetailResponse(IncidentResponse):
    images: List[Any] = []
    status_history: List[Any] = []
    duplicate_links: List[Any] = []

    model_config = ConfigDict(from_attributes=True)


# --- Status transition schema ---
class StatusUpdate(BaseModel):
    status: str = Field(..., max_length=32)
    note: Optional[str] = None


class StatusTransitionResponse(BaseModel):
    incident_id: int
    from_status: str
    to_status: str
    changed_by: int
    note: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- AI classification schemas ---
class AIClassifyRequest(BaseModel):
    image_url: Optional[str] = None
    description: Optional[str] = None
    category_hint: Optional[str] = None


class AIClassifyResponse(BaseModel):
    category: str
    confidence: float = Field(..., ge=0, le=1)
    severity_hint: str = Field(..., max_length=16)
    description: Optional[str] = None
    source: str = "dev_fallback"


# --- Risk engine schemas ---
class RiskScoreRequest(BaseModel):
    category: str
    severity: str
    description: Optional[str] = None
    location: Optional[str] = None
    is_duplicate: bool = False
    duplicate_count: int = 0


class RiskScoreResponse(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    severity: str = Field(..., max_length=16)
    factors: dict = {}
    priority: str = Field(..., max_length=10)
    department_code: str
    department_name: str


# --- Duplicate check schemas ---
class DuplicateCheckRequest(BaseModel):
    latitude: float
    longitude: float
    category: str
    title: Optional[str] = None
    description: Optional[str] = None
    similarity_threshold: float = 0.65


class DuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    duplicate_group_id: Optional[uuid.UUID] = None
    probability: float = Field(..., ge=0, le=1)
    matched_count: int = 0
    matched_ids: List[int] = []


# --- Dashboard stats schemas ---
class DashboardStatsResponse(BaseModel):
    total_incidents: int
    critical_count: int
    high_risk_count: int
    in_progress_count: int
    resolved_count: int
    average_risk_score: float
    category_breakdown: dict = {}


class PriorityQueueResponse(BaseModel):
    incidents: List[IncidentResponse]
    total: int


# --- Image upload schemas ---
class ImageUploadResponse(BaseModel):
    url: str
    storage_key: str
    mime_type: str
    size_bytes: int


# --- Health check ---
class HealthResponse(BaseModel):
    ok: bool
    status: str
    service: str


# --- Generic API response ---
class ApiResponse(BaseModel):
    ok: bool
    data: Optional[Any] = None
    error: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)