"""Admin routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import require_admin
from app.schemas import IncidentUpdate
from app.services.incidents import get_incident_by_id, update_incident, get_dashboard_stats, get_priority_queue
from app.models import User


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard/stats", response_model=dict)
async def dashboard_stats(db: AsyncSession = Depends(get_db), user: User = Depends(require_admin)):
    stats = await get_dashboard_stats(db)
    return {"ok": True, "data": stats}


@router.get("/priority-queue", response_model=dict)
async def priority_queue(limit: int = 50, db: AsyncSession = Depends(get_db), user: User = Depends(require_admin)):
    queue = await get_priority_queue(db, limit)
    return {"ok": True, "data": [incident_to_dict(i) for i in queue]}


@router.patch("/incidents/{incident_id}", response_model=dict)
async def admin_update_incident(incident_id: int, data: IncidentUpdate, db: AsyncSession = Depends(get_db), user: User = Depends(require_admin)):
    inc = await get_incident_by_id(db, incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    updated = await update_incident(db, inc, data)
    await db.commit()
    return {"ok": True, "data": incident_to_dict(updated)}


def incident_to_dict(inc) -> dict:
    return {"id": inc.id, "reporter_id": inc.reporter_id, "category": inc.category, "title": inc.title, "description": inc.description, "latitude": inc.latitude, "longitude": inc.longitude, "address": inc.address, "status": inc.status, "severity": inc.severity, "risk_score": inc.risk_score, "risk_factors": inc.risk_factors, "ai_confidence": inc.ai_confidence, "ai_raw": inc.ai_raw, "assigned_dept_id": inc.assigned_dept_id, "is_duplicate": inc.is_duplicate, "verified": inc.verified, "created_at": inc.created_at.isoformat() if inc.created_at else None, "updated_at": inc.updated_at.isoformat() if inc.updated_at else None, "images": [{"id": i.id, "url": i.url, "kind": i.kind} for i in (inc.images or [])], "assigned_dept": {"id": inc.assigned_dept_obj.id, "code": inc.assigned_dept_obj.code, "name": inc.assigned_dept_obj.name} if inc.assigned_dept_obj else None}
