from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.schemas.users import UserCreate, UserOut, UserMe
from app.utils.security import get_password_hash
from app.auth.deps import get_current_user, require_role

router = APIRouter()


# ── helpers ──────────────────────────────────────

def _log(db: Session, user, action: str, detail: str = ""):
    log = models.AuditLog(
        user_id=user.id if user else None,
        user_email=user.email if user else None,
        action=action,
        detail=detail[:500],
    )
    db.add(log)
    db.commit()


# ── existing ─────────────────────────────────────

@router.get("/me", response_model=UserMe)
def get_me(user=Depends(get_current_user)):
    return user


@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    return db.query(models.User).all()


# ── admin CRUD ───────────────────────────────────

class AdminUserCreate(BaseModel):
    name: str
    email: EmailStr
    role: str = "student"
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None


@router.post("/", response_model=UserOut)
def create_user(payload: AdminUserCreate, db: Session = Depends(get_db), admin=Depends(require_role("admin"))):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    if payload.role not in ("student", "faculty", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    user = models.User(
        name=payload.name,
        email=payload.email,
        role=payload.role,
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    if user.role == "student":
        student_profile = models.Student(user_id=user.id)
        db.add(student_profile)
        db.commit()
        
    _log(db, admin, "user_created", f"Created user {payload.email} with role {payload.role}")
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db), admin=Depends(require_role("admin"))):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    changes = []
    if payload.name:
        target.name = payload.name
        changes.append(f"name→{payload.name}")
    if payload.role:
        if payload.role not in ("student", "faculty", "admin"):
            raise HTTPException(status_code=400, detail="Invalid role")
        changes.append(f"role→{payload.role}")
        target.role = payload.role
    if payload.password:
        target.password_hash = get_password_hash(payload.password)
        changes.append("password changed")
    db.commit()
    db.refresh(target)
    _log(db, admin, "user_updated", f"Updated user #{user_id}: {', '.join(changes)}")
    return target


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin=Depends(require_role("admin"))):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    email = target.email
    db.delete(target)
    db.commit()
    _log(db, admin, "user_deleted", f"Deleted user {email}")
    return {"deleted": True, "user_id": user_id}


# ── audit log ────────────────────────────────────

@router.get("/audit-log")
def get_audit_log(db: Session = Depends(get_db), admin=Depends(require_role("admin"))):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).limit(100).all()
    return [
        {
            "id": l.id,
            "user_email": l.user_email,
            "action": l.action,
            "detail": l.detail,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        }
        for l in logs
    ]
