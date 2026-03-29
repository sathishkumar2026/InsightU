from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.schemas.interventions import InterventionCreate, InterventionOut
from app.auth.deps import require_role

router = APIRouter()


@router.get("/{student_id}", response_model=list[InterventionOut])
def list_interventions(student_id: int, db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty", "student"))):
    return db.query(models.Intervention).filter(models.Intervention.student_id == student_id).all()


@router.post("/{student_id}", response_model=InterventionOut)
def create_intervention(student_id: int, payload: InterventionCreate, db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    item = models.Intervention(student_id=student_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
