from pydantic import BaseModel
from typing import List, Dict


class FeatureContribution(BaseModel):
    feature: str
    impact: float
    direction: str


class ExplanationOut(BaseModel):
    id: int
    prediction_id: int
    summary_text: str
    feature_contributions: List[FeatureContribution]
    decision_path: List[str]
