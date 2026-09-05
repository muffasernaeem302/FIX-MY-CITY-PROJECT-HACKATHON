"""Auth routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas import UserCreate, UserLogin, UserResponse
from app.services.auth import authenticate_user, create_user, create_access_token, get_user_by_email
from app.models import User


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=dict)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await create_user(db, data.email, data.password, data.full_name or "", data.role or "CITIZEN")
    token = create_access_token(user.id, user.role)
    return {"ok": True, "data": {"token": token, "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}}}


@router.post("/login", response_model=dict)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user.id, user.role)
    return {"ok": True, "data": {"token": token, "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}}}


@router.get("/me", response_model=dict)
async def me(user: User = Depends(get_current_user)):
    return {"ok": True, "data": {"id": user.id, "email": user.email, "full_name": user.full_name, "phone": user.phone, "role": user.role, "is_active": user.is_active, "created_at": user.created_at.isoformat() if user.created_at else None}}
