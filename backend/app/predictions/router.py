from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.auth.deps import require_role
from app.schemas.predictions import PredictionOut, PredictionRunResponse
from app.ml.pipeline import predict_with_explainability
from app.utils.features import compute_features, to_dataframe
from app.utils.consistency import compute_flags, consistency_index_from_risk
import pandas as pd

router = APIRouter()


@router.delete("/clear")
def clear_predictions(db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    """Delete all predictions and explanations to start fresh."""
    expl_count = db.query(models.Explanation).delete()
    pred_count = db.query(models.Prediction).delete()
    db.commit()
    return {"deleted_predictions": pred_count, "deleted_explanations": expl_count}


@router.get("/me")
def get_my_prediction(db: Session = Depends(get_db), user=Depends(require_role("student", "admin", "faculty"))):
    """Get the logged-in student's own prediction."""
    student = db.query(models.Student).filter(models.Student.user_id == user.id).first()
    if not student:
        return {"error": "no_student", "message": "No student record linked to your account"}
    pred = db.query(models.Prediction).filter(
        models.Prediction.student_id == student.id
    ).order_by(models.Prediction.created_at.desc()).first()
    if not pred:
        return {"error": "no_prediction", "message": "No predictions generated yet. Ask your faculty to run predictions."}
    explanation = db.query(models.Explanation).filter(models.Explanation.prediction_id == pred.id).first()
    return {
        "id": pred.id,
        "student_id": pred.student_id,
        "consistency_index": pred.consistency_index,
        "risk_score": pred.risk_score,
        "flags": pred.flags,
        "explanation_id": explanation.id if explanation else 0,
        "summary_text": explanation.summary_text if explanation else None,
        "feature_contributions": explanation.feature_json if explanation else [],
        "rule_path": explanation.rule_path_json if explanation else [],
        "created_at": pred.created_at,
    }


def _load_frames(db: Session):
    academic = db.query(models.AcademicRecord).all()
    attendance = db.query(models.AttendanceRecord).all()
    behavioral = db.query(models.BehavioralLog).all()

    academic_df = pd.DataFrame([
        {"student_id": r.student_id, "subject": r.subject, "score": r.score, "term": r.term, "date": r.date}
        for r in academic
    ]) if academic else pd.DataFrame(columns=["student_id", "subject", "score", "term", "date"])

    attendance_df = pd.DataFrame([
        {"student_id": r.student_id, "attended": int(r.attended), "date": r.date}
        for r in attendance
    ]) if attendance else pd.DataFrame(columns=["student_id", "attended", "date"])

    behavioral_df = pd.DataFrame([
        {"student_id": r.student_id, "assignment_delay_days": r.assignment_delay_days, "lms_inactive_days": r.lms_inactive_days, "date": r.date}
        for r in behavioral
    ]) if behavioral else pd.DataFrame(columns=["student_id", "assignment_delay_days", "lms_inactive_days", "date"])

    return academic_df, attendance_df, behavioral_df


def _generate_for_student(db: Session, student_id: int):
    academic_df, attendance_df, behavioral_df = _load_frames(db)
    features = compute_features(academic_df, attendance_df, behavioral_df)
    df = to_dataframe(features)
    if df.empty:
        return None
    df = df[df["student_id"] == student_id]
    if df.empty:
        return None

    risk, contributions, paths, drift_flags = predict_with_explainability(df)
    risk_score = float(risk[0])
    consistency_index = consistency_index_from_risk(risk_score)

    row = df.iloc[0]
    flags = compute_flags(row.academic_variance, row.sudden_drop, row.attendance_trend, bool(drift_flags[0]))

    summary = _summary_text(row, contributions[0], flags)

    prediction = models.Prediction(
        student_id=student_id,
        consistency_index=consistency_index,
        risk_score=risk_score,
        flags=flags,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    explanation = models.Explanation(
        prediction_id=prediction.id,
        summary_text=summary,
        feature_json=contributions[0],
        rule_path_json=paths[0],
    )
    db.add(explanation)
    db.commit()
    db.refresh(explanation)

    return prediction, explanation


def _summary_text(row, contributions, flags):
    top = contributions[:3]
    parts = []
    for c in top:
        parts.append(f"{c['feature']} shows {c['direction']} impact")
    if row.attendance_trend < -0.1:
        parts.append("attendance declined recently")
    if row.sudden_drop > 15:
        parts.append("recent score drop detected")
    if row.academic_variance > 50:
        parts.append("scores are highly variable")
    if "behavioral_drift" in flags:
        parts.append("behavioral drift detected")
    return "This student was flagged because " + ", ".join(parts) + "."


@router.get("/{student_id}", response_model=PredictionOut)
def get_prediction(student_id: int, db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty", "student"))):
    pred = db.query(models.Prediction).filter(models.Prediction.student_id == student_id).order_by(models.Prediction.created_at.desc()).first()
    if not pred:
        result = _generate_for_student(db, student_id)
        if not result:
            return None
        pred, explanation = result
    explanation = db.query(models.Explanation).filter(models.Explanation.prediction_id == pred.id).first()
    return {
        "id": pred.id,
        "student_id": pred.student_id,
        "consistency_index": pred.consistency_index,
        "risk_score": pred.risk_score,
        "flags": pred.flags,
        "explanation_id": explanation.id if explanation else 0,
        "created_at": pred.created_at,
    }


@router.post("/run", response_model=PredictionRunResponse)
def run_predictions(db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    if user.role == "admin":
        students = db.query(models.Student).all()
    else:
        # Faculty: only their assigned students
        assigned = db.query(models.TeacherStudent.student_id).filter(
            models.TeacherStudent.teacher_id == user.id
        ).all()
        student_ids = [a[0] for a in assigned]
        students = db.query(models.Student).filter(models.Student.id.in_(student_ids)).all() if student_ids else []
    generated = 0
    student_ids_out = []
    for s in students:
        result = _generate_for_student(db, s.id)
        if result:
            generated += 1
            student_ids_out.append(s.id)
    return {"generated": generated, "student_ids": student_ids_out}

