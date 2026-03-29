from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.schemas.explanations import ExplanationOut, FeatureContribution
from app.auth.deps import require_role

router = APIRouter()


@router.get("/{prediction_id}", response_model=ExplanationOut)
def get_explanation(prediction_id: int, db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty", "student"))):
    exp = db.query(models.Explanation).filter(models.Explanation.prediction_id == prediction_id).first()
    if not exp:
        return None
    return {
        "id": exp.id,
        "prediction_id": exp.prediction_id,
        "summary_text": exp.summary_text,
        "feature_contributions": exp.feature_json,
        "decision_path": exp.rule_path_json,
    }
