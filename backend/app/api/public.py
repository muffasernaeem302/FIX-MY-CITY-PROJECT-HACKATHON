"""Public routes (no auth required)."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Department
from app.services.incidents import get_dashboard_stats


router = APIRouter(prefix="/public", tags=["public"])


@router.get("/departments", response_model=dict)
async def list_departments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Department).order_by(Department.name))
    depts = result.scalars().all()
    return {"ok": True, "data": [{"id": d.id, "code": d.code, "name": d.name, "contact_email": d.contact_email} for d in depts]}


@router.get("/categories", response_model=dict)
async def list_categories():
    cats = [{"code": "POTHOLE_ROAD_DAMAGE", "label": "Pothole / Road Damage", "department": "ROADS"}, {"code": "BROKEN_STREETLIGHT", "label": "Broken Streetlight", "department": "LIGHTING"}, {"code": "GARBAGE_ACCUMULATION", "label": "Garbage Accumulation", "department": "WASTE"}, {"code": "WATER_LEAKAGE", "label": "Water Leakage", "department": "WATER"}]
    return {"ok": True, "data": cats}


@router.get("/dashboard/stats", response_model=dict)
async def public_dashboard_stats(db: AsyncSession = Depends(get_db)):
    stats = await get_dashboard_stats(db)
    return {"ok": True, "data": stats}
