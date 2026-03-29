from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.auth.deps import get_current_user, require_role

router = APIRouter()


# ── Schemas ──────────────────────────────────────

class AssignRequest(BaseModel):
    teacher_id: int
    student_id: int
    subject: Optional[str] = None


class BulkAssignRequest(BaseModel):
    teacher_id: int
    student_ids: List[int]
    subject: Optional[str] = None


# ── helpers ──────────────────────────────────────

def _fmt_assignment(a, db: Session):
    teacher = db.query(models.User).filter(models.User.id == a.teacher_id).first()
    student = db.query(models.Student).filter(models.Student.id == a.student_id).first()
    student_user = None
    if student and student.user_id:
        student_user = db.query(models.User).filter(models.User.id == student.user_id).first()
    return {
        "id": a.id,
        "teacher_id": a.teacher_id,
        "teacher_name": teacher.name if teacher else "Unknown",
        "teacher_email": teacher.email if teacher else "",
        "student_id": a.student_id,
        "student_name": student_user.name if student_user else f"Student #{a.student_id}",
        "student_email": student_user.email if student_user else "",
        "student_program": student.program if student else None,
        "student_cohort": student.cohort if student else None,
        "subject": a.subject,
        "assigned_at": a.assigned_at.isoformat() if a.assigned_at else None,
    }


# ── Admin endpoints ─────────────────────────────

