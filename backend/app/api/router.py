from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.incidents import router as incidents_router
from app.api.admin import router as admin_router
from app.api.public import router as public_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(incidents_router)
api_router.include_router(admin_router)
api_router.include_router(public_router)


@api_router.get("/health")
async def health_check():
    return {"ok": True, "status": "healthy", "service": "fixmycity"}
