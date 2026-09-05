"""Incidents routes."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.dependencies import get_current_user, get_optional_user
from app.schemas import IncidentCreate, IncidentUpdate, StatusUpdate, DuplicateCheckRequest, AIClassifyRequest
from app.services.incidents import create_incident, get_incidents, get_incident_by_id, update_incident, transition_status, check_duplicates, get_dashboard_stats, get_priority_queue
from app.services.ai import classify_image, compute_risk_score
from app.services.storage import save_upload, ALLOWED_TYPES, MAX_SIZE
from app.services.auth import get_user_by_id
from app.models import User, IncidentImage
from sqlalchemy import select


router = APIRouter(prefix="/incidents", tags=["incidents"])


def safe_get(obj, attr, default=None):
    try:
        return getattr(obj, attr, default)
    except Exception:
        return default


def incident_to_dict(inc) -> dict:
    images_list = []
    try:
        for i in (inc.images or []):
            images_list.append({"id": i.id, "url": i.url, "kind": i.kind})
    except Exception:
        pass
    dept_dict = None
    try:
        if inc.assigned_dept_obj is not None:
            dept_dict = {"id": inc.assigned_dept_obj.id, "code": inc.assigned_dept_obj.code, "name": inc.assigned_dept_obj.name}
    except Exception:
        pass
    return {
        "id": inc.id, "reporter_id": inc.reporter_id, "category": inc.category, "title": inc.title,
        "description": inc.description, "latitude": inc.latitude, "longitude": inc.longitude,
        "address": inc.address, "status": inc.status, "severity": inc.severity,
        "risk_score": inc.risk_score, "risk_factors": safe_get(inc, "risk_factors"),
        "ai_confidence": safe_get(inc, "ai_confidence"),
        "ai_raw": safe_get(inc, "ai_raw"),
        "assigned_dept_id": safe_get(inc, "assigned_dept_id"),
        "is_duplicate": safe_get(inc, "is_duplicate", False),
        "verified": safe_get(inc, "verified", False),
        "created_at": inc.created_at.isoformat() if safe_get(inc, "created_at") else None,
        "updated_at": inc.updated_at.isoformat() if safe_get(inc, "updated_at") else None,
        "images": images_list, "assigned_dept": dept_dict
    }


@router.post("", response_model=dict)
async def create_incident_route(
    lat: float = Form(...), lng: float = Form(...), category: str = Form(...),
    title: str = Form(...), description: str = Form(""), address: str = Form(""),
    image: UploadFile = File(None), db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    reporter_id = user.id if user else 1
    ai_result = await classify_image(description=description, category_hint=category)
    risk_result = await compute_risk_score(category, ai_result["severity_hint"], description)
    inc = await create_incident(
        db, reporter_id,
        IncidentCreate(category=category, title=title, description=description, latitude=lat, longitude=lng, address=address),
        risk_score=risk_result["risk_score"], severity=risk_result["severity"],
        assigned_dept_id=1, ai_confidence=ai_result["confidence"], ai_raw=ai_result
    )
    if image and image.size and image.size <= MAX_SIZE:
        file_content = await image.read()
        try:
            saved = await save_upload(file_content, image.content_type, image.filename)
            img = IncidentImage(
                incident_id=inc.id, kind="BEFORE", url=saved["url"],
                storage_key=saved["storage_key"], mime_type=saved["mime_type"],
                size_bytes=saved["size_bytes"], uploaded_by=reporter_id
            )
            db.add(img)
        except Exception:
            pass
    try:
        await db.commit()
        await db.refresh(inc)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to persist incident") from exc
    return {"ok": True, "data": incident_to_dict(inc)}


@router.get("", response_model=dict)
async def list_incidents(
    status: str = None, category: str = None, skip: int = 0, limit: int = 20,
    db: AsyncSession = Depends(get_db), user: User = Depends(get_optional_user)
):
    reporter_id = user.id if user else None
    incidents, total = await get_incidents(db, reporter_id, status, category, skip=skip, limit=limit)
    return {"ok": True, "data": {"incidents": [incident_to_dict(i) for i in incidents], "total": total}}


@router.get("/mine", response_model=dict)
async def my_incidents(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    incidents, total = await get_incidents(db, reporter_id=user.id)
    return {"ok": True, "data": {"incidents": [incident_to_dict(i) for i in incidents], "total": total}}


@router.get("/{incident_id}", response_model=dict)
async def get_incident(incident_id: int, db: AsyncSession = Depends(get_db)):
    inc = await get_incident_by_id(db, incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"ok": True, "data": incident_to_dict(inc)}


@router.post("/{incident_id}/status", response_model=dict)
async def update_status(incident_id: int, data: StatusUpdate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    inc = await get_incident_by_id(db, incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    try:
        updated = await transition_status(db, inc, data.status, user.id, data.note)
        return {"ok": True, "data": incident_to_dict(updated)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