@router.get("/")
def list_assignments(db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    """List all teacher-student assignments."""
    assignments = db.query(models.TeacherStudent).order_by(models.TeacherStudent.assigned_at.desc()).all()
    return [_fmt_assignment(a, db) for a in assignments]


@router.get("/teachers")
def list_teachers(db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    """List all faculty users with their assignment counts."""
    teachers = db.query(models.User).filter(models.User.role == "faculty").all()
    result = []
    for t in teachers:
        count = db.query(models.TeacherStudent).filter(models.TeacherStudent.teacher_id == t.id).count()
        result.append({
            "id": t.id,
            "name": t.name,
            "email": t.email,
            "student_count": count,
        })
    return result


@router.get("/teacher/{teacher_id}/students")
def get_teacher_students(teacher_id: int, db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    """Get all students assigned to a specific teacher."""
    assignments = db.query(models.TeacherStudent).filter(
        models.TeacherStudent.teacher_id == teacher_id
    ).all()
    assigned_student_ids = [a.student_id for a in assignments]

    # Build student info
    students_assigned = []
    for a in assignments:
        student = db.query(models.Student).filter(models.Student.id == a.student_id).first()
        student_user = None
        if student and student.user_id:
            student_user = db.query(models.User).filter(models.User.id == student.user_id).first()
        students_assigned.append({
            "assignment_id": a.id,
            "student_id": a.student_id,
            "name": student_user.name if student_user else f"Student #{a.student_id}",
            "email": student_user.email if student_user else "",
            "program": student.program if student else None,
            "cohort": student.cohort if student else None,
            "subject": a.subject,
        })

    # Also return unassigned students (not assigned to this teacher)
    all_students = db.query(models.Student).all()
    unassigned = []
    for s in all_students:
        if s.id not in assigned_student_ids:
            s_user = None
            if s.user_id:
                s_user = db.query(models.User).filter(models.User.id == s.user_id).first()
            unassigned.append({
                "student_id": s.id,
                "name": s_user.name if s_user else f"Student #{s.id}",
                "email": s_user.email if s_user else "",
                "program": s.program,
                "cohort": s.cohort,
            })

    return {"assigned": students_assigned, "unassigned": unassigned}


@router.post("/")
def assign_student(payload: AssignRequest, db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    """Assign a single student to a teacher."""
    # Check teacher exists and is faculty
    teacher = db.query(models.User).filter(models.User.id == payload.teacher_id, models.User.role == "faculty").first()
    if not teacher:
        raise HTTPException(404, "Faculty user not found")
    # Check student exists
    student = db.query(models.Student).filter(models.Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")
    # Check duplicates
    existing = db.query(models.TeacherStudent).filter(
        models.TeacherStudent.teacher_id == payload.teacher_id,
        models.TeacherStudent.student_id == payload.student_id,
    ).first()
    if existing:
        raise HTTPException(400, "Student is already assigned to this teacher")

    assignment = models.TeacherStudent(
        teacher_id=payload.teacher_id,
        student_id=payload.student_id,
        subject=payload.subject.strip() if payload.subject else None,
        assigned_at=datetime.utcnow(),
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return _fmt_assignment(assignment, db)


@router.post("/bulk")
def bulk_assign(payload: BulkAssignRequest, db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    """Bulk assign multiple students to a teacher."""
    teacher = db.query(models.User).filter(models.User.id == payload.teacher_id, models.User.role == "faculty").first()
    if not teacher:
        raise HTTPException(404, "Faculty user not found")

    created, skipped = 0, 0
    for sid in payload.student_ids:
        existing = db.query(models.TeacherStudent).filter(
            models.TeacherStudent.teacher_id == payload.teacher_id,
            models.TeacherStudent.student_id == sid,
        ).first()
        if existing:
            skipped += 1
            continue
        student = db.query(models.Student).filter(models.Student.id == sid).first()
        if not student:
            skipped += 1
            continue
        assignment = models.TeacherStudent(
            teacher_id=payload.teacher_id,
            student_id=sid,
            subject=payload.subject.strip() if payload.subject else None,
            assigned_at=datetime.utcnow(),
        )
        db.add(assignment)
        created += 1

    db.commit()
    return {"created": created, "skipped": skipped, "teacher_id": payload.teacher_id}


@router.delete("/{assignment_id}")
def remove_assignment(assignment_id: int, db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    """Remove a teacher-student assignment."""
    a = db.query(models.TeacherStudent).filter(models.TeacherStudent.id == assignment_id).first()
    if not a:
        raise HTTPException(404, "Assignment not found")
    db.delete(a)
    db.commit()
    return {"deleted": True, "id": assignment_id}


# ── Self-query endpoints (faculty / student) ────

@router.get("/my-students")
def get_my_students(db: Session = Depends(get_db), user=Depends(require_role("faculty", "admin"))):
    """Get students assigned to the current faculty member."""
    if user.role == "admin":
        # Admins see all students
        all_students = db.query(models.Student).all()
        result = []
        for s in all_students:
            s_user = db.query(models.User).filter(models.User.id == s.user_id).first() if s.user_id else None
            result.append({
                "id": s.id,
                "user_id": s.user_id,
                "name": s_user.name if s_user else f"Student #{s.id}",
                "email": s_user.email if s_user else "",
                "cohort": s.cohort,
                "program": s.program,
                "enrollment_date": str(s.enrollment_date) if s.enrollment_date else None,
            })
        return result

    assignments = db.query(models.TeacherStudent).filter(
        models.TeacherStudent.teacher_id == user.id
    ).all()
    student_ids = [a.student_id for a in assignments]
    students = db.query(models.Student).filter(models.Student.id.in_(student_ids)).all() if student_ids else []

    result = []
    for s in students:
        s_user = db.query(models.User).filter(models.User.id == s.user_id).first() if s.user_id else None
        result.append({
            "id": s.id,
            "user_id": s.user_id,
            "name": s_user.name if s_user else f"Student #{s.id}",
            "email": s_user.email if s_user else "",
            "cohort": s.cohort,
            "program": s.program,
            "enrollment_date": str(s.enrollment_date) if s.enrollment_date else None,
        })
    return result


@router.get("/my-teachers")
def get_my_teachers(db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Get teachers assigned to the current student."""
    student = db.query(models.Student).filter(models.Student.user_id == user.id).first()
    if not student:
        return []
    assignments = db.query(models.TeacherStudent).filter(
        models.TeacherStudent.student_id == student.id
    ).all()
    teacher_ids = [a.teacher_id for a in assignments]
    teachers = db.query(models.User).filter(models.User.id.in_(teacher_ids)).all() if teacher_ids else []
    return [{"id": t.id, "name": t.name, "email": t.email} for t in teachers]
