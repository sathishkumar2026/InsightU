import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.auth.deps import get_current_user, require_role

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads", "materials")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "pptx", "ppt", "txt", "xlsx", "xls", "csv", "png", "jpg", "jpeg"}


def _ext(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


@router.post("/upload")
async def upload_material(
    subject: str = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    visibility: str = Form("everyone"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(require_role("admin", "faculty")),
):
    ext = _ext(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"File type .{ext} not allowed. Accepted: {', '.join(sorted(ALLOWED_EXTENSIONS))}")

    if visibility not in ("everyone", "my_students"):
        visibility = "everyone"

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(400, "File too large. Maximum 20 MB.")

    safe_name = f"{uuid.uuid4().hex[:12]}_{file.filename}"
    path = os.path.join(UPLOAD_DIR, safe_name)
    with open(path, "wb") as f:
        f.write(content)

    material = models.StudyMaterial(
        faculty_id=user.id,
        faculty_name=user.name,
        subject=subject.strip(),
        title=title.strip(),
        description=description.strip() if description else None,
        filename=file.filename,
        file_path=path,
        file_type=ext,
        file_size=len(content),
        visibility=visibility,
        uploaded_at=datetime.utcnow(),
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return {
        "id": material.id,
        "title": material.title,
        "subject": material.subject,
        "filename": material.filename,
        "file_type": material.file_type,
        "file_size": material.file_size,
        "visibility": material.visibility,
    }


@router.get("/")
def list_materials(
    subject: str = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    For faculty/admin: return all materials (faculty sees their own).
    For students: return 'everyone' materials from assigned teachers +
                  'my_students' materials from assigned teachers.
    """
    q = db.query(models.StudyMaterial).order_by(models.StudyMaterial.uploaded_at.desc())

    if subject:
        q = q.filter(models.StudyMaterial.subject.ilike(f"%{subject}%"))

    if user.role == "student":
        # Get the student record
        student = db.query(models.Student).filter(models.Student.user_id == user.id).first()

        # Get assigned teacher IDs
        assigned_teacher_ids = set()
        if student:
            assignments = db.query(models.TeacherStudent.teacher_id).filter(
                models.TeacherStudent.student_id == student.id
            ).all()
            assigned_teacher_ids = {a[0] for a in assignments}

        all_mats = q.all()
        mats = []
        for m in all_mats:
            if not assigned_teacher_ids:
                # No assignments yet — show 'everyone' materials from all teachers
                if m.visibility == "everyone":
                    mats.append(m)
            else:
                # Has assignments — show materials only from assigned teachers
                if m.faculty_id in assigned_teacher_ids:
                    mats.append(m)
    elif user.role == "faculty":
        # Faculty sees only their own materials
        mats = q.filter(models.StudyMaterial.faculty_id == user.id).all()
    else:
        mats = q.all()

    return [
        {
            "id": m.id,
            "faculty_name": m.faculty_name,
            "subject": m.subject,
            "title": m.title,
            "description": m.description,
            "filename": m.filename,
            "file_type": m.file_type,
            "file_size": m.file_size,
            "visibility": m.visibility,
            "uploaded_at": m.uploaded_at.isoformat() if m.uploaded_at else None,
        }
        for m in mats
    ]


@router.get("/subjects")
def list_subjects(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(models.StudyMaterial.subject).distinct().all()
    return sorted(set(r[0] for r in rows))


@router.get("/{material_id}/download")
def download_material(material_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    m = db.query(models.StudyMaterial).filter(models.StudyMaterial.id == material_id).first()
    if not m:
        raise HTTPException(404, "Material not found")
    if not os.path.exists(m.file_path):
        raise HTTPException(404, "File missing from server")
    return FileResponse(m.file_path, filename=m.filename, media_type="application/octet-stream")


@router.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    m = db.query(models.StudyMaterial).filter(models.StudyMaterial.id == material_id).first()
    if not m:
        raise HTTPException(404, "Material not found")
    if m.faculty_id != user.id and user.role != "admin":
        raise HTTPException(403, "You can only delete your own materials")
    if os.path.exists(m.file_path):
        os.remove(m.file_path)
    db.delete(m)
    db.commit()
    return {"deleted": True, "id": material_id}
