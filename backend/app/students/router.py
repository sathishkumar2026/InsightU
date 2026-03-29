import csv
import io
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.schemas.students import StudentCreate, StudentOut
from app.auth.deps import require_role
from app.utils.db_connector import build_url, test_connection, get_table_columns, fetch_table

router = APIRouter()


# ── existing endpoints ──────────────────────────

class StudentCreateBody(BaseModel):
    cohort: Optional[str] = None
    program: Optional[str] = None
    enrollment_date: Optional[str] = None
    user_email: Optional[str] = None  # optional: link to an existing user


@router.post("/")
def create_student(payload: StudentCreateBody, db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    enrollment = None
    if payload.enrollment_date:
        try:
            enrollment = datetime.fromisoformat(payload.enrollment_date).date()
        except:
            pass

    user_id = None
    if payload.user_email:
        linked_user = db.query(models.User).filter(models.User.email == payload.user_email).first()
        if linked_user:
            user_id = linked_user.id

    student = models.Student(
        cohort=payload.cohort,
        program=payload.program,
        enrollment_date=enrollment,
        user_id=user_id,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return {
        "id": student.id,
        "cohort": student.cohort,
        "program": student.program,
        "enrollment_date": student.enrollment_date,
        "user_id": student.user_id,
    }


class LinkStudentBody(BaseModel):
    user_email: str


@router.post("/{student_id}/link")
def link_student_to_user(student_id: int, payload: LinkStudentBody, db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    """Link an existing student record to a user account by email."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    linked_user = db.query(models.User).filter(models.User.email == payload.user_email).first()
    if not linked_user:
        raise HTTPException(status_code=404, detail=f"No user found with email {payload.user_email}")
    student.user_id = linked_user.id
    db.commit()
    return {"message": f"Student #{student_id} linked to {payload.user_email}", "student_id": student_id, "user_id": linked_user.id}


@router.get("/", response_model=list[StudentOut])
def list_students(db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    if user.role == "admin":
        return db.query(models.Student).all()
    # Faculty: only assigned students
    assigned = db.query(models.TeacherStudent.student_id).filter(
        models.TeacherStudent.teacher_id == user.id
    ).all()
    student_ids = [a[0] for a in assigned]
    if not student_ids:
        return []
    return db.query(models.Student).filter(models.Student.id.in_(student_ids)).all()


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty", "student"))):
    return db.query(models.Student).filter(models.Student.id == student_id).first()


# ── CSV upload ──────────────────────────────────

@router.post("/upload-csv")
async def upload_students_csv(file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    """Upload a CSV file to bulk-create students.
    Expected columns: cohort, program, enrollment_date
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted")

    content = await file.read()
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    created, skipped, errors = 0, 0, []
    for i, row in enumerate(reader, start=2):
        try:
            enrollment = None
            if row.get("enrollment_date"):
                enrollment = datetime.fromisoformat(row["enrollment_date"].strip()).date()
            student = models.Student(
                cohort=row.get("cohort", "").strip() or None,
                program=row.get("program", "").strip() or None,
                enrollment_date=enrollment,
            )
            db.add(student)
            created += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)[:100]}")
            skipped += 1

    db.commit()
    return {"created": created, "skipped": skipped, "errors": errors}


# ── Database connector ──────────────────────────

class DBConnectRequest(BaseModel):
    db_type: str          # mysql | postgresql | sqlite
    host: str = "localhost"
    port: int = 3306
    database: str
    username: str = ""
    password: str = ""


class DBImportRequest(DBConnectRequest):
    table_name: str
    col_cohort: Optional[str] = None
    col_program: Optional[str] = None
    col_enrollment_date: Optional[str] = None


@router.post("/test-db")
def test_db_connection(payload: DBConnectRequest, user=Depends(require_role("admin", "faculty"))):
    """Test connection to an external college database."""
    try:
        url = build_url(payload.db_type, payload.host, payload.port, payload.database, payload.username, payload.password)
        result = test_connection(url)
        return result
    except ValueError as e:
        return {"success": False, "tables": [], "error": str(e)}


@router.post("/db-tables-columns")
def get_db_table_columns(payload: DBConnectRequest, table_name: str, user=Depends(require_role("admin", "faculty"))):
    """Get columns for a specific table in the external DB."""
    url = build_url(payload.db_type, payload.host, payload.port, payload.database, payload.username, payload.password)
    columns = get_table_columns(url, table_name)
    return {"table": table_name, "columns": columns}


@router.post("/import-db")
def import_from_db(payload: DBImportRequest, db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    """Import students from an external college database table."""
    url = build_url(payload.db_type, payload.host, payload.port, payload.database, payload.username, payload.password)
    df = fetch_table(url, payload.table_name)

    created, errors = 0, []
    for i, row in df.iterrows():
        try:
            enrollment = None
            if payload.col_enrollment_date and payload.col_enrollment_date in row:
                val = row[payload.col_enrollment_date]
                if val and str(val).strip():
                    enrollment = datetime.fromisoformat(str(val).strip()).date()

            student = models.Student(
                cohort=str(row[payload.col_cohort]).strip() if payload.col_cohort and payload.col_cohort in row else None,
                program=str(row[payload.col_program]).strip() if payload.col_program and payload.col_program in row else None,
                enrollment_date=enrollment,
            )
            db.add(student)
            created += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)[:100]}")

    db.commit()
    return {"created": created, "total_rows": len(df), "errors": errors}
