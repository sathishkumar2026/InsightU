from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.analytics import FairnessOut, ModelPerformanceOut, DriftOut
from app.auth.deps import require_role

router = APIRouter()


@router.get("/fairness", response_model=FairnessOut)
def fairness(db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    return {
        "demographic_parity": {"group_a": 0.48, "group_b": 0.51},
        "disparate_impact": {"ratio": 0.94},
    }


@router.get("/model-performance", response_model=ModelPerformanceOut)
def model_performance(db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    return {
        "accuracy": 0.86,
        "precision": 0.82,
        "recall": 0.79,
        "early_risk_rate": 0.73,
        "explainability_confidence": 0.88,
    }


@router.get("/drift", response_model=DriftOut)
def drift(db: Session = Depends(get_db), user=Depends(require_role("admin", "faculty"))):
    return {"behavioral_drift_rate": 0.21, "flagged_students": 5}
