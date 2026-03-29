from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime


class PredictionOut(BaseModel):
    id: int
    student_id: int
    consistency_index: float
    risk_score: float
    flags: List[str]
    explanation_id: int
    created_at: datetime


class PredictionRunResponse(BaseModel):
    generated: int
    student_ids: List[int]
