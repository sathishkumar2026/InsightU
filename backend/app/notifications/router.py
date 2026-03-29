from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.auth.deps import require_role

router = APIRouter()


@router.get("/")
def list_alerts(db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    alerts = db.query(models.Alert).order_by(models.Alert.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "student_id": a.student_id,
            "severity": a.severity,
            "message": a.message,
            "created_at": a.created_at,
        }
        for a in alerts
    ]
