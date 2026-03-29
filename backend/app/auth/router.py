from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.session import get_db
from app.db import models
from app.utils.security import verify_password, create_access_token, get_password_hash
from app.schemas.auth import Token
from app.config import settings

router = APIRouter()


class RefreshRequest(BaseModel):
    token: str


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"
    setup_key: Optional[str] = None


class SignupResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=user.email, role=user.role)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/signup", response_model=SignupResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # SECURITY: public signup is student-only.
    # Exception: setup key creates the FIRST admin (one-time bootstrap).
    # After an admin exists, the key is useless — use admin dashboard instead.
    assigned_role = "student"
    if payload.setup_key:
        admin_exists = db.query(models.User).filter(models.User.role == "admin").first()
        if admin_exists:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="An admin already exists. New faculty/admin accounts must be created by an admin from the dashboard."
            )
        if payload.setup_key != settings.admin_setup_key:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid setup key")
        assigned_role = "admin"

    user = models.User(
        name=payload.name,
        email=payload.email,
        role=assigned_role,
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if user.role == "student":
        student_profile = models.Student(user_id=user.id)
        db.add(student_profile)
        db.commit()

    token = create_access_token(subject=user.email, role=user.role)
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "access_token": token,
        "token_type": "bearer",
    }

@router.get("/setup-status")
def setup_status(db: Session = Depends(get_db)):
    admin_exists = db.query(models.User).filter(models.User.role == "admin").first() is not None
    return {"admin_exists": admin_exists}


@router.post("/refresh", response_model=Token)
def refresh(payload: RefreshRequest):
    return {"access_token": payload.token, "token_type": "bearer"}
