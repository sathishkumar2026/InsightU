from pydantic import BaseModel
from typing import Dict


class FairnessOut(BaseModel):
    demographic_parity: Dict
    disparate_impact: Dict


class ModelPerformanceOut(BaseModel):
    accuracy: float
    precision: float
    recall: float
    early_risk_rate: float
    explainability_confidence: float


class DriftOut(BaseModel):
    behavioral_drift_rate: float
    flagged_students: int
