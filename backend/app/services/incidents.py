"""Incidents service."""

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List, Optional, Tuple
from datetime import datetime
import uuid
from app.models import Incident, IncidentStatusHistory, Notification
from app.schemas import IncidentCreate, IncidentUpdate, DuplicateCheckRequest, DashboardStatsResponse


async def create_incident(db, reporter_id, data, risk_score, severity, assigned_dept_id, ai_confidence, ai_raw, duplicate_group_id=None, is_duplicate=False):
    incident = Incident(reporter_id=reporter_id, category=data.category, title=data.title, description=data.description, latitude=data.latitude, longitude=data.longitude, address=data.address, status="SUBMITTED", severity=severity, risk_score=risk_score, ai_confidence=ai_confidence, ai_raw=ai_raw, assigned_dept_id=assigned_dept_id, duplicate_group_id=duplicate_group_id, is_duplicate=is_duplicate)
    db.add(incident)
    await db.flush()
    await add_status_history(db, incident.id, None, "SUBMITTED", reporter_id, "Incident submitted")
    await create_notification(db, reporter_id, incident.id, "IN_APP", "SUBMITTED", {"incident_id": incident.id, "title": incident.title})
    return incident


async def get_incidents(db, reporter_id=None, status=None, category=None, department_id=None, skip=0, limit=20):
    query = select(Incident).options(selectinload(Incident.images), selectinload(Incident.assigned_dept_obj), selectinload(Incident.reporter))
    if reporter_id is not None:
        query = query.where(Incident.reporter_id == reporter_id)
    if status:
        query = query.where(Incident.status == status)
    if category:
        query = query.where(Incident.category == category)
    if department_id:
        query = query.where(Incident.assigned_dept_id == department_id)
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0
    query = query.order_by(desc(Incident.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all()), total


async def get_incident_by_id(db, incident_id):
    query = select(Incident).options(selectinload(Incident.images), selectinload(Incident.assigned_dept_obj), selectinload(Incident.reporter), selectinload(Incident.status_history)).where(Incident.id == incident_id)
    result = await db.execute(query)
    return result.scalars().first()


async def update_incident(db, incident, data):
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(incident, field, value)
    await db.flush()
    return incident


async def transition_status(db, incident, new_status, changed_by, note=None):
    valid = {"SUBMITTED": ["AI_ANALYZING", "UNDER_REVIEW", "REJECTED"], "AI_ANALYZING": ["UNDER_REVIEW", "ASSIGNED", "REJECTED"], "UNDER_REVIEW": ["ASSIGNED", "REJECTED"], "ASSIGNED": ["IN_PROGRESS", "REJECTED"], "IN_PROGRESS": ["REPAIR_SUBMITTED", "VERIFICATION", "ASSIGNED"], "REPAIR_SUBMITTED": ["VERIFICATION", "IN_PROGRESS"], "VERIFICATION": ["RESOLVED", "NEEDS_REVIEW", "IN_PROGRESS"], "NEEDS_REVIEW": ["ASSIGNED", "IN_PROGRESS", "REJECTED"], "RESOLVED": ["NEEDS_REVIEW"], "REJECTED": ["SUBMITTED", "ASSIGNED"]}
    if incident.status not in valid:
        raise ValueError(f"Invalid status: {incident.status}")
    if new_status not in valid[incident.status]:
        raise ValueError(f"Cannot transition {incident.status} -> {new_status}")
    old = incident.status
    incident.status = new_status
    await add_status_history(db, incident.id, old, new_status, changed_by, note)
    await create_notification(db, incident.reporter_id, incident.id, "IN_APP", new_status, {"incident_id": incident.id, "old_status": old, "new_status": new_status})
    return incident


async def add_status_history(db, incident_id, from_status, to_status, changed_by, note=None):
    h = IncidentStatusHistory(incident_id=incident_id, from_status=from_status, to_status=to_status, changed_by=changed_by, note=note)
    db.add(h)
    await db.flush()
    return h


async def create_notification(db, user_id, incident_id, channel, type_, payload):
    n = Notification(user_id=user_id, incident_id=incident_id, channel=channel, type=type_, payload=payload, status="PENDING")
    db.add(n)
    await db.flush()
    return n


async def check_duplicates(db, data):
    lat_r, lng_r = 0.00067, 0.00067 / 0.7
    query = select(Incident).where(Incident.category == data.category, Incident.latitude.between(data.latitude - lat_r, data.latitude + lat_r), Incident.longitude.between(data.longitude - lng_r, data.longitude + lng_r)).limit(10)
    result = await db.execute(query)
    matches = result.scalars().all()
    matched_ids = [m.id for m in matches]
    prob = 0.0
    if matches:
        prob = min(len(matches) * 0.2, 0.8)
        if data.title:
            tw = set(data.title.lower().split())
            for m in matches:
                if m.title:
                    mw = set(m.title.lower().split())
                    prob += len(tw & mw) / max(len(tw), 1) * 0.1
        prob = min(prob, 0.95)
    is_dup = prob >= data.similarity_threshold
    gid = None
    if is_dup and matches:
        for m in matches:
            if m.duplicate_group_id:
                gid = m.duplicate_group_id
                break
        if not gid:
            gid = uuid.uuid4()
    return {"is_duplicate": is_dup, "duplicate_group_id": gid, "probability": prob, "matched_count": len(matches), "matched_ids": matched_ids}


async def get_dashboard_stats(db):
    r1 = await db.execute(select(func.count(Incident.id)))
    total = r1.scalar() or 0
    r2 = await db.execute(select(Incident.severity, func.count(Incident.id)).group_by(Incident.severity))
    sev = dict(r2.all())
    r3 = await db.execute(select(Incident.status, func.count(Incident.id)).group_by(Incident.status))
    st = dict(r3.all())
    in_progress = sum(st.get(s, 0) for s in ["ASSIGNED", "IN_PROGRESS", "REPAIR_SUBMITTED", "VERIFICATION", "UNDER_REVIEW", "AI_ANALYZING"])
    resolved = st.get("RESOLVED", 0)
    r4 = await db.execute(select(func.avg(Incident.risk_score)))
    avg_risk = float(r4.scalar() or 0)
    r5 = await db.execute(select(Incident.category, func.count(Incident.id)).group_by(Incident.category))
    cats = dict(r5.all())
    return {"total_incidents": total, "critical_count": sev.get("CRITICAL", 0), "high_risk_count": sev.get("HIGH", 0), "in_progress_count": in_progress, "resolved_count": resolved, "average_risk_score": round(avg_risk, 1), "category_breakdown": cats}


async def get_priority_queue(db, limit=50):
    query = select(Incident).options(selectinload(Incident.assigned_dept_obj), selectinload(Incident.reporter)).where(Incident.status.in_(["SUBMITTED", "AI_ANALYZING", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "REPAIR_SUBMITTED", "VERIFICATION", "NEEDS_REVIEW"])).order_by(desc(Incident.risk_score)).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())
