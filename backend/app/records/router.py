import csv
import io
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.schemas.records import AcademicRecordCreate, AttendanceRecordCreate, BehavioralLogCreate
from app.auth.deps import require_role
from app.utils.db_connector import build_url, fetch_table

router = APIRouter()


@router.delete("/clear")
def clear_all_records(db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    """Delete ALL data: explanations, predictions, interventions, alerts, records, and students."""
    # Delete in FK-safe order (children first)
    e = db.query(models.Explanation).delete()
    p = db.query(models.Prediction).delete()
    i = db.query(models.Intervention).delete()
    al = db.query(models.Alert).delete()
    a = db.query(models.AcademicRecord).delete()
    b = db.query(models.AttendanceRecord).delete()
    c = db.query(models.BehavioralLog).delete()
    s = db.query(models.Student).delete()
    db.commit()
    return {
        "deleted_students": s,
        "deleted_academic": a,
        "deleted_attendance": b,
        "deleted_behavioral": c,
        "deleted_predictions": p,
        "deleted_explanations": e,
    }


# ── student's own records ────────────

from app.auth.deps import get_current_user

@router.get("/me")
def get_my_records(db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Get the logged-in student's own academic, attendance, and behavioral records."""
    student = db.query(models.Student).filter(models.Student.user_id == user.id).first()
    if not student:
        return {"error": "no_student", "academic": [], "attendance": [], "behavioral": []}
    
    academic = db.query(models.AcademicRecord).filter(
        models.AcademicRecord.student_id == student.id
    ).order_by(models.AcademicRecord.date.desc()).all()
    
    attendance = db.query(models.AttendanceRecord).filter(
        models.AttendanceRecord.student_id == student.id
    ).order_by(models.AttendanceRecord.date.desc()).all()
    
    behavioral = db.query(models.BehavioralLog).filter(
        models.BehavioralLog.student_id == student.id
    ).order_by(models.BehavioralLog.date.desc()).all()
    
    return {
        "student_id": student.id,
        "cohort": student.cohort,
        "program": student.program,
        "academic": [
            {"id": r.id, "subject": r.subject, "score": r.score, "term": r.term, "date": str(r.date)}
            for r in academic
        ],
        "attendance": [
            {"id": r.id, "attended": r.attended, "date": str(r.date)}
            for r in attendance
        ],
        "behavioral": [
            {"id": r.id, "assignment_delay_days": r.assignment_delay_days, "lms_inactive_days": r.lms_inactive_days, "date": str(r.date)}
            for r in behavioral
        ],
        "summary": {
            "total_academic": len(academic),
            "avg_score": round(sum(r.score for r in academic) / len(academic), 1) if academic else 0,
            "total_attendance": len(attendance),
            "attendance_rate": round(sum(1 for r in attendance if r.attended) / len(attendance) * 100, 1) if attendance else 0,
            "avg_delay": round(sum(r.assignment_delay_days for r in behavioral) / len(behavioral), 1) if behavioral else 0,
            "avg_inactive": round(sum(r.lms_inactive_days for r in behavioral) / len(behavioral), 1) if behavioral else 0,
        }
    }


# ── existing single-record endpoints ────────────

@router.post("/academic")
def add_academic(payload: AcademicRecordCreate, db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    record = models.AcademicRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/attendance")
def add_attendance(payload: AttendanceRecordCreate, db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    record = models.AttendanceRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/behavioral")
def add_behavioral(payload: BehavioralLogCreate, db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    record = models.BehavioralLog(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# ── CSV upload (bulk) ───────────────────────────

@router.post("/upload-csv")
async def upload_records_csv(
    record_type: str = Query(..., description="academic | attendance | behavioral"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(require_role("admin", "faculty")),
):
    """Upload a CSV file to bulk-create records.
    Expected columns per type:
      academic:   student_id, subject, score, term, date
      attendance: student_id, attended, date
      behavioral: student_id, assignment_delay_days, lms_inactive_days, date
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted")
    if record_type not in ("academic", "attendance", "behavioral"):
        raise HTTPException(status_code=400, detail="record_type must be academic, attendance, or behavioral")

    content = await file.read()
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    created, errors = 0, []
    for i, row in enumerate(reader, start=2):
        try:
            if record_type == "academic":
                rec = models.AcademicRecord(
                    student_id=int(row["student_id"]),
                    subject=row["subject"].strip(),
                    score=float(row["score"]),
                    term=row.get("term", "").strip(),
                    date=datetime.fromisoformat(row["date"].strip()).date(),
                )
            elif record_type == "attendance":
                rec = models.AttendanceRecord(
                    student_id=int(row["student_id"]),
                    attended=bool(int(row["attended"])),
                    date=datetime.fromisoformat(row["date"].strip()).date(),
                )
            else:
                rec = models.BehavioralLog(
                    student_id=int(row["student_id"]),
                    assignment_delay_days=int(row["assignment_delay_days"]),
                    lms_inactive_days=int(row["lms_inactive_days"]),
                    date=datetime.fromisoformat(row["date"].strip()).date(),
                )
            db.add(rec)
            created += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)[:100]}")

    db.commit()
    return {"created": created, "errors": errors, "record_type": record_type}


# ── Database import ─────────────────────────────

class RecordDBImportRequest(BaseModel):
    db_type: str
    host: str = "localhost"
    port: int = 3306
    database: str
    username: str = ""
    password: str = ""
    record_type: str   # academic | attendance | behavioral
    table_name: str
    # Column mappings
    col_student_id: str
    col_subject: Optional[str] = None
    col_score: Optional[str] = None
    col_term: Optional[str] = None
    col_attended: Optional[str] = None
    col_assignment_delay: Optional[str] = None
    col_lms_inactive: Optional[str] = None
    col_date: str = "date"


@router.post("/import-db")
def import_records_from_db(payload: RecordDBImportRequest, db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    """Import records from an external college database table."""
    url = build_url(payload.db_type, payload.host, payload.port, payload.database, payload.username, payload.password)
    df = fetch_table(url, payload.table_name)

    created, errors = 0, []
    for i, row in df.iterrows():
        try:
            rec_date = datetime.fromisoformat(str(row[payload.col_date]).strip()).date()
            sid = int(row[payload.col_student_id])

            if payload.record_type == "academic":
                rec = models.AcademicRecord(
                    student_id=sid,
                    subject=str(row.get(payload.col_subject, "")).strip(),
                    score=float(row.get(payload.col_score, 0)),
                    term=str(row.get(payload.col_term, "")).strip(),
                    date=rec_date,
                )
            elif payload.record_type == "attendance":
                rec = models.AttendanceRecord(
                    student_id=sid,
                    attended=bool(int(row.get(payload.col_attended, 0))),
                    date=rec_date,
                )
            else:
                rec = models.BehavioralLog(
                    student_id=sid,
                    assignment_delay_days=int(row.get(payload.col_assignment_delay, 0)),
                    lms_inactive_days=int(row.get(payload.col_lms_inactive, 0)),
                    date=rec_date,
                )
            db.add(rec)
            created += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)[:100]}")

    db.commit()
    return {"created": created, "total_rows": len(df), "errors": errors, "record_type": payload.record_type}
